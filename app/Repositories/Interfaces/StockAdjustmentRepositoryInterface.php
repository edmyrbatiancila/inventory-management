<?php

namespace App\Repositories\Interfaces;

use App\Models\StockAdjustment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface StockAdjustmentRepositoryInterface
{
    // Core CRUD Operations
    public function findAll(array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?StockAdjustment;
    public function create(array $data): StockAdjustment;
    
    // Business-Specific Queries
    public function findByInventory(int $inventoryId): Collection;
    public function findByUser(int $userId): Collection;
    public function findByDateRange(string $startDate, string $endDate): Collection;
    public function findByAdjustmentType(string $type): Collection;
    
    // Analytics Methods
    public function getTotalAdjustmentsByType(): array;
    public function getAdjustmentsSummary(int $inventoryId): array;
    public function getRecentAdjustments(int $limit = 10): Collection;
}