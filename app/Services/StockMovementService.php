<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\StockMovement;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockMovementService
{
    protected StockMovementRepositoryInterface $stockMovementRepository;

    public function __construct(StockMovementRepositoryInterface $stockMovementRepository)
    {
        $this->stockMovementRepository = $stockMovementRepository;
    }

    public function getAllMovements(array $filters = []): LengthAwarePaginator
    {
        return $this->stockMovementRepository->findAll($filters);
    }

    public function getMovementById(int $id): ?StockMovement
    {
        return $this->stockMovementRepository->findById($id);
    }

    public function getSearchStats(array $filters = []): array
    {
        return $this->stockMovementRepository->getSearchStats($filters);
    }

    public function createMovement(array $data): StockMovement
    {
        DB::beginTransaction();

        try {
            // Get current inventory
            $inventory = Inventory::where('product_id', $data['product_id'])
                ->where('warehouse_id', $data['warehouse_id'])
                ->first();

            if (!$inventory) {
                throw new \Exception('Inventory not found for this product and warehouse');
            }

            // Calculate movement details
            $quantityBefore = $inventory->quantity_available;
            $quantityMoved = $data['quantity_moved'];
            $quantityAfter = $quantityBefore + $quantityMoved;

            // Validate movement
            if ($quantityAfter < 0) {
                throw new \Exception('Insufficient inventory for this movement');
            }

            // Get product cost for value calculation
            $product = Product::find($data['product_id']);
            $unitCost = $data['unit_cost'] ?? $product->cost_price ?? 0;
            $totalValue = $quantityMoved * $unitCost;

            // Prepare movement data
            $movementData = array_merge($data, [
                'reference_number' => StockMovement::generateReferenceNumber(),
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'unit_cost' => $unitCost,
                'total_value' => $totalValue,
                'user_id' => Auth::id(),
                'status' => 'pending'
            ]);

            // Create movement record
            $movement = $this->stockMovementRepository->create($movementData);

            // Auto-approve simple movements (adjustments under $100)
            if (in_array($movement->movement_type, ['adjustment_increase', 'adjustment_decrease']) 
                && abs($totalValue) < 100) {
                $this->approveMovement($movement->id);
            }

            DB::commit();
            
            Log::info('Stock movement created', [
                'movement_id' => $movement->id,
                'reference' => $movement->reference_number,
                'product_id' => $movement->product_id,
                'warehouse_id' => $movement->warehouse_id
            ]);

            return $movement;

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Stock movement creation failed', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function approveMovement(int $movementId): bool
    {
        DB::beginTransaction();

        try {
            $movement = $this->stockMovementRepository->findById($movementId);
            
            if (!$movement || $movement->status !== 'pending') {
                throw new \Exception('Movement cannot be approved');
            }

            // Update movement status
            $this->stockMovementRepository->update($movementId, [
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now()
            ]);

            // Apply to inventory
            $this->applyMovementToInventory($movement);

            // Update status to applied
            $this->stockMovementRepository->update($movementId, [
                'status' => 'applied'
            ]);

            DB::commit();
            
            Log::info('Stock movement approved and applied', [
                'movement_id' => $movementId,
                'approved_by' => Auth::id()
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Stock movement approval failed', [
                'movement_id' => $movementId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function rejectMovement(int $movementId, string $reason = ''): bool
    {
        $movement = $this->stockMovementRepository->findById($movementId);
        
        if (!$movement || $movement->status !== 'pending') {
            throw new \Exception('Movement cannot be rejected');
        }

        return $this->stockMovementRepository->update($movementId, [
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'notes' => $movement->notes . "\n\nRejected: " . $reason
        ]);
    }

    protected function applyMovementToInventory(StockMovement $movement): void
    {
        $inventory = Inventory::where('product_id', $movement->product_id)
            ->where('warehouse_id', $movement->warehouse_id)
            ->first();

        if (!$inventory) {
            throw new \Exception('Inventory record not found');
        }

        // Update inventory quantities
        $newQuantityAvailable = $inventory->quantity_available + $movement->quantity_moved;
        $newQuantityOnHand = $inventory->quantity_on_hand + $movement->quantity_moved;

        if ($newQuantityAvailable < 0 || $newQuantityOnHand < 0) {
            throw new \Exception('Movement would result in negative inventory');
        }

        $inventory->update([
            'quantity_available' => $newQuantityAvailable,
            'quantity_on_hand' => $newQuantityOnHand,
            'updated_at' => now()
        ]);

        Log::info('Inventory updated from stock movement', [
            'inventory_id' => $inventory->id,
            'movement_id' => $movement->id,
            'quantity_change' => $movement->quantity_moved,
            'new_available' => $newQuantityAvailable
        ]);
    }

    public function getMovementsByProduct(int $productId): Collection
    {
        return $this->stockMovementRepository->findByProduct($productId);
    }

    public function getMovementsByWarehouse(int $warehouseId): Collection
    {
        return $this->stockMovementRepository->findByWarehouse($warehouseId);
    }

    public function getRecentMovements(int $limit = 10): Collection
    {
        return $this->stockMovementRepository->findRecentMovements($limit);
    }

    public function getMovementAnalytics(): array
    {
        return [
            'pendingApproval' => $this->stockMovementRepository->findPendingApproval()->count(),
            'todayMovements' => StockMovement::whereDate('created_at', today())->count(),
            'weekMovements' => StockMovement::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'monthMovements' => StockMovement::whereMonth('created_at', now()->month)->count(),
        ];
    }
}