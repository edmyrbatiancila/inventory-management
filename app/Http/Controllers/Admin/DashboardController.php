<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DashboardWidget;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function index(Request $request)
    {
        $dashboardType = $request->input('dashboard', DashboardWidget::DASHBOARD_OPERATIONAL);
        
        $widgets = DashboardWidget::active()
            ->byDashboard($dashboardType)
            ->ordered()
            ->with(['createdBy'])
            ->get()
            ->map(function ($widget) {
                if ($widget->isDataStale()) {
                    $widget->cached_data = $this->refreshWidgetData($widget);
                    $widget->data_cached_at = now();
                    $widget->save();
                }
                return $widget;
            });

        return Inertia::render('Admin/Dashboard/Index', [
            'widgets' => $widgets,
            'dashboardType' => $dashboardType,
            'dashboardTypes' => $this->getDashboardTypes()
        ]);
    }

    public function widgets()
    {
        $widgets = DashboardWidget::with(['createdBy'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Dashboard/Widgets', [
            'widgets' => $widgets
        ]);
    }

    public function createWidget()
    {
        return Inertia::render('Admin/Dashboard/CreateWidget');
    }

    public function storeWidget(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kpi_card,line_chart,bar_chart,pie_chart,area_chart,gauge_chart,heatmap,data_table,alert_list,quick_actions,custom_widget',
            'data_source' => 'required|in:inventory_levels,stock_movements,purchase_orders,sales_orders,warehouse_metrics,financial_metrics,user_activity,custom_query',
            'dashboard_type' => 'required|in:executive,operational,financial,warehouse,custom',
            'size' => 'required|in:small,medium,large,extra_large',
            'grid_width' => 'required|integer|min:1|max:12',
            'grid_height' => 'required|integer|min:1|max:12',
            'cache_duration_minutes' => 'required|integer|min:1|max:1440',
            'query_config' => 'nullable|array',
            'chart_config' => 'nullable|array',
            'styling_config' => 'nullable|array',
            'visible_to_roles' => 'nullable|array',
            'is_interactive' => 'boolean',
            'allows_export' => 'boolean',
            'has_alerts' => 'boolean',
            'alert_thresholds' => 'nullable|array'
        ]);

        DashboardWidget::create($validated);

        return redirect()->route('admin.dashboard.widgets')
            ->with('success', 'Dashboard widget created successfully');
    }

    public function editWidget(DashboardWidget $widget)
    {
        return Inertia::render('Admin/Dashboard/EditWidget', [
            'widget' => $widget
        ]);
    }

    public function updateWidget(Request $request, DashboardWidget $widget)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kpi_card,line_chart,bar_chart,pie_chart,area_chart,gauge_chart,heatmap,data_table,alert_list,quick_actions,custom_widget',
            'data_source' => 'required|in:inventory_levels,stock_movements,purchase_orders,sales_orders,warehouse_metrics,financial_metrics,user_activity,custom_query',
            'dashboard_type' => 'required|in:executive,operational,financial,warehouse,custom',
            'size' => 'required|in:small,medium,large,extra_large',
            'grid_width' => 'required|integer|min:1|max:12',
            'grid_height' => 'required|integer|min:1|max:12',
            'cache_duration_minutes' => 'required|integer|min:1|max:1440',
            'query_config' => 'nullable|array',
            'chart_config' => 'nullable|array',
            'styling_config' => 'nullable|array',
            'visible_to_roles' => 'nullable|array',
            'is_interactive' => 'boolean',
            'allows_export' => 'boolean',
            'has_alerts' => 'boolean',
            'alert_thresholds' => 'nullable|array'
        ]);

        $widget->update($validated);

        return redirect()->route('admin.dashboard.widgets')
            ->with('success', 'Dashboard widget updated successfully');
    }

    public function destroyWidget(DashboardWidget $widget)
    {
        $widget->delete();

        return redirect()->route('admin.dashboard.widgets')
            ->with('success', 'Dashboard widget deleted successfully');
    }

    public function refreshWidget(DashboardWidget $widget)
    {
        try {
            $widget->cached_data = $this->refreshWidgetData($widget);
            $widget->data_cached_at = now();
            $widget->last_updated_at = now();
            $widget->save();

            return response()->json([
                'success' => true,
                'data' => $widget->cached_data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateLayout(Request $request)
    {
        $validated = $request->validate([
            'widgets' => 'required|array',
            'widgets.*.id' => 'required|integer|exists:dashboard_widgets,id',
            'widgets.*.grid_position_x' => 'required|integer|min:0',
            'widgets.*.grid_position_y' => 'required|integer|min:0',
            'widgets.*.grid_width' => 'required|integer|min:1|max:12',
            'widgets.*.grid_height' => 'required|integer|min:1|max:12'
        ]);

        foreach ($validated['widgets'] as $widgetData) {
            DashboardWidget::where('id', $widgetData['id'])->update([
                'grid_position_x' => $widgetData['grid_position_x'],
                'grid_position_y' => $widgetData['grid_position_y'],
                'grid_width' => $widgetData['grid_width'],
                'grid_height' => $widgetData['grid_height']
            ]);
        }

        return response()->json(['success' => true]);
    }

    private function refreshWidgetData(DashboardWidget $widget): array
    {
        return match($widget->data_source) {
            'inventory_levels' => $this->getInventoryLevelsData($widget),
            'stock_movements' => $this->getStockMovementsData($widget),
            'purchase_orders' => $this->getPurchaseOrdersData($widget),
            'sales_orders' => $this->getSalesOrdersData($widget),
            'financial_metrics' => $this->getFinancialMetricsData($widget),
            default => []
        };
    }

    private function getInventoryLevelsData(DashboardWidget $widget): array
    {
        // Implementation will depend on widget type and configuration
        return [
            'total_products' => \DB::table('products')->count(),
            'total_inventory_value' => \DB::table('inventories')
                ->join('products', 'inventories.product_id', '=', 'products.id')
                ->sum(\DB::raw('inventories.quantity * products.unit_cost')),
            'low_stock_count' => \DB::table('inventories')
                ->join('products', 'inventories.product_id', '=', 'products.id')
                ->whereRaw('inventories.quantity <= products.reorder_point')
                ->count(),
            'warehouses_count' => \DB::table('warehouses')->count()
        ];
    }

    private function getStockMovementsData(DashboardWidget $widget): array
    {
        return [
            'today_movements' => \DB::table('stock_movements')->whereDate('created_at', today())->count(),
            'week_movements' => \DB::table('stock_movements')->whereBetween('created_at', [now()->startOfWeek(), now()])->count(),
            'pending_transfers' => \DB::table('stock_transfers')->where('status', 'pending')->count()
        ];
    }

    private function getPurchaseOrdersData(DashboardWidget $widget): array
    {
        return [
            'pending_orders' => \DB::table('purchase_orders')->where('status', 'pending')->count(),
            'total_amount_pending' => \DB::table('purchase_orders')->where('status', 'pending')->sum('total_amount'),
            'orders_this_month' => \DB::table('purchase_orders')->whereMonth('created_at', now()->month)->count()
        ];
    }

    private function getSalesOrdersData(DashboardWidget $widget): array
    {
        return [
            'pending_orders' => \DB::table('sales_orders')->where('status', 'pending')->count(),
            'total_revenue_pending' => \DB::table('sales_orders')->where('status', 'pending')->sum('total_amount'),
            'orders_this_month' => \DB::table('sales_orders')->whereMonth('created_at', now()->month)->count()
        ];
    }

    private function getFinancialMetricsData(DashboardWidget $widget): array
    {
        return [
            'total_purchase_value' => \DB::table('purchase_orders')->sum('total_amount'),
            'total_sales_value' => \DB::table('sales_orders')->sum('total_amount'),
            'inventory_value' => \DB::table('inventories')
                ->join('products', 'inventories.product_id', '=', 'products.id')
                ->sum(\DB::raw('inventories.quantity * products.unit_cost'))
        ];
    }

    private function getDashboardTypes(): array
    {
        return [
            ['value' => 'executive', 'label' => 'Executive Dashboard'],
            ['value' => 'operational', 'label' => 'Operational Dashboard'],
            ['value' => 'financial', 'label' => 'Financial Dashboard'],
            ['value' => 'warehouse', 'label' => 'Warehouse Dashboard'],
            ['value' => 'custom', 'label' => 'Custom Dashboard']
        ];
    }
}