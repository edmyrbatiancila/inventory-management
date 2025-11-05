<?php

namespace App\Repositories\Interfaces;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    // Core CRUD Operations
    public function findAll(array $filters = []): LengthAwarePaginator;
    public function getSearchStats(array $filters = []): array;
    public function findById(int $id): ?Product;
    public function create(array $data): Product;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;

    // Business-Specific Queries
    public function findByCategory(int $categoryId): Collection;
    public function findByBrand(int $brandId): Collection;
    public function findLowStock(): Collection;
    public function searchProducts(string $query): Collection;

    // Inventory-Related Methods
    public function findWithInventory(int $id): ?Product;
    public function findWithStock(): Collection;
    public function findNeedingReorder(): Collection;

}
