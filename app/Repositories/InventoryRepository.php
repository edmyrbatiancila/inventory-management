<?php

namespace App\Repositories;

use App\Models\Inventory;
use App\Repositories\Interfaces\InventoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class InventoryRepository implements InventoryRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = Inventory::with(['product.category', 'warehouse', 'product.brand']);

        // Apply advanced search filters
        $this->applyAdvancedFilters($query, $filters);

        // Apply filters
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->whereHas('product', function($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                })->orWhereHas('warehouse', function($wq) use ($search) {
                    $wq->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });
        }

        if (isset($filters['product_id']) && !empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['warehouse_id']) && !empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['low_stock']) && $filters['low_stock']) {
            $query->whereHas('product', function($q) {
                $q->whereColumn('inventories.quantity_available', '<=', 'products.min_stock_level');
            });
        }

        if (isset($filters['out_of_stock']) && $filters['out_of_stock']) {
            $query->where('quantity_on_hand', '<=', 0);
        }

        // Add sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'product_name':
                $query->join('products', 'inventories.product_id', '=', 'products.id')
                    ->orderBy('products.name');
                break;
            case 'warehouse_name':
                $query->join('warehouses', 'inventories.warehouse_id', '=', 'warehouses.id')
                    ->orderBy('warehouses.name');
                break;
            case 'quantity_high':
                $query->orderBy('quantity_available', 'desc');
                break;
            case 'quantity_low':
                $query->orderBy('quantity_available', 'asc');
                break;
            case 'value_high':
                $query->join('products', 'inventories.product_id', '=', 'products.id')
                      ->orderByRaw('(inventories.quantity_available * products.price) DESC');
                break;
            case 'value_low':
                $query->join('products', 'inventories.product_id', '=', 'products.id')
                      ->orderByRaw('(inventories.quantity_available * products.price) ASC');
                break;
            case 'stock_status':
                $query->join('products', 'inventories.product_id', '=', 'products.id')
                    ->orderByRaw('
                        CASE 
                            WHEN inventories.quantity_available <= 0 THEN 1
                            WHEN inventories.quantity_available <= products.min_stock_level THEN 2
                            ELSE 3
                        END
                    ');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function findById(int $id): ?Inventory
    {
        return Inventory::find($id);
    }

    public function create(array $data): Inventory
    {
        return Inventory::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Inventory::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        $inventory = Inventory::find($id);

        return $inventory ? $inventory->delete() : false;
    }

    public function findByProduct(int $productId): Collection
    {
        return Inventory::where('product_id', $productId)->get();
    }

    public function findByWarehouse(int $warehouseId): Collection
    {
        return Inventory::where('warehouse_id', $warehouseId)->get();
    }

    public function findLowStock(): Collection
    {
        return Inventory::whereHas('product', function($query) {
            $query->whereColumn('inventories.quantity_available', '<=', 'products.min_stock_level');
        })->with(['product', 'warehouse'])->get();
    }

    public function findByProductAndWarehouse(int $productId, int $warehouseId): ?Inventory
    {
        return Inventory::where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->first();
    }

    public function getInventoryLevels(): Collection
    {
        return Inventory::select('product_id', 'warehouse_id', 'quantity_on_hand', 'quantity_reserved', 'quantity_available')
            ->get();
    }

    public function getStockMovementHistory(int $inventoryId): Collection
    {
        // Assuming there's a StockMovement model related to Inventory
        return Inventory::find($inventoryId)
            ->stockMovements()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTotalStockValue(): float
    {
        return Inventory::join('products', 'inventories.product_id', '=', 'products.id')
            ->selectRaw('SUM(inventories.quantity_on_hand * products.cost_price) as total_value')
            ->value('total_value') ?? 0.0;
    }

    /**
     * Apply advanced search filters to query
     */
    private function applyAdvancedFilters($query, array $filters)
    {
        // Global search across product name, SKU, warehouse name, and notes
        if (isset($filters['globalSearch']) && !empty($filters['globalSearch'])) {
            $search = $filters['globalSearch'];
            $query->where(function($q) use ($search) {
                $q->whereHas('product', function($productQuery) use ($search) {
                    $productQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                })
                ->orWhereHas('warehouse', function($warehouseQuery) use ($search) {
                    $warehouseQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                })
                ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // Product-specific filters
        if (isset($filters['productName']) && !empty($filters['productName'])) {
            $query->whereHas('product', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['productName']}%");
            });
        }

        if (isset($filters['productSku']) && !empty($filters['productSku'])) {
            $query->whereHas('product', function($q) use ($filters) {
                $q->where('sku', 'like', "%{$filters['productSku']}%");
            });
        }

        if (isset($filters['productIds']) && is_array($filters['productIds']) && count($filters['productIds']) > 0) {
            $query->whereIn('product_id', $filters['productIds']);
        }

        if (isset($filters['categoryIds']) && is_array($filters['categoryIds']) && count($filters['categoryIds']) > 0) {
            $query->whereHas('product', function($q) use ($filters) {
                $q->whereIn('category_id', $filters['categoryIds']);
            });
        }

        if (isset($filters['brandIds']) && is_array($filters['brandIds']) && count($filters['brandIds']) > 0) {
            $query->whereHas('product', function($q) use ($filters) {
                $q->whereIn('brand_id', $filters['brandIds']);
            });
        }

        // Warehouse-specific filters
        if (isset($filters['warehouseName']) && !empty($filters['warehouseName'])) {
            $query->whereHas('warehouse', function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['warehouseName']}%");
            });
        }

        if (isset($filters['warehouseCode']) && !empty($filters['warehouseCode'])) {
            $query->whereHas('warehouse', function($q) use ($filters) {
                $q->where('code', 'like', "%{$filters['warehouseCode']}%");
            });
        }

        if (isset($filters['warehouseIds']) && is_array($filters['warehouseIds']) && count($filters['warehouseIds']) > 0) {
            $query->whereIn('warehouse_id', $filters['warehouseIds']);
        }

        if (isset($filters['warehouseIsActive'])) {
            $query->whereHas('warehouse', function($q) use ($filters) {
                $q->where('is_active', $filters['warehouseIsActive']);
            });
        }

        // Quantity filters
        if (isset($filters['quantityOnHandMin'])) {
            $query->where('quantity_on_hand', '>=', $filters['quantityOnHandMin']);
        }

        if (isset($filters['quantityOnHandMax'])) {
            $query->where('quantity_on_hand', '<=', $filters['quantityOnHandMax']);
        }

        if (isset($filters['quantityReservedMin'])) {
            $query->where('quantity_reserved', '>=', $filters['quantityReservedMin']);
        }

        if (isset($filters['quantityReservedMax'])) {
            $query->where('quantity_reserved', '<=', $filters['quantityReservedMax']);
        }

        if (isset($filters['quantityAvailableMin'])) {
            $query->where('quantity_available', '>=', $filters['quantityAvailableMin']);
        }

        if (isset($filters['quantityAvailableMax'])) {
            $query->where('quantity_available', '<=', $filters['quantityAvailableMax']);
        }

        // Stock status filters
        if (isset($filters['isLowStock']) && $filters['isLowStock']) {
            $query->whereHas('product', function($q) {
                $q->whereColumn('inventories.quantity_available', '<=', 'products.min_stock_level');
            });
        }

        if (isset($filters['isOutOfStock']) && $filters['isOutOfStock']) {
            $query->where('quantity_available', '<=', 0);
        }

        if (isset($filters['hasReservedStock']) && $filters['hasReservedStock']) {
            $query->where('quantity_reserved', '>', 0);
        }

        // Date filters
        if (isset($filters['createdAfter']) && !empty($filters['createdAfter'])) {
            $query->where('created_at', '>=', $filters['createdAfter']);
        }

        if (isset($filters['createdBefore']) && !empty($filters['createdBefore'])) {
            $query->where('created_at', '<=', $filters['createdBefore']);
        }

        if (isset($filters['updatedAfter']) && !empty($filters['updatedAfter'])) {
            $query->where('updated_at', '>=', $filters['updatedAfter']);
        }

        if (isset($filters['updatedBefore']) && !empty($filters['updatedBefore'])) {
            $query->where('updated_at', '<=', $filters['updatedBefore']);
        }

        // Quick filters
        if (isset($filters['recentlyUpdated']) && $filters['recentlyUpdated']) {
            $query->where('updated_at', '>=', now()->subDays(7));
        }

        if (isset($filters['newInventories']) && $filters['newInventories']) {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        if (isset($filters['highValueInventories']) && $filters['highValueInventories']) {
            $query->whereHas('product', function($q) {
                $q->whereRaw('(inventories.quantity_available * products.price) > 1000');
            });
        }

        // Notes filter
        if (isset($filters['notes']) && !empty($filters['notes'])) {
            $query->where('notes', 'like', "%{$filters['notes']}%");
        }
    }

    /**
     * Get search statistics for inventory filters
     */
    public function getSearchStats(array $filters = []): array
    {
        $query = Inventory::query();
        $this->applyAdvancedFilters($query, $filters);

        return [
            'totalResults' => $query->count(),
            'stockCounts' => [
                'healthy' => (clone $query)->whereHas('product', function($q) {
                    $q->whereColumn('inventories.quantity_available', '>', 'products.min_stock_level');
                })->where('quantity_available', '>', 0)->count(),
                
                'low' => (clone $query)->whereHas('product', function($q) {
                    $q->whereColumn('inventories.quantity_available', '<=', 'products.min_stock_level')
                        ->whereColumn('inventories.quantity_available', '>', 0);
                })->count(),
                
                'outOfStock' => (clone $query)->where('quantity_available', '<=', 0)->count(),
                
                'withReservation' => (clone $query)->where('quantity_reserved', '>', 0)->count(),
                
                'highValue' => (clone $query)->whereHas('product', function($q) {
                    $q->whereRaw('(inventories.quantity_available * products.price) > 1000');
                })->count(),
            ],
            'quantityRanges' => [
                'zero' => (clone $query)->where('quantity_on_hand', 0)->count(),
                'low' => (clone $query)->whereBetween('quantity_on_hand', [1, 50])->count(),
                'medium' => (clone $query)->whereBetween('quantity_on_hand', [51, 200])->count(),
                'high' => (clone $query)->where('quantity_on_hand', '>', 200)->count(),
            ]
        ];
    }

    /**
     * Get optimized search statistics using single query with conditional aggregation
     */
    public function getOptimizedSearchStats(array $filters = []): array
    {
        $query = Inventory::query()
            ->leftJoin('products', 'inventories.product_id', '=', 'products.id');
        
        $this->applyAdvancedFilters($query, $filters);

        $results = $query->selectRaw("
            COUNT(*) as total_results,
            COUNT(CASE WHEN inventories.quantity_available > products.min_stock_level AND inventories.quantity_available > 0 THEN 1 END) as healthy_count,
            COUNT(CASE WHEN inventories.quantity_available <= products.min_stock_level AND inventories.quantity_available > 0 THEN 1 END) as low_count,
            COUNT(CASE WHEN inventories.quantity_available <= 0 THEN 1 END) as out_of_stock_count,
            COUNT(CASE WHEN inventories.quantity_reserved > 0 THEN 1 END) as with_reservation_count,
            COUNT(CASE WHEN (inventories.quantity_available * products.price) > 1000 THEN 1 END) as high_value_count,
            COUNT(CASE WHEN inventories.quantity_on_hand = 0 THEN 1 END) as zero_quantity_count,
            COUNT(CASE WHEN inventories.quantity_on_hand BETWEEN 1 AND 50 THEN 1 END) as low_quantity_count,
            COUNT(CASE WHEN inventories.quantity_on_hand BETWEEN 51 AND 200 THEN 1 END) as medium_quantity_count,
            COUNT(CASE WHEN inventories.quantity_on_hand > 200 THEN 1 END) as high_quantity_count
        ")->first();

        return [
            'totalResults' => $results->total_results ?? 0,
            'stockCounts' => [
                'healthy' => $results->healthy_count ?? 0,
                'low' => $results->low_count ?? 0,
                'outOfStock' => $results->out_of_stock_count ?? 0,
                'withReservation' => $results->with_reservation_count ?? 0,
                'highValue' => $results->high_value_count ?? 0,
            ],
            'quantityRanges' => [
                'zero' => $results->zero_quantity_count ?? 0,
                'low' => $results->low_quantity_count ?? 0,
                'medium' => $results->medium_quantity_count ?? 0,
                'high' => $results->high_quantity_count ?? 0,
            ]
        ];
    }
}