<?php

namespace App\Repositories;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductRepository implements ProductRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with(['category', 'brand'])
        ->withCount('inventories');

        // Basic search (from search input) across multiple fields
        if (!empty($filters['search'])) {
            $search = $filters['search'];
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

        // Global search across multiple fields (from advanced search)
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
        try {
            $baseQuery = Product::with(['category', 'brand']);
            
            // Apply the same filters as findAll to get accurate stats
            $filteredQuery = clone $baseQuery;
            $this->applyFiltersToQuery($filteredQuery, $filters);
            
            // Status counts
            $statusCounts = [
                'active' => (clone $filteredQuery)->where('is_active', true)->count(),
                'inactive' => (clone $filteredQuery)->where('is_active', false)->count(),
                'lowStock' => (clone $filteredQuery)->where('min_stock_level', '>', 0)
                    ->whereColumn('min_stock_level', '>', DB::raw('COALESCE((SELECT SUM(quantity_available) FROM inventories WHERE inventories.product_id = products.id), 0)'))
                    ->count(),
                'outOfStock' => (clone $filteredQuery)->where(function($q) {
                    $q->whereNotExists(function($query) {
                        $query->select(DB::raw(1))
                              ->from('inventories')
                              ->whereColumn('inventories.product_id', 'products.id')
                              ->where('quantity_available', '>', 0);
                    });
                })->count(),
                'overstock' => (clone $filteredQuery)->where('max_stock_level', '>', 0)
                    ->whereColumn('max_stock_level', '<', DB::raw('COALESCE((SELECT SUM(quantity_available) FROM inventories WHERE inventories.product_id = products.id), 0)'))
                    ->count(),
            ];

            // Price range analysis
            $priceRanges = [
                'budget' => (clone $filteredQuery)->where('price', '<', 50)->count(),        // Under $50
                'moderate' => (clone $filteredQuery)->whereBetween('price', [50, 200])->count(), // $50-$200
                'premium' => (clone $filteredQuery)->where('price', '>', 200)->count(),     // Over $200
                'expensive' => (clone $filteredQuery)->where('price', '>', 500)->count(),  // Over $500
            ];

            // Stock level analysis
            $stockAnalysis = [
                'low_min_stock' => (clone $filteredQuery)->where('min_stock_level', '<=', 10)->count(),
                'medium_min_stock' => (clone $filteredQuery)->whereBetween('min_stock_level', [11, 50])->count(),
                'high_min_stock' => (clone $filteredQuery)->where('min_stock_level', '>', 50)->count(),
            ];

            // Category distribution (top 5)
            $categoryStats = (clone $filteredQuery)
                ->select('category_id', DB::raw('count(*) as count'))
                ->with('category:id,name')
                ->groupBy('category_id')
                ->orderByDesc('count')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'category_name' => $item->category->name ?? 'Unknown',
                        'count' => $item->count
                    ];
                });

            // Brand distribution (top 5)
            $brandStats = (clone $filteredQuery)
                ->select('brand_id', DB::raw('count(*) as count'))
                ->with('brand:id,name')
                ->groupBy('brand_id')
                ->orderByDesc('count')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'brand_name' => $item->brand->name ?? 'Unknown',
                        'count' => $item->count
                    ];
                });

            // Recent activity (products created/updated in last 30 days)
            $recentActivity = [
                'new_products' => (clone $filteredQuery)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->count(),
                'recently_updated' => (clone $filteredQuery)
                    ->where('updated_at', '>=', now()->subDays(7))
                    ->where('updated_at', '!=', DB::raw('created_at'))
                    ->count(),
            ];

            return [
                'statusCounts' => $statusCounts,
                'priceRanges' => $priceRanges,
                'stockAnalysis' => $stockAnalysis,
                'categoryStats' => $categoryStats,
                'brandStats' => $brandStats,
                'recentActivity' => $recentActivity,
                'generatedAt' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            Log::error('❌ Product Search Stats Error:', [
                'error' => $e->getMessage(),
                'filters' => $filters
            ]);

            // Return empty stats structure on error
            return [
                'statusCounts' => [
                    'active' => 0, 
                    'inactive' => 0, 
                    'lowStock' => 0, 
                    'outOfStock' => 0, 
                    'overstock' => 0
                ],
                'priceRanges' => ['budget' => 0, 'moderate' => 0, 'premium' => 0, 'expensive' => 0],
                'stockAnalysis' => ['low_min_stock' => 0, 'medium_min_stock' => 0, 'high_min_stock' => 0],
                'categoryStats' => [],
                'brandStats' => [],
                'recentActivity' => ['new_products' => 0, 'recently_updated' => 0],
                'generatedAt' => now()->toISOString(),
                'error' => 'Failed to generate statistics'
            ];
        }
    }

    /**
     * Apply filters to query - extracted for reusability and performance
     */
    private function applyFiltersToQuery($query, array $filters)
    {
        // Basic search (from search input) across multiple fields
        if (!empty($filters['search'])) {
            $search = $filters['search'];
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

        // Global search across multiple fields (from advanced search)
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

        // Text field searches
        if (!empty($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }
        if (!empty($filters['sku'])) {
            $query->where('sku', 'like', "%{$filters['sku']}%");
        }
        if (!empty($filters['description'])) {
            $query->where('description', 'like', "%{$filters['description']}%");
        }
        if (!empty($filters['barcode'])) {
            $query->where('barcode', 'like', "%{$filters['barcode']}%");
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

        // Price filters
        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }
        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        // Status filters
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true' || $filters['is_active'] === true);
        }

        // Date filters
        if (!empty($filters['created_after'])) {
            $query->where('created_at', '>=', $filters['created_after']);
        }
        if (!empty($filters['created_before'])) {
            $query->where('created_at', '<=', $filters['created_before']);
        }
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