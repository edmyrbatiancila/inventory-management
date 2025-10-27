<?php

namespace App\Repositories;

use App\Models\Inventory;
use App\Models\StockTransfer;
use App\Repositories\Interfaces\StockTransferRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class StockTransferRepository implements StockTransferRepositoryInterface
{
    protected $model;

    public function __construct(StockTransfer $model)
    {
        $this->model = $model;
    }

    // Core CRUD operations can be implemented here 
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->withRelations();

        // Apply filters if provided
        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['warehouse_id'])) {
            $query->byWarehouse($filters['warehouse_id'], $filters['warehouse_type'] ?? 'both');
        }

        if (!empty($filters['product_id'])) {
            $query->byProduct($filters['product_id']);
        }

        if (!empty($filters['search'])) {
            $query->where('reference_number', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($filters['per_page'] ?? 15);
    }

    public function findById(int $id): ?StockTransfer
    {
        return $this->model->withRelations()->find($id);
    }

    public function create(array $data): StockTransfer
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $transfer = $this->findById($id);
        return $transfer ? $transfer->update($data) : false;
    }

    public function delete(int $id): bool
    {
        $transfer = $this->findById($id);
        return $transfer ? $transfer->delete() : false;
    }

    // Transfer-specific Query Methods
    public function findByReferenceNumber(string $referenceNumber): ?StockTransfer
    {
        return $this->model->where('reference_number', $referenceNumber)
            ->withRelations()
            ->first();
    }

    public function getByStatus(string $status, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->byStatus($status)
            ->withRelations()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getByWarehouse(int $warehouseId, string $type = 'both', int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->byWarehouse($warehouseId, $type)
            ->withRelations()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getByProduct(int $productId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->byProduct($productId)
            ->withRelations()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getPendingTransfers(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->pending()
            ->withRelations()
            ->orderBy('initiated_at', 'asc')
            ->paginate($perPage);
    }

    public function getTransferHistory(int $productId, int $warehouseId): Collection
    {
        return $this->model->where(function($query) use ($warehouseId) {
                    $query->where('from_warehouse_id', $warehouseId)
                        ->orWhere('to_warehouse_id', $warehouseId);
                })
                ->where('product_id', $productId)
                ->withRelations()
                ->orderBy('created_at', 'desc')
                ->get();
    }

    public function getTransfersByDateRange(string $startDate, string $endDate): Collection
    {
        return $this->model->whereBetween('created_at', [$startDate, $endDate])
            ->withRelations()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Status Management Methods
    public function updateStatus(int $transferId, string $status, int $userId, array $additionalData = []): bool
    {
        $transfer = $this->findById($transferId);
        if (!$transfer) {
            return false;
        }

        $updateData = ['transfer_status' => $status];
        
        switch ($status) {
            case StockTransfer::STATUS_APPROVED:
                $updateData['approved_by'] = $userId;
                $updateData['approved_at'] = now();
                break;
            case StockTransfer::STATUS_COMPLETED:
                $updateData['completed_by'] = $userId;
                $updateData['completed_at'] = now();
                break;
            case StockTransfer::STATUS_CANCELLED:
                $updateData['cancelled_at'] = now();
                if (isset($additionalData['cancellation_reason'])) {
                    $updateData['cancellation_reason'] = $additionalData['cancellation_reason'];
                }
                break;
        }

        return $transfer->update($updateData);
    }

    public function markAsApproved(int $transferId, int $approvedBy): bool
    {
        return $this->updateStatus($transferId, StockTransfer::STATUS_APPROVED, $approvedBy);
    }

    public function markAsInTransit(int $transferId): bool
    {
        $transfer = $this->findById($transferId);
        return $transfer ? $transfer->update(['transfer_status' => StockTransfer::STATUS_IN_TRANSIT]) : false;
    }

    public function markAsCompleted(int $transferId, int $completedBy): bool
    {
        return $this->updateStatus($transferId, StockTransfer::STATUS_COMPLETED, $completedBy);
    }

    public function markAsCancelled(int $transferId, string $reason): bool
    {
        return $this->updateStatus($transferId, StockTransfer::STATUS_CANCELLED, 0, [
            'cancellation_reason' => $reason
        ]);
    }

    // Analytics & Reporting Methods
    public function getTransferAnalytics(int $warehouseId = null): array
    {
        $query = $this->model->query();
        
        if ($warehouseId) {
            $query->where(function($q) use ($warehouseId) {
                $q->where('from_warehouse_id', $warehouseId)
                    ->orWhere('to_warehouse_id', $warehouseId);
            });
        }

        return [
            'total_transfers' => $query->count(),
            'pending_transfers' => (clone $query)->where('transfer_status', StockTransfer::STATUS_PENDING)->count(),
            'completed_transfers' => (clone $query)->where('transfer_status', StockTransfer::STATUS_COMPLETED)->count(),
            'cancelled_transfers' => (clone $query)->where('transfer_status', StockTransfer::STATUS_CANCELLED)->count(),
            'this_month_transfers' => (clone $query)->whereMonth('created_at', now()->month)->count(),
            'total_quantity_transferred' => (clone $query)->where('transfer_status', StockTransfer::STATUS_COMPLETED)->sum('quantity_transferred'),
        ];
    }

    public function getTransferSummary(string $period = 'month'): array
    {
        $dateRange = $this->getDateRange($period);
        
        return $this->model->whereBetween('created_at', $dateRange)
            ->selectRaw('
                transfer_status,
                COUNT(*) as count,
                SUM(quantity_transferred) as total_quantity
            ')
            ->groupBy('transfer_status')
            ->get()
            ->toArray();
    }

    public function getMostTransferredProducts(int $limit = 10): Collection
    {
        return $this->model->select('product_id')
            ->selectRaw('COUNT(*) as transfer_count, SUM(quantity_transferred) as total_quantity')
            ->with('product')
            ->where('transfer_status', StockTransfer::STATUS_COMPLETED)
            ->groupBy('product_id')
            ->orderBy('transfer_count', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getWarehouseTransferActivity(int $warehouseId): array
    {
        $outgoing = $this->model->where('from_warehouse_id', $warehouseId)
            ->selectRaw('COUNT(*) as count, SUM(quantity_transferred) as quantity')
            ->where('transfer_status', StockTransfer::STATUS_COMPLETED)
            ->first();

        $incoming = $this->model->where('to_warehouse_id', $warehouseId)
            ->selectRaw('COUNT(*) as count, SUM(quantity_transferred) as quantity')
            ->where('transfer_status', StockTransfer::STATUS_COMPLETED)
            ->first();

        return [
            'outgoing' => ['count' => $outgoing->count ?? 0, 'quantity' => $outgoing->quantity ?? 0],
            'incoming' => ['count' => $incoming->count ?? 0, 'quantity' => $incoming->quantity ?? 0],
        ];
    }

    // Advanced Query Methods
    public function searchTransfers(array $filters = []): LengthAwarePaginator
    {
        return $this->findAll($filters);
    }

    public function getTransfersRequiringApproval(int $perPage = 15): LengthAwarePaginator
    {
        return $this->getPendingTransfers($perPage);
    }

    public function getOverdueTransfers(int $daysOverdue = 7): Collection
    {
        $cutoffDate = Carbon::now()->subDays($daysOverdue);
        
        return $this->model->where('transfer_status', StockTransfer::STATUS_IN_TRANSIT)
            ->where('approved_at', '<', $cutoffDate)
            ->withRelations()
            ->orderBy('approved_at', 'asc')
            ->get();
    }

    public function getTransfersByUser(int $userId, string $role = 'initiated'): Collection
    {
        $column = match($role) {
            'approved' => 'approved_by',
            'completed' => 'completed_by',
            default => 'initiated_by'
        };

        return $this->model->where($column, $userId)
            ->withRelations()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Validation Helper Methods
    public function canCreateTransfer(int $fromWarehouseId, int $toWarehouseId, int $productId, int $quantity): bool
    {
        if ($fromWarehouseId === $toWarehouseId) {
            return false;
        }

        $availableQuantity = $this->getAvailableQuantity($fromWarehouseId, $productId);
        return $availableQuantity >= $quantity;
    }

    public function getAvailableQuantity(int $warehouseId, int $productId): int
    {
        $inventory = Inventory::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->first();

        return $inventory ? $inventory->quantity : 0;
    }

    public function checkForDuplicateTransfer(array $transferData): ?StockTransfer
    {
        return $this->model->where('from_warehouse_id', $transferData['from_warehouse_id'])
            ->where('to_warehouse_id', $transferData['to_warehouse_id'])
            ->where('product_id', $transferData['product_id'])
            ->where('quantity_transferred', $transferData['quantity_transferred'])
            ->where('transfer_status', StockTransfer::STATUS_PENDING)
            ->whereDate('created_at', today())
            ->first();
    }

    // Helper Methods
    private function getDateRange(string $period): array
    {
        return match($period) {
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            default => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]
        };
    }
}