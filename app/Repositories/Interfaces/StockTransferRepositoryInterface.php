<?php

namespace App\Repositories\Interfaces;

use App\Models\StockTransfer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface StockTransferRepositoryInterface
{
    // Core CRUD Operations
    public function findAll(array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?StockTransfer;
    public function create(array $data): StockTransfer;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;

    // Transfer-specific Query Methods
    public function findByReferenceNumber(string $referenceNumber): ?StockTransfer;
    public function getByStatus(string $status, int $perPage = 15): LengthAwarePaginator;
    public function getByWarehouse(int $warehouseId, string $type = 'both', int $perPage = 15): LengthAwarePaginator;
    public function getByProduct(int $productId, int $perPage = 15): LengthAwarePaginator;
    public function getPendingTransfers(int $perPage = 15): LengthAwarePaginator;
    public function getTransferHistory(int $productId, int $warehouseId): Collection;
    public function getTransfersByDateRange(string $startDate, string $endDate): Collection;

    // Status Management Methods
    public function updateStatus(int $transferId, string $status, int $userId, array $additionalData = []): bool;
    public function markAsApproved(int $transferId, int $approvedBy): bool;
    public function markAsInTransit(int $transferId): bool;
    public function markAsCompleted(int $transferId, int $completedBy): bool;
    public function markAsCancelled(int $transferId, string $reason): bool;

    // Analytics & Reporting Methods
    public function getTransferAnalytics(int $warehouseId = null): array;
    public function getTransferSummary(string $period = 'month'): array;
    public function getMostTransferredProducts(int $limit = 10): Collection;
    public function getWarehouseTransferActivity(int $warehouseId): array;

    // Advanced Query Methods
    public function searchTransfers(array $filters = []): LengthAwarePaginator;
    public function getTransfersRequiringApproval(int $perPage = 15): LengthAwarePaginator;
    public function getOverdueTransfers(int $daysOverdue = 7): Collection;
    public function getTransfersByUser(int $userId, string $role = 'initiated'): Collection;

    // Validation Helper Methods
    public function canCreateTransfer(int $fromWarehouseId, int $toWarehouseId, int $productId, int $quantity): bool;
    public function getAvailableQuantity(int $warehouseId, int $productId): int;
    public function checkForDuplicateTransfer(array $transferData): ?StockTransfer;
}