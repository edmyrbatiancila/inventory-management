<?php

namespace App\Repositories\Interfaces;

use App\Models\Inventory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface InventoryRepositoryInterface
{
    // Core CRUD Operations
    public function findAll(array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Inventory;
    public function create(array $data): Inventory;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;

    // Business-Specific Queries
    public function findByProduct(int $productId): Collection;
    public function findByWarehouse(int $warehouseId): Collection;
    public function findLowStock(): Collection;
    public function findByProductAndWarehouse(int $productId, int $warehouseId): ?Inventory;
    
    // Advanced Inventory Queries
    public function getInventoryLevels(): Collection;
    public function getStockMovementHistory(int $inventoryId): Collection;
    public function getTotalStockValue(): float;

    // Advanced Search Methods
    public function getSearchStats(array $filters = []): array;
    public function getOptimizedSearchStats(array $filters = []): array;
}