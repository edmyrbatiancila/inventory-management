<?php

use App\Models\Warehouse;
use App\Repositories\Interfaces\WarehouseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class WarehouseRepository implements WarehouseRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = Warehouse::query();

        // Apply filters
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['city'])) {
            $query->where('city', 'like', "%{$filters['city']}%");
        }

        if (isset($filters['country'])) {
            $query->where('country', $filters['country']);
        }

        // Sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
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

    public function findById(int $id): ?Warehouse
    {
        return Warehouse::find($id);
    }

    public function create(array $data): Warehouse
    {
        return Warehouse::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Warehouse::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        $warehouse = Warehouse::find($id);
        return $warehouse ? $warehouse->delete() : false;
    }

    public function findByCode(string $code): ?Warehouse
    {
        return Warehouse::where('code', $code)->first();
    }

    public function findActiveWarehouses(): Collection
    {
        return Warehouse::where('is_active', true)->get();
    }

    public function findByLocation(string $city, string $state = null): Collection
    {
        $query = Warehouse::where('city', 'like', "%{$city}%");

        if ($state) {
            $query->where('state', 'like', "%{$state}%");
        }

        return $query->get();
    }

    public function searchWarehouses(string $query): Collection
    {
        return Warehouse::where('name', 'like', "%{$query}%")
            ->orWhere('code', 'like', "%{$query}%")
            ->orWhere('city', 'like', "%{$query}%")
            ->get();
    }

    public function findWithInventories(int $id): ?Warehouse
    {
        return Warehouse::with(['inventories.product'])->find($id);
    }

    public function findWarehousesWithStock(): Collection
    {
        return Warehouse::whereHas('inventories', function($query) {
            $query->where('quantiry_on_hand', '>', 0);
        })->get();
    }

    public function findWarehousesNeedingRestock(): Collection
    {
        return Warehouse::whereHas('inventories', function($query) {
            $query->whereColumn('quantity_on_hand', '<=', 'quantity_reserved')
                ->orWhere('quantity_on_hand', '<', 10);
        })->get();
    }

    public function getWarehouseCapacityAnalytics(int $id): array
    {
        $warehouse = $this->findWithInventories($id);

        if (!$warehouse) {
            return [];
        }

        $totalProducts = $warehouse->inventories->count();
        $totalStock = $warehouse->inventories->sum('quantity_on_hand');
        $totalReserved = $warehouse->inventories->sum('quantity_reserved');
        $totalAvailable = $warehouse->inventories->sum('quantity_available');

        return [
            'warehouse_id' => $id,
            'warehouse_name' => $warehouse->name,
            'total_products' => $totalProducts,
            'total_stock' => $totalStock,
            'total_reserved' => $totalReserved,
            'total_available' => $totalAvailable,
            'utilization_rate' => $totalProducts > 0 ? ($totalStock / ($totalProducts * 100)) * 100 : 0, // Assuming each product has a max capacity of 100 units
        ];
    }
}