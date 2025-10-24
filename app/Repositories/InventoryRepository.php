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
        $query = Inventory::with(['product', 'warehouse']);

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
                    ->orderBy('products.name', 'asc')
                    ->select('inventories.*');
                break;
            case 'warehouse_name':
                $query->join('warehouses', 'inventories.warehouse_id', '=', 'warehouses.id')
                    ->orderBy('warehouses.name', 'asc')
                    ->select('inventories.*');
                break;
            case 'quantity_high':
                $query->orderBy('quantity_on_hand', 'desc');
                break;
            case 'quantity_low':
                $query->orderBy('quantity_on_hand', 'asc');
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
}