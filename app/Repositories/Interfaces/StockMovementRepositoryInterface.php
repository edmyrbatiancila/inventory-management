<?php

namespace App\Repositories\Interfaces;

use App\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface StockMovementRepositoryInterface
{
    // Core CRUD Operations
    public function findAll(array $filters = []): LengthAwarePaginator;
    public function getSearchStats(array $filters = []): array;
    public function findById(int $id): ?StockMovement;
    public function create(array $data): StockMovement;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;

    // Business-Specific Queries
    public function findByProduct(int $productId): Collection;
    public function findByWarehouse(int $warehouseId): Collection;
    public function findByMovementType(string $type): Collection;
    public function findByUser(int $userId): Collection;
    public function findPendingApproval(): Collection;
    public function findRecentMovements(int $limit = 10): Collection;
    
    // Analytics Methods
    public function getMovementSummaryByProduct(int $productId): array;
    public function getMovementSummaryByWarehouse(int $warehouseId): array;
    public function getMovementsByDateRange(string $startDate, string $endDate): Collection;
    public function getTopMovementsByValue(int $limit = 10): Collection;

    // Advanced Search Stats
    public function getAdvancedSearchStats(array $filters): array;
}