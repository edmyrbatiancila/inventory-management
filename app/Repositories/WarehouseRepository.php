<?php

namespace App\Repositories;

use App\Models\Warehouse;
use App\Repositories\Interfaces\WarehouseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class WarehouseRepository implements WarehouseRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = Warehouse::query();

        // Apply advanced search filters
        $this->applyAdvancedFilters($query, $filters);

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
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'code_asc':
                $query->orderBy('code', 'asc');
                break;
            case 'code_desc':
                $query->orderBy('code', 'desc');
                break;
            case 'city_asc':
                $query->orderBy('city', 'asc');
                break;
            case 'city_desc':
                $query->orderBy('city', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Apply advanced filters to the warehouse query
     */
    private function applyAdvancedFilters($query, array $filters): void
    {
        // Global search
        if (isset($filters['globalSearch']) && !empty($filters['globalSearch'])) {
            $search = $filters['globalSearch'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Specific field searches
        if (isset($filters['name']) && !empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (isset($filters['code']) && !empty($filters['code'])) {
            $query->where('code', 'like', "%{$filters['code']}%");
        }

        if (isset($filters['address']) && !empty($filters['address'])) {
            $query->where('address', 'like', "%{$filters['address']}%");
        }

        if (isset($filters['city']) && !empty($filters['city'])) {
            $query->where('city', 'like', "%{$filters['city']}%");
        }

        if (isset($filters['state']) && !empty($filters['state'])) {
            $query->where('state', 'like', "%{$filters['state']}%");
        }

        if (isset($filters['country']) && !empty($filters['country'])) {
            $query->where('country', 'like', "%{$filters['country']}%");
        }

        if (isset($filters['postalCode']) && !empty($filters['postalCode'])) {
            $query->where('postal_code', 'like', "%{$filters['postalCode']}%");
        }

        // Contact filters
        if (isset($filters['phone']) && !empty($filters['phone'])) {
            $query->where('phone', 'like', "%{$filters['phone']}%");
        }

        if (isset($filters['email']) && !empty($filters['email'])) {
            $query->where('email', 'like', "%{$filters['email']}%");
        }

        // Status filters
        if (isset($filters['isActive'])) {
            $query->where('is_active', $filters['isActive']);
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

        if (isset($filters['newWarehouses']) && $filters['newWarehouses']) {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        // Legacy basic filters for backward compatibility
        if (isset($filters['search']) && !empty($filters['search']) && !isset($filters['globalSearch'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }
    }

    /**
     * Get search statistics for warehouses based on current filters
     */
    public function getSearchStats(array $filters = []): array
    {
        $baseQuery = Warehouse::query();
        
        // Apply the same filters but without pagination
        $this->applyAdvancedFilters($baseQuery, $filters);

        return [
            'totalResults' => $baseQuery->count(),
            'statusCounts' => [
                'active' => (clone $baseQuery)->where('is_active', true)->count(),
                'inactive' => (clone $baseQuery)->where('is_active', false)->count(),
                'main' => (clone $baseQuery)->where('name', 'like', '%main%')->orWhere('name', 'like', '%headquarters%')->count(),
                'branch' => (clone $baseQuery)->where('name', 'not like', '%main%')->where('name', 'not like', '%headquarters%')->count(),
                'withZones' => 0, // Placeholder - implement if you have zones functionality
            ],
            'capacityRanges' => [
                'small' => 0,   // Placeholder - implement if you have capacity data
                'medium' => 0,  // Placeholder - implement if you have capacity data
                'large' => 0,   // Placeholder - implement if you have capacity data
            ],
        ];
    }

    /**
     * Get optimized search statistics using single query with conditional aggregation
     */
    public function getOptimizedSearchStats(array $filters = []): array
    {
        $baseQuery = Warehouse::query();
        $this->applyAdvancedFilters($baseQuery, $filters);

        $stats = $baseQuery->selectRaw("
            COUNT(*) as total_results,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_count,
            SUM(CASE WHEN (name LIKE '%main%' OR name LIKE '%headquarters%' OR name LIKE '%distribution center%') THEN 1 ELSE 0 END) as main_count,
            SUM(CASE WHEN (name NOT LIKE '%main%' AND name NOT LIKE '%headquarters%' AND name NOT LIKE '%distribution center%') THEN 1 ELSE 0 END) as branch_count,
            SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_phone_count,
            SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email_count
        ")->first();

        return [
            'totalResults' => (int) $stats->total_results,
            'statusCounts' => [
                'active' => (int) $stats->active_count,
                'inactive' => (int) $stats->inactive_count,
                'main' => (int) $stats->main_count,
                'branch' => (int) $stats->branch_count,
                'withPhone' => (int) $stats->with_phone_count,
                'withEmail' => (int) $stats->with_email_count,
                'withZones' => 0, // Placeholder for zones functionality
            ],
            'capacityRanges' => [
                'small' => 0,   // Implement based on your capacity logic
                'medium' => 0,  // Implement based on your capacity logic
                'large' => 0,   // Implement based on your capacity logic
            ],
        ];
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
        return Warehouse::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('code', 'like', "%{$query}%")
                ->orWhere('city', 'like', "%{$query}%");
        })->get();
    }

    public function findWithInventories(int $id): ?Warehouse
    {
        return Warehouse::with(['inventories'])->find($id);
    }

    public function findWarehousesWithStock(): Collection
    {
        return Warehouse::whereHas('inventories', function($query) {
            $query->where('quantiry_on_hand', '>', 0);
        })->get();
    }

    public function findWarehousesNeedingRestock(): Collection
    {
        return Warehouse::whereHas('inventories', function ($query) {
            $query->whereColumn('quantity_on_hand', '<=', 'min_stock_level');
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