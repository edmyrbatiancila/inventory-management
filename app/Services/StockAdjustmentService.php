<?php

namespace App\Services;

use App\Models\StockAdjustment;
use App\Repositories\Interfaces\InventoryRepositoryInterface;
use App\Repositories\Interfaces\StockAdjustmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockAdjustmentService
{
    protected StockAdjustmentRepositoryInterface $stockAdjustmentRepository;
    protected InventoryRepositoryInterface $inventoryRepository;

    public function __construct(
        StockAdjustmentRepositoryInterface $stockAdjustmentRepository,
        InventoryRepositoryInterface $inventoryRepository
    ){
        $this->stockAdjustmentRepository = $stockAdjustmentRepository;
        $this->inventoryRepository = $inventoryRepository;
    }

    /**
     * Get all stock adjustments with filtering and pagination
     */
    public function getAllStockAdjustments(array $filters = []): LengthAwarePaginator
    {
        $filters = array_merge([
            'per_page' => 15,
        ], $filters);

        return $this->stockAdjustmentRepository->findAll($filters);
    }

    /**
     * Get stock adjustment by ID
     */
    public function getStockAdjustmentById(int $id): ?StockAdjustment
    {
        return $this->stockAdjustmentRepository->findById($id);
    }

    /**
     * Create a stock adjustment
     */
    public function createStockAdjustment(array $data): StockAdjustment
    {
        try {
            return DB::transaction(function () use ($data) {
                // Get inventory record
                $inventory = $this->inventoryRepository->findById($data['inventory_id']);
                
                if (!$inventory) {
                    throw new \Exception('Inventory record not found');
                }

                // Calculate adjustment details
                $quantityBefore = $inventory->quantity_on_hand;
                $adjustmentType = $data['adjustment_type'];
                $quantityAdjusted = abs($data['quantity_adjusted']); // Ensure positive number
                
                // Calculate new quantity
                if ($adjustmentType === 'increase') {
                    $quantityAfter = $quantityBefore + $quantityAdjusted;
                } else {
                    $quantityAfter = max(0, $quantityBefore - $quantityAdjusted); // Prevent negative stock
                }

                // Create adjustment record
                $adjustmentData = array_merge($data, [
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'quantity_adjusted' => $quantityAdjusted,
                    'reference_number' => StockAdjustment::generateReferenceNumber(),
                    'adjusted_by' => Auth::id(),
                    'adjusted_at' => now(),
                ]);

                $stockAdjustment = $this->stockAdjustmentRepository->create($adjustmentData);

                // Update inventory
                $this->inventoryRepository->update($inventory->id, [
                    'quantity_on_hand' => $quantityAfter,
                ]);

                return $stockAdjustment;
            });

        } catch (\Exception $e) {
            Log::error('Error creating stock adjustment: ' . $e->getMessage());
            throw new \Exception('Failed to create stock adjustment: ' . $e->getMessage());
        }
    }

    /**
     * Get stock adjustments for a specific inventory
     */
    public function getAdjustmentsForInventory(int $inventoryId): Collection
    {
        return $this->stockAdjustmentRepository->findByInventory($inventoryId);
    }

    /**
     * Get stock adjustments by user
     */
    public function getAdjustmentsByUser(int $userId): Collection
    {
        return $this->stockAdjustmentRepository->findByUser($userId);
    }

    /**
     * Get recent stock adjustments
     */
    public function getRecentAdjustments(int $limit = 10): Collection
    {
        return $this->stockAdjustmentRepository->getRecentAdjustments($limit);
    }

    /**
     * Get adjustment analytics
     */
    public function getAdjustmentAnalytics(): array
    {
        $totalsByType = $this->stockAdjustmentRepository->getTotalAdjustmentsByType();
        
        return [
            'total_adjustments' => collect($totalsByType)->sum('count'),
            'increases' => $totalsByType['increase'] ?? ['count' => 0, 'total_quantity' => 0],
            'decreases' => $totalsByType['decrease'] ?? ['count' => 0, 'total_quantity' => 0],
            'recent_adjustments' => $this->getRecentAdjustments(5),
        ];
    }

    /**
     * Get available adjustment reasons
     */
    public function getAdjustmentReasons(): array
    {
        return [
            'damage' => 'Damaged Goods',
            'theft' => 'Theft/Loss',
            'found' => 'Found/Discovered',
            'expired' => 'Expired Products',
            'returned' => 'Customer Returns',
            'transfer_in' => 'Transfer In',
            'transfer_out' => 'Transfer Out',
            'correction' => 'Data Correction',
            'recount' => 'Physical Recount',
            'other' => 'Other (See Notes)',
        ];
    }
}