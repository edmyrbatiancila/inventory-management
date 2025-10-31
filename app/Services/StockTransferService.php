<?php

namespace App\Services;

use App\Models\StockTransfer;
use App\Repositories\Interfaces\StockTransferRepositoryInterface;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockTransferService
{
    public function __construct(
        private StockTransferRepositoryInterface $stockTransferRepository,
        private InventoryService $inventoryService
    ) {}

    /**
     * Get all stock transfers with filtering and pagination
     */
    public function getAllStockTransfers(array $filters = []): LengthAwarePaginator
    {
        $filters = array_merge([
            'per_page' => 15,
        ], $filters);

        return $this->stockTransferRepository->findAll($filters);

    }

    // Core Transfer Operations
    public function initiateTransfer(array $data): StockTransfer
    {
        // Validate transfer possibility
        $this->validateTransferRequest($data);

        DB::beginTransaction();
        try {
            // Generate reference number
            $data['reference_number'] = $this->generateReferenceNumber();
            $data['initiated_by'] = Auth::id();
            $data['initiated_at'] = now();
            $data['transfer_status'] = StockTransfer::STATUS_PENDING;

            // Create transfer record
            $transfer = $this->stockTransferRepository->create($data);

            // Log the initiation
            $this->logTransferActivity($transfer, 'initiated');

            DB::commit();
            return $transfer;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function approveTransfer(int $transferId, int $approvedBy): StockTransfer
    {
        $transfer = $this->stockTransferRepository->findById($transferId);
        
        if (!$transfer || !$transfer->canBeApproved()) {
            throw new ValidationException('Transfer cannot be approved');
        }

        // Re-validate inventory availability
        $this->validateInventoryAvailability(
            $transfer->from_warehouse_id,
            $transfer->product_id,
            $transfer->quantity_transferred
        );

        DB::beginTransaction();
        try {
            // Update transfer status
            $this->stockTransferRepository->markAsApproved($transferId, $approvedBy);
            
            // Refresh model
            $transfer->refresh();
            
            // Log the approval
            $this->logTransferActivity($transfer, 'approved');

            DB::commit();
            return $transfer;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function markInTransit(int $transferId): StockTransfer
    {
        $transfer = $this->stockTransferRepository->findById($transferId);
        
        if (!$transfer || !$transfer->canBeMarkedInTransit()) {
            throw new ValidationException('Transfer cannot be marked as in transit');
        }

        DB::beginTransaction();
        try {
            // Update inventory - remove from source warehouse
            $this->inventoryService->decreaseStock(
                $transfer->from_warehouse_id,
                $transfer->product_id,
                $transfer->quantity_transferred,
                'stock_transfer',
                $transfer->id,
                "Stock transfer {$transfer->reference_number} - items shipped"
            );

            // Update transfer status
            $this->stockTransferRepository->markAsInTransit($transferId);
            
            // Refresh model
            $transfer->refresh();
            
            // Log the transit
            $this->logTransferActivity($transfer, 'in_transit');

            DB::commit();
            return $transfer;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function completeTransfer(int $transferId, int $completedBy): StockTransfer
    {
        $transfer = $this->stockTransferRepository->findById($transferId);
        
        if (!$transfer || !$transfer->canBeCompleted()) {
            throw new ValidationException('Transfer cannot be completed');
        }

        DB::beginTransaction();
        try {
            // Update inventory - add to destination warehouse
            $this->inventoryService->increaseStock(
                $transfer->to_warehouse_id,
                $transfer->product_id,
                $transfer->quantity_transferred,
                'stock_transfer',
                $transfer->id,
                "Stock transfer {$transfer->reference_number} - items received"
            );

            // Update transfer status
            $this->stockTransferRepository->markAsCompleted($transferId, $completedBy);
            
            // Refresh model
            $transfer->refresh();
            
            // Log the completion
            $this->logTransferActivity($transfer, 'completed');

            DB::commit();
            return $transfer;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function cancelTransfer(int $transferId, string $reason): StockTransfer
    {
        $transfer = $this->stockTransferRepository->findById($transferId);
        
        if (!$transfer || !$transfer->canBeCancelled()) {
            throw new ValidationException('Transfer cannot be cancelled');
        }

        DB::beginTransaction();
        try {
            // If transfer was in transit, restore inventory to source warehouse
            if ($transfer->transfer_status === StockTransfer::STATUS_IN_TRANSIT) {
                $this->inventoryService->increaseStock(
                    $transfer->from_warehouse_id,
                    $transfer->product_id,
                    $transfer->quantity_transferred,
                    'stock_transfer_cancellation',
                    $transfer->id,
                    "Stock transfer {$transfer->reference_number} cancelled - items returned"
                );
            }

            // Update transfer status
            $this->stockTransferRepository->markAsCancelled($transferId, $reason);
            
            // Refresh model
            $transfer->refresh();
            
            // Log the cancellation
            $this->logTransferActivity($transfer, 'cancelled');

            DB::commit();
            return $transfer;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // Validation Methods
    private function validateTransferRequest(array $data): void
    {
        // Check if warehouses are different
        if ($data['from_warehouse_id'] === $data['to_warehouse_id']) {
            throw new \Exception('Source and destination warehouses must be different');
        }

        // Check inventory availability
        $this->validateInventoryAvailability(
            $data['from_warehouse_id'],
            $data['product_id'],
            $data['quantity_transferred']
        );

        // Check for duplicate transfers
        $duplicate = $this->stockTransferRepository->checkForDuplicateTransfer($data);
        if ($duplicate) {
            throw new \Exception('A similar transfer request already exists');
        }
    }

    private function validateInventoryAvailability(int $warehouseId, int $productId, int $quantity): void
    {
        $available = $this->stockTransferRepository->getAvailableQuantity($warehouseId, $productId);
        
        if ($available < $quantity) {
            throw new \Exception("Insufficient inventory. Available: {$available}, Requested: {$quantity}");
        }
    }

    // Helper Methods
    private function generateReferenceNumber(): string
    {
        $prefix = 'ST';
        $date = now()->format('Ymd');
        $sequence = $this->getNextSequenceNumber($date);
        
        return "{$prefix}-{$date}-{$sequence}";
    }

    private function getNextSequenceNumber(string $date): string
    {
        $count = StockTransfer::whereDate('created_at', today())->count();
        return str_pad($count + 1, 4, '0', STR_PAD_LEFT);
    }

    private function logTransferActivity(StockTransfer $transfer, string $activity): void
    {
        // Log transfer activity for audit trail
        logger()->info("Stock Transfer {$activity}", [
            'transfer_id' => $transfer->id,
            'reference_number' => $transfer->reference_number,
            'activity' => $activity,
            'user_id' => Auth::id(),
            'timestamp' => now()
        ]);
    }

    // Query Helper Methods
    public function getTransferAnalytics(int $warehouseId = null): array
    {
        return $this->stockTransferRepository->getTransferAnalytics($warehouseId);
    }

    // public function searchTransfers(array $filters, int $perPage = 15)
    // {
    //     return $this->stockTransferRepository->searchTransfers($filters);
    // }

    public function getPendingApprovals(int $perPage = 15)
    {
        return $this->stockTransferRepository->getPendingTransfers($perPage);
    }

    public function getTransferHistory(int $productId, int $warehouseId)
    {
        return $this->stockTransferRepository->getTransferHistory($productId, $warehouseId);
    }

    public function getOverdueTransfers(int $daysOverdue = 7)
    {
        return $this->stockTransferRepository->getOverdueTransfers($daysOverdue);
    }

    public function updateTransfer(int $transferId, array $data): StockTransfer
    {
        $transfer = $this->stockTransferRepository->findById($transferId);
        
        if (!$transfer) {
            throw new ModelNotFoundException('Transfer not found');
        }

        // Only allow core detail updates for pending transfers
        if ($transfer->transfer_status === 'pending' && isset($data['from_warehouse_id'])) {
            // Validate inventory availability for new details
            $this->validateInventoryAvailability(
                $data['from_warehouse_id'],
                $data['product_id'],
                $data['quantity_transferred']
            );
        }

        return DB::transaction(function () use ($transfer, $data, $transferId) {
            $updated = $this->stockTransferRepository->update($transferId, $data);
            
            if (!$updated) {
                throw new Exception('Failed to update transfer');
            }
            
            return $this->stockTransferRepository->findById($transferId);
        });
    }

    public function bulkApproveTransfers(array $transferIds, int $approvedBy)
    {
        $approved = 0;
        $failed = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($transferIds as $transferId) {
                try {
                    $transfer = $this->stockTransferRepository->findById($transferId);
                
                    if (!$transfer) {
                        $errors[] = "Transfer ID {$transferId} not found";
                        $failed++;
                        continue;
                    }

                    if (!$transfer->canBeApproved()) {
                        $errors[] = "Transfer {$transfer->reference_number} cannot be approved";
                        $failed++;
                        continue;
                    }

                    $this->approveTransfer($transferId, $approvedBy);
                    $approved++;
                } catch (Exception $e) {
                    $errors[] = "Failed to approve transfer ID {$transferId}: " . $e->getMessage();
                    $failed++;
                }
            }

            if ($failed === 0) {
                DB::commit();
            } else {
                DB::commit();
            }

            return [
                'approved' => $approved,
                'failed' => $failed,
                'errors' => $errors
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function bulkCancelTransfers(array $transferIds, string $reason): array
    {
        $cancelled = 0;
        $failed = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($transferIds as $transferId) {
                try {
                    $transfer = $this->stockTransferRepository->findById($transferId);

                    if (!$transfer) {
                        $errors[] = "Transfer ID {$transferId} not found";
                        $failed++;
                        continue;
                    }

                    if (!$transfer->canBeCancelled()) {
                        $errors[] = "Transfer {$transfer->reference_number} cannot be cancelled";
                        $failed++;
                        continue;
                    }

                    $this->cancelTransfer($transferId, $reason);
                    $cancelled++;

                } catch (Exception $e) {
                    $errors[] = "Failed to cancel transfer ID {$transferId}: " . $e->getMessage();
                    $failed++;
                }
            }

            if ($failed === 0) {
                DB::commit();
            } else {
                DB::commit();
            }

            return [
                'cancelled' => $cancelled,
                'failed' => $failed,
                'errors' => $errors
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
}