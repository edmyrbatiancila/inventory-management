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

        // Apply filters dynamically
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (!empty($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('sku', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->paginate($filters['per_page'] ?? 15);
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