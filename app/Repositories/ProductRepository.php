<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with(['category', 'brand'])
        ->withCount('inventories');

        // Global search across multiple fields
        if (!empty($filters['global_search'])) {
            $search = $filters['global_search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%")
                ->orWhereHas('category', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('brand', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Specific field searches
        if (!empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (!empty($filters['sku'])) {
            $query->where('sku', 'like', "%{$filters['sku']}%");
        }

        // Apply filters dynamically
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Category and Brand filters
        if (!empty($filters['categories'])) {
            $categoryIds = is_string($filters['categories']) 
                ? explode(',', $filters['categories']) 
                : $filters['categories'];
            $query->whereIn('category_id', $categoryIds);
        }

        if (!empty($filters['brands'])) {
            $brandIds = is_string($filters['brands']) 
                ? explode(',', $filters['brands']) 
                : $filters['brands'];
            $query->whereIn('brand_id', $brandIds);
        }

        // Price range filters
        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }
        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        // Stock level filters
        if (isset($filters['min_stock_min'])) {
            $query->where('min_stock_level', '>=', $filters['min_stock_min']);
        }
        if (isset($filters['min_stock_max'])) {
            $query->where('min_stock_level', '<=', $filters['min_stock_max']);
        }

        // Status filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true');
        }

        if (isset($filters['track_quantity'])) {
            $query->where('track_quantity', $filters['track_quantity'] === 'true');
        }

        // Date filters
        if (!empty($filters['created_after'])) {
            $query->where('created_at', '>=', $filters['created_after']);
        }
        if (!empty($filters['created_before'])) {
            $query->where('created_at', '<=', $filters['created_before']);
        }

        // Stock status filters
        if (isset($filters['has_inventory'])) {
            if ($filters['has_inventory'] === 'true') {
                $query->whereHas('inventories');
            } else {
                $query->whereDoesntHave('inventories');
            }
        }

        if (isset($filters['is_low_stock']) && $filters['is_low_stock'] === 'true') {
            $query->whereHas('inventories', function ($q) {
                $q->whereRaw('quantity_available <= products.min_stock_level');
            });
        }

        // Sorting
        $sort = $filters['sort'] ?? 'newest';
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'az':
                $query->orderBy('name', 'asc');
                break;
            case 'za':
                $query->orderBy('name', 'desc');
                break;
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getSearchStats(array $filters = []): array
    {
        $baseQuery = Product::query();

        // Global search across multiple fields
        if (!empty($filters['global_search'])) {
            $search = $filters['global_search'];
            $baseQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%")
                ->orWhereHas('category', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('brand', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Specific field searches
        if (!empty($filters['name'])) {
            $baseQuery->where('name', 'like', "%{$filters['name']}%");
        }

        if (!empty($filters['sku'])) {
            $baseQuery->where('sku', 'like', "%{$filters['sku']}%");
        }

        // Apply filters dynamically
        if (!empty($filters['category_id'])) {
            $baseQuery->where('category_id', $filters['category_id']);
        }

        // Category and Brand filters
        if (!empty($filters['categories'])) {
            $categoryIds = is_string($filters['categories']) 
                ? explode(',', $filters['categories']) 
                : $filters['categories'];
            $baseQuery->whereIn('category_id', $categoryIds);
        }

        if (!empty($filters['brands'])) {
            $brandIds = is_string($filters['brands']) 
                ? explode(',', $filters['brands']) 
                : $filters['brands'];
            $baseQuery->whereIn('brand_id', $brandIds);
        }

        // Price range filters
        if (isset($filters['price_min'])) {
            $baseQuery->where('price', '>=', $filters['price_min']);
        }
        if (isset($filters['price_max'])) {
            $baseQuery->where('price', '<=', $filters['price_max']);
        }

        // Stock level filters
        if (isset($filters['min_stock_min'])) {
            $baseQuery->where('min_stock_level', '>=', $filters['min_stock_min']);
        }
        if (isset($filters['min_stock_max'])) {
            $baseQuery->where('min_stock_level', '<=', $filters['min_stock_max']);
        }

        // Status filters
        if (isset($filters['is_active'])) {
            $baseQuery->where('is_active', $filters['is_active'] === 'true');
        }
        if (isset($filters['track_quantity'])) {
            $baseQuery->where('track_quantity', $filters['track_quantity'] === 'true');
        }

        // Date filters
        if (!empty($filters['created_after'])) {
            $baseQuery->where('created_at', '>=', $filters['created_after']);
        }
        if (!empty($filters['created_before'])) {
            $baseQuery->where('created_at', '<=', $filters['created_before']);
        }

        // Stock status filters
        if (isset($filters['has_inventory'])) {
            if ($filters['has_inventory'] === 'true') {
                $baseQuery->whereHas('inventories');
            } else {
                $baseQuery->whereDoesntHave('inventories');
            }
        }

        if (isset($filters['is_low_stock']) && $filters['is_low_stock'] === 'true') {
            $baseQuery->whereHas('inventories', function ($q) {
                $q->whereRaw('quantity_available <= products.min_stock_level');
            });
        }

        $totalResults = $baseQuery->count();

        // Status counts
        $statusCounts = [
            'active' => (clone $baseQuery)->where('is_active', true)->count(),
            'inactive' => (clone $baseQuery)->where('is_active', false)->count(),
            'lowStock' => (clone $baseQuery)->whereHas('inventories', function ($q) {
                $q->whereRaw('quantity_available <= products.min_stock_level');
            })->count(),
            'outOfStock' => (clone $baseQuery)->whereDoesntHave('inventories')->count(),
        ];

        // Price ranges
        $priceRanges = [
            'budget' => (clone $baseQuery)->where('price', '<', 50)->count(),
            'moderate' => (clone $baseQuery)->whereBetween('price', [50, 200])->count(),
            'premium' => (clone $baseQuery)->where('price', '>', 200)->count(),
        ];

        return [
            'totalResults' => $totalResults,
            'statusCounts' => $statusCounts,
            'priceRanges' => $priceRanges,
        ];
    }

    public function findById(int $id): ?Product
    {
        return Product::with(['category', 'brand', 'inventories.warehouse'])
            ->find($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return Product::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        $product = Product::find($id);

        return $product ? $product->delete() : false;
    }

    public function findByCategory(int $categoryId): Collection
    {
        return Product::where('category_id', $categoryId)
            ->where('is_active', true)
            ->with(['brand'])
            ->get();
    }

    public function findByBrand(int $brandId): Collection
    {
        return Product::where('brand_id', $brandId)
            ->where('is_active', true)
            ->with(['category'])
            ->get();
    }

    public function findLowStock(): Collection
    {
        return Product::whereHas('inventories', function ($query) {
            $query->whereRaw('quantity_available <= products.min_stock_level');
        })
        ->with(['inventories.warehouse'])
        ->get();
    }

    public function searchProducts(string $query): Collection
    {
        return Product::where('name', 'like', '%' . $query . '%')
            ->orWhere('sku', 'like', '%' . $query . '%')
            ->orWhere('description', 'like', '%' . $query . '%')
            ->with(['category', 'brand'])
            ->limit(10)
            ->get();
    }

    public function findWithInventory(int $id): ?Product
    {
        return Product::with([
            'category',
            'brand',
            'inventories' => function ($query) {
                $query->with('warehouse')->where('quantity_on_hand', '>', 0);
            }
        ])->find($id);
    }

    public function findWithStock(): Collection
    {
        return Product::with(['inventories'])
            ->get()
            ->map(function ($product) {
                $product->total_stock = $product->totalStock();
                return $product;
            });
    }

    public function findNeedingReorder(): Collection
    {
        return Product::whereHas('inventories', function ($query) {
            $query->whereRaw('quantity_available <= products.min_stock_level');
        })
        ->orWhereDoesntHave('inventories')
        ->with(['category', 'brand'])
        ->get();
    }
}