<?php

namespace App\Services;

use App\Models\AnalyticsReport;
use App\Models\DashboardWidget;
use App\Models\BusinessInsight;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class AnalyticsService
{
    public function generateInventorySummaryReport(array $filters = []): array
    {
        $data = [
            'total_products' => $this->getTotalProducts($filters),
            'total_stock_value' => $this->getTotalStockValue($filters),
            'low_stock_items' => $this->getLowStockCount($filters),
            'warehouse_distribution' => $this->getWarehouseDistribution($filters),
            'top_products' => $this->getTopProductsByValue($filters),
            'movement_trends' => $this->getMovementTrends($filters)
        ];

        return [
            'data' => $data,
            'summary_stats' => [
                'total_value' => $data['total_stock_value'],
                'total_items' => $data['total_products'],
                'critical_alerts' => $data['low_stock_items']
            ]
        ];
    }

    public function generateStockMovementReport(array $filters = []): array
    {
        $movements = DB::table('stock_movements')
            ->selectRaw('
                DATE(created_at) as date,
                type,
                COUNT(*) as count,
                SUM(quantity) as total_quantity
            ')
            ->when($filters['date_from'] ?? null, fn($q, $date) => 
                $q->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn($q, $date) => 
                $q->whereDate('created_at', '<=', $date))
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        return [
            'data' => $movements->groupBy('date'),
            'summary_stats' => [
                'total_movements' => $movements->sum('count'),
                'total_quantity' => $movements->sum('total_quantity')
            ]
        ];
    }

    public function getExecutiveDashboardWidgets(): Collection
    {
        return DashboardWidget::active()
            ->byDashboard(DashboardWidget::DASHBOARD_EXECUTIVE)
            ->ordered()
            ->get()
            ->map(function ($widget) {
                if ($widget->isDataStale()) {
                    $widget->cached_data = $this->refreshWidgetData($widget);
                    $widget->data_cached_at = now();
                    $widget->save();
                }
                return $widget;
            });
    }

    public function detectAnomalies(): Collection
    {
        $insights = collect();

        // Stock level anomalies
        $lowStockProducts = $this->detectLowStockAnomalies();
        $insights = $insights->merge($lowStockProducts);

        // Movement anomalies
        $movementAnomalies = $this->detectMovementAnomalies();
        $insights = $insights->merge($movementAnomalies);

        return $insights;
    }

    private function getTotalProducts(array $filters): int
    {
        return DB::table('products')
            ->when($filters['category_id'] ?? null, fn($q, $id) => 
                $q->where('category_id', $id))
            ->count();
    }

    private function getTotalStockValue(array $filters): float
    {
        return DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->when($filters['warehouse_id'] ?? null, fn($q, $id) => 
                $q->where('inventories.warehouse_id', $id))
            ->sum(DB::raw('inventories.quantity * products.unit_cost'));
    }

    private function getLowStockCount(array $filters): int
    {
        return DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->whereRaw('inventories.quantity <= products.reorder_point')
            ->when($filters['warehouse_id'] ?? null, fn($q, $id) => 
                $q->where('inventories.warehouse_id', $id))
            ->count();
    }

    private function getWarehouseDistribution(array $filters): Collection
    {
        return DB::table('inventories')
            ->join('warehouses', 'inventories.warehouse_id', '=', 'warehouses.id')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->selectRaw('
                warehouses.name,
                COUNT(inventories.id) as product_count,
                SUM(inventories.quantity) as total_quantity,
                SUM(inventories.quantity * products.unit_cost) as total_value
            ')
            ->groupBy('warehouses.id', 'warehouses.name')
            ->get();
    }

    private function getTopProductsByValue(array $filters, int $limit = 10): Collection
    {
        return DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->selectRaw('
                products.name,
                products.sku,
                SUM(inventories.quantity) as total_quantity,
                SUM(inventories.quantity * products.unit_cost) as total_value
            ')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('total_value')
            ->limit($limit)
            ->get();
    }

    private function getMovementTrends(array $filters): Collection
    {
        return DB::table('stock_movements')
            ->selectRaw('
                DATE(created_at) as date,
                SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END) as total_in,
                SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END) as total_out
            ')
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    private function refreshWidgetData(DashboardWidget $widget): array
    {
        return match($widget->data_source) {
            'inventory_levels' => $this->getInventoryLevelsData($widget),
            'stock_movements' => $this->getStockMovementsData($widget),
            'financial_metrics' => $this->getFinancialMetricsData($widget),
            default => []
        };
    }

    private function getInventoryLevelsData(DashboardWidget $widget): array
    {
        return [
            'total_products' => DB::table('products')->count(),
            'total_inventory_value' => $this->getTotalStockValue([]),
            'low_stock_count' => $this->getLowStockCount([]),
            'warehouses_count' => DB::table('warehouses')->count()
        ];
    }

    private function getStockMovementsData(DashboardWidget $widget): array
    {
        return [
            'today_movements' => DB::table('stock_movements')->whereDate('created_at', today())->count(),
            'week_movements' => DB::table('stock_movements')->whereBetween('created_at', [now()->startOfWeek(), now()])->count(),
            'pending_transfers' => DB::table('stock_transfers')->where('status', 'pending')->count()
        ];
    }

    private function getFinancialMetricsData(DashboardWidget $widget): array
    {
        return [
            'total_purchase_orders' => DB::table('purchase_orders')->sum('total_amount'),
            'total_sales_orders' => DB::table('sales_orders')->sum('total_amount'),
            'inventory_value' => $this->getTotalStockValue([])
        ];
    }

    private function detectLowStockAnomalies(): Collection
    {
        return DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->join('warehouses', 'inventories.warehouse_id', '=', 'warehouses.id')
            ->whereRaw('inventories.quantity <= products.reorder_point')
            ->select(
                'products.name as product_name',
                'warehouses.name as warehouse_name',
                'inventories.quantity',
                'products.reorder_point'
            )
            ->get()
            ->map(function ($item) {
                return [
                    'type' => BusinessInsight::TYPE_PERFORMANCE_ALERT,
                    'severity' => $item->quantity == 0 ? 'critical' : 'high',
                    'category' => 'stock_levels',
                    'title' => "Low stock alert: {$item->product_name}",
                    'description' => "Product {$item->product_name} in {$item->warehouse_name} has {$item->quantity} units, below reorder point of {$item->reorder_point}",
                    'current_value' => $item->quantity,
                    'threshold_value' => $item->reorder_point,
                    'urgency' => 'high'
                ];
            });
    }

    private function detectMovementAnomalies(): Collection
    {
        $avgDaily = DB::table('stock_movements')
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->selectRaw('AVG(daily_count) as avg_count')
            ->fromSub(function ($query) {
                $query->selectRaw('DATE(created_at) as date, COUNT(*) as daily_count')
                      ->from('stock_movements')
                      ->groupBy('date');
            }, 'daily_movements')
            ->value('avg_count');

        $todayCount = DB::table('stock_movements')->whereDate('created_at', today())->count();

        if ($todayCount > $avgDaily * 2) {
            return collect([[
                'type' => BusinessInsight::TYPE_ANOMALY_DETECTION,
                'severity' => 'medium',
                'category' => 'warehouse_operations',
                'title' => 'Unusual stock movement activity detected',
                'description' => "Today's stock movements ({$todayCount}) are significantly higher than the 30-day average ({$avgDaily})",
                'current_value' => $todayCount,
                'threshold_value' => $avgDaily,
                'urgency' => 'medium'
            ]]);
        }

        return collect();
    }
}