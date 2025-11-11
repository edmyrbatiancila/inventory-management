<?php

namespace App\Repositories;

use App\Models\StockMovement;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class StockMovementRepository implements StockMovementRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = StockMovement::with(['product', 'warehouse', 'user', 'approvedBy']);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply Advanced filters
        $this->applyAdvancedFilters($query, $filters);

        // Sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'quantity_high':
                $query->orderByRaw('ABS(quantity_moved) DESC');
                break;
            case 'quantity_low':
                $query->orderByRaw('ABS(quantity_moved) ASC');
                break;
            case 'value_high':
                $query->orderBy('total_value', 'desc');
                break;
            case 'value_low':
                $query->orderBy('total_value', 'asc');
                break;
            case 'reference_number':
                $query->orderBy('reference_number', 'asc');
                break;
            case 'movement_type':
                $query->orderBy('movement_type', 'asc');
                break;
            case 'status':
                $query->orderBy('status', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getSearchStats(array $filters = []): array
    {
        $baseQuery = StockMovement::with(['product', 'warehouse', 'user']);
        $filteredQuery = clone $baseQuery;
        $this->applyFilters($filteredQuery, $filters);

        // Movement type distribution
        $movementTypes = (clone $filteredQuery)
            ->select('movement_type', DB::raw('count(*) as count'))
            ->groupBy('movement_type')
            ->pluck('count', 'movement_type')
            ->toArray();

        // Status distribution
        $statusCounts = (clone $filteredQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Value analysis
        $valueStats = (clone $filteredQuery)
            ->selectRaw('
                SUM(CASE WHEN quantity_moved > 0 THEN total_value ELSE 0 END) as value_in,
                SUM(CASE WHEN quantity_moved < 0 THEN ABS(total_value) ELSE 0 END) as value_out,
                SUM(total_value) as net_value,
                AVG(ABS(total_value)) as avg_value
            ')
            ->first();

        // Quantity analysis
        $quantityStats = (clone $filteredQuery)
            ->selectRaw('
                SUM(CASE WHEN quantity_moved > 0 THEN quantity_moved ELSE 0 END) as quantity_in,
                SUM(CASE WHEN quantity_moved < 0 THEN ABS(quantity_moved) ELSE 0 END) as quantity_out,
                SUM(quantity_moved) as net_quantity,
                AVG(ABS(quantity_moved)) as avg_quantity
            ')
            ->first();

        return [
            'totalMovements' => $filteredQuery->count(),
            'movementTypes' => $movementTypes,
            'statusCounts' => array_merge([
                'pending' => 0,
                'approved' => 0, 
                'rejected' => 0,
                'applied' => 0
            ], $statusCounts),
            'valueAnalysis' => [
                'valueIn' => round($valueStats->value_in ?? 0, 2),
                'valueOut' => round($valueStats->value_out ?? 0, 2),
                'netValue' => round($valueStats->net_value ?? 0, 2),
                'avgValue' => round($valueStats->avg_value ?? 0, 2),
            ],
            'quantityAnalysis' => [
                'quantityIn' => $quantityStats->quantity_in ?? 0,
                'quantityOut' => $quantityStats->quantity_out ?? 0,
                'netQuantity' => $quantityStats->net_quantity ?? 0,
                'avgQuantity' => round($quantityStats->avg_quantity ?? 0, 2),
            ],
            'generatedAt' => now()->toISOString()
        ];
    }

    private function applyFilters($query, array $filters)
    {
        // Global search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Movement type filter
        if (!empty($filters['movement_types'])) {
            $types = is_array($filters['movement_types']) 
                ? $filters['movement_types'] 
                : explode(',', $filters['movement_types']);
            $query->whereIn('movement_type', $types);
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Product filter
        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        // Warehouse filter
        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        // User filter
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Date filters
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Quantity filters
        if (isset($filters['quantity_min'])) {
            $query->where(DB::raw('ABS(quantity_moved)'), '>=', $filters['quantity_min']);
        }

        if (isset($filters['quantity_max'])) {
            $query->where(DB::raw('ABS(quantity_moved)'), '<=', $filters['quantity_max']);
        }

        // Value filters
        if (isset($filters['value_min'])) {
            $query->where(DB::raw('ABS(total_value)'), '>=', $filters['value_min']);
        }

        if (isset($filters['value_max'])) {
            $query->where(DB::raw('ABS(total_value)'), '<=', $filters['value_max']);
        }
    }

    // Implement other interface methods...
    public function findById(int $id): ?StockMovement
    {
        return StockMovement::with(['product', 'warehouse', 'user', 'approvedBy'])->find($id);
    }

    public function create(array $data): StockMovement
    {
        return StockMovement::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return StockMovement::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return StockMovement::destroy($id);
    }

    public function findByProduct(int $productId): Collection
    {
        return StockMovement::forProduct($productId)
            ->with(['warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByWarehouse(int $warehouseId): Collection
    {
        return StockMovement::forWarehouse($warehouseId)
            ->with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByMovementType(string $type): Collection
    {
        return StockMovement::byMovementType($type)
            ->with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByUser(int $userId): Collection
    {
        return StockMovement::where('user_id', $userId)
            ->with(['product', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findPendingApproval(): Collection
    {
        return StockMovement::where('status', 'pending')
            ->with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findRecentMovements(int $limit = 10): Collection
    {
        return StockMovement::with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getMovementSummaryByProduct(int $productId): array
    {
        return StockMovement::forProduct($productId)
            ->selectRaw('
                movement_type,
                COUNT(*) as count,
                SUM(quantity_moved) as total_quantity,
                SUM(total_value) as total_value
            ')
            ->groupBy('movement_type')
            ->get()
            ->toArray();
    }

    public function getMovementSummaryByWarehouse(int $warehouseId): array
    {
        return StockMovement::forWarehouse($warehouseId)
            ->selectRaw('
                movement_type,
                COUNT(*) as count,
                SUM(quantity_moved) as total_quantity,
                SUM(total_value) as total_value
            ')
            ->groupBy('movement_type')
            ->get()
            ->toArray();
    }

    public function getMovementsByDateRange(string $startDate, string $endDate): Collection
    {
        return StockMovement::whereBetween('created_at', [$startDate, $endDate])
            ->with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTopMovementsByValue(int $limit = 10): Collection
    {
        return StockMovement::with(['product', 'warehouse', 'user'])
            ->orderBy(DB::raw('ABS(total_value)'), 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Apply advanced search filters to query
     */
    private function applyAdvancedFilters($query, array $filters)
    {
        // Global search across multiple fields
        if (!empty($filters['globalSearch'])) {
            $globalSearch = $filters['globalSearch'];
            $query->where(function($q) use ($globalSearch) {
                $q->where('reference_number', 'like', "%{$globalSearch}%")
                    ->orWhere('reason', 'like', "%{$globalSearch}%")
                    ->orWhere('notes', 'like', "%{$globalSearch}%")
                    ->orWhereHas('product', function($productQuery) use ($globalSearch) {
                        $productQuery->where('name', 'like', "%{$globalSearch}%")
                                    ->orWhere('sku', 'like', "%{$globalSearch}%");
                    })
                    ->orWhereHas('warehouse', function($warehouseQuery) use ($globalSearch) {
                        $warehouseQuery->where('name', 'like', "%{$globalSearch}%");
                    })
                    ->orWhereHas('user', function($userQuery) use ($globalSearch) {
                        $userQuery->where('name', 'like', "%{$globalSearch}%");
                    });
            });
        }

        // Text field filters
        if (!empty($filters['referenceNumber'])) {
            $query->where('reference_number', 'like', "%{$filters['referenceNumber']}%");
        }

        if (!empty($filters['reason'])) {
            $query->where('reason', 'like', "%{$filters['reason']}%");
        }

        if (!empty($filters['notes'])) {
            $query->where('notes', 'like', "%{$filters['notes']}%");
        }

        if (!empty($filters['productName'])) {
            $query->whereHas('product', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['productName']}%");
            });
        }

        if (!empty($filters['productSku'])) {
            $query->whereHas('product', function($q) use ($filters) {
                $q->where('sku', 'like', "%{$filters['productSku']}%");
            });
        }

        if (!empty($filters['warehouseName'])) {
            $query->whereHas('warehouse', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['warehouseName']}%");
            });
        }

        if (!empty($filters['userName'])) {
            $query->whereHas('user', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['userName']}%");
            });
        }

        // Movement type filters
        if (!empty($filters['movementTypes'])) {
            $query->whereIn('movement_type', $filters['movementTypes']);
        }

        // Status filters
        if (!empty($filters['statuses'])) {
            $query->whereIn('status', $filters['statuses']);
        }

        // Entity ID filters
        if (!empty($filters['productIds'])) {
            $query->whereIn('product_id', $filters['productIds']);
        }

        if (!empty($filters['warehouseIds'])) {
            $query->whereIn('warehouse_id', $filters['warehouseIds']);
        }

        if (!empty($filters['userIds'])) {
            $query->whereIn('user_id', $filters['userIds']);
        }

        // Quantity filters
        if (isset($filters['quantityMovedMin'])) {
            $query->where(DB::raw('ABS(quantity_moved)'), '>=', $filters['quantityMovedMin']);
        }

        if (isset($filters['quantityMovedMax'])) {
            $query->where(DB::raw('ABS(quantity_moved)'), '<=', $filters['quantityMovedMax']);
        }

        if (isset($filters['quantityBeforeMin'])) {
            $query->where('quantity_before', '>=', $filters['quantityBeforeMin']);
        }

        if (isset($filters['quantityBeforeMax'])) {
            $query->where('quantity_before', '<=', $filters['quantityBeforeMax']);
        }

        if (isset($filters['quantityAfterMin'])) {
            $query->where('quantity_after', '>=', $filters['quantityAfterMin']);
        }

        if (isset($filters['quantityAfterMax'])) {
            $query->where('quantity_after', '<=', $filters['quantityAfterMax']);
        }

        // Value filters
        if (isset($filters['unitCostMin'])) {
            $query->where('unit_cost', '>=', $filters['unitCostMin']);
        }

        if (isset($filters['unitCostMax'])) {
            $query->where('unit_cost', '<=', $filters['unitCostMax']);
        }

        if (isset($filters['totalValueMin'])) {
            $query->where('total_value', '>=', $filters['totalValueMin']);
        }

        if (isset($filters['totalValueMax'])) {
            $query->where('total_value', '<=', $filters['totalValueMax']);
        }

        // Date filters
        if (!empty($filters['createdAfter'])) {
            $query->where('created_at', '>=', $filters['createdAfter']);
        }

        if (!empty($filters['createdBefore'])) {
            $query->where('created_at', '<=', $filters['createdBefore']);
        }

        if (!empty($filters['approvedAfter'])) {
            $query->where('approved_at', '>=', $filters['approvedAfter']);
        }

        if (!empty($filters['approvedBefore'])) {
            $query->where('approved_at', '<=', $filters['approvedBefore']);
        }

        // Movement direction filters
        if (!empty($filters['movementDirection'])) {
            if ($filters['movementDirection'] === 'increase') {
                $query->where('quantity_moved', '>', 0);
            } elseif ($filters['movementDirection'] === 'decrease') {
                $query->where('quantity_moved', '<', 0);
            }
        }

        // Related document type filters
        if (!empty($filters['relatedDocumentTypes'])) {
            $query->whereIn('related_document_type', $filters['relatedDocumentTypes']);
        }

        // Quick filters
        if (!empty($filters['myMovements'])) {
            $query->where('user_id', auth()->id());
        }

        if (!empty($filters['recentMovements'])) {
            $query->where('created_at', '>=', now()->subDays(7));
        }

        if (!empty($filters['pendingApproval'])) {
            $query->where('status', 'pending');
        }

        if (!empty($filters['highValueMovements'])) {
            $query->where('total_value', '>', 1000); // Adjust threshold as needed
        }

        if (!empty($filters['hasApprover'])) {
            $query->whereNotNull('approved_by');
        }

        if (!empty($filters['hasDocumentReference'])) {
            $query->whereNotNull('related_document_type')
                ->whereNotNull('related_document_id');
        }
    }

    /**
     * Get advanced search statistics
     */
    public function getAdvancedSearchStats(array $filters = []): array
    {
        $baseQuery = StockMovement::with(['product', 'warehouse', 'user']);
        $filteredQuery = clone $baseQuery;
        $this->applyAdvancedFilters($filteredQuery, $filters);

        // Movement type distribution
        $movementTypes = (clone $filteredQuery)
            ->select('movement_type', DB::raw('count(*) as count'))
            ->groupBy('movement_type')
            ->pluck('count', 'movement_type')
            ->toArray();

        // Status distribution
        $statusCounts = (clone $filteredQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Movement direction analysis
        $directionStats = (clone $filteredQuery)
            ->select(
                DB::raw('SUM(CASE WHEN quantity_moved > 0 THEN 1 ELSE 0 END) as increases'),
                DB::raw('SUM(CASE WHEN quantity_moved < 0 THEN 1 ELSE 0 END) as decreases'),
                DB::raw('SUM(CASE WHEN quantity_moved > 0 THEN quantity_moved ELSE 0 END) as total_increase_quantity'),
                DB::raw('SUM(CASE WHEN quantity_moved < 0 THEN ABS(quantity_moved) ELSE 0 END) as total_decrease_quantity')
            )
            ->first();

        // Value analysis
        $valueStats = (clone $filteredQuery)
            ->select(
                DB::raw('COUNT(*) as total_count'),
                DB::raw('SUM(COALESCE(total_value, 0)) as total_value'),
                DB::raw('AVG(COALESCE(total_value, 0)) as avg_value'),
                DB::raw('MAX(COALESCE(total_value, 0)) as max_value'),
                DB::raw('MIN(COALESCE(total_value, 0)) as min_value')
            )
            ->first();

        // Recent activity (last 7 days)
        $recentActivity = (clone $filteredQuery)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        // Top products by movement count
        $topProducts = (clone $filteredQuery)
            ->select('product_id', DB::raw('count(*) as movement_count'))
            ->with('product:id,name,sku')
            ->groupBy('product_id')
            ->orderByDesc('movement_count')
            ->limit(5)
            ->get();

        // Top warehouses by movement count
        $topWarehouses = (clone $filteredQuery)
            ->select('warehouse_id', DB::raw('count(*) as movement_count'))
            ->with('warehouse:id,name')
            ->groupBy('warehouse_id')
            ->orderByDesc('movement_count')
            ->limit(5)
            ->get();

        return [
            'totalResults' => $filteredQuery->count(),
            'movementTypes' => $movementTypes,
            'statusCounts' => $statusCounts,
            'directionStats' => [
                'increases' => $directionStats->increases ?? 0,
                'decreases' => $directionStats->decreases ?? 0,
                'totalIncreaseQuantity' => $directionStats->total_increase_quantity ?? 0,
                'totalDecreaseQuantity' => $directionStats->total_decrease_quantity ?? 0,
            ],
            'valueStats' => [
                'totalCount' => $valueStats->total_count ?? 0,
                'totalValue' => $valueStats->total_value ?? 0,
                'averageValue' => $valueStats->avg_value ?? 0,
                'maxValue' => $valueStats->max_value ?? 0,
                'minValue' => $valueStats->min_value ?? 0,
            ],
            'recentActivity' => $recentActivity,
            'topProducts' => $topProducts,
            'topWarehouses' => $topWarehouses,
        ];
    }
}