<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use App\Models\StockAdjustment;
use App\Repositories\Interfaces\InventoryRepositoryInterface;
use App\Repositories\Interfaces\StockAdjustmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    protected InventoryRepositoryInterface $inventoryRepository;
    protected StockAdjustmentRepositoryInterface $stockAdjustmentRepository;

    public function __construct(InventoryRepositoryInterface $inventoryRepository, StockAdjustmentRepositoryInterface $stockAdjustmentRepository)
    {
        $this->inventoryRepository = $inventoryRepository;
        $this->stockAdjustmentRepository = $stockAdjustmentRepository;
    }

    /**
     * Get search statistics for inventory filters
     */
    public function getSearchStats(array $filters = []): array
    {
        return $this->inventoryRepository->getOptimizedSearchStats($filters);
    }

    /**
     * Get all inventories with filtering and pagination
     */
    public function getAllInventories(array $filters = []): LengthAwarePaginator
    {
        // add default filters
        $filters = array_merge([
            'per_page' => 15,
        ], $filters);

        return $this->inventoryRepository->findAll($filters);
    }

    /**
     * Get inventory by ID
     */
    public function getInventoryById(int $id): ?Inventory
    {
        return $this->inventoryRepository->findById($id);
    }

    /**
     * Create a new inventory record
     */
    public function createInventory(array $data): Inventory
    {
        try {
            DB::beginTransaction();

            // Validate that product and warehouse exist
            $existingInventory = $this->inventoryRepository->findByProductAndWarehouse($data['product_id'], $data['warehouse_id']);

            if($existingInventory) {
                throw new ValidationException('Inventory record already exists for this product in this warehouse');
            }

            // Set default values
            $data['quantity_available'] = ($data['quantity_on_hand'] ?? 0) - ($data['quantity_reserved'] ?? 0);

            $inventory = $this->inventoryRepository->create($data);

            DB::commit();
            return $inventory;

        } catch (\Exception $e) {
            DB::rollBack();

            throw new \Exception('Error creating inventory: ' . $e->getMessage());
        }
    }

    /**
     * Update inventory quantity
     */
    public function updateInventoryQuantity(int $id, int $quantity, string $reason = null): bool
    {
        try {
            DB::beginTransaction();

            $inventory = $this->getInventoryById($id);
            if (!$inventory) {
                throw new ModelNotFoundException('Inventory not found');
            }

            $oldQuantity = $inventory->quantity_on_hand;
            $result = $this->inventoryRepository->update($id, [
                'quantity_on_hand' => $quantity
            ]);

            // Log the change (you'll need to create InventoryMovement model later)
            // $this->logInventoryMovement($id, $oldQuantity, $quantity, 'adjustment', $reason);

            DB::commit();
            return $result;

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error updating inventory: ' . $e->getMessage());
        }
    }

    /**
     * Adjust stock (add or subtract)
     */
    public function adjustStock(int $id, int $adjustment, string $reason = null): bool
    {
        $inventory = $this->getInventoryById($id);
        if (!$inventory) {
            throw new ModelNotFoundException('Inventory not found');
        }

        $newQuantity = max(0, $inventory->quantity_on_hand + $adjustment);
        return $this->updateInventoryQuantity($id, $newQuantity, $reason);
    }

    /**
     * Transfer stock between warehouses
     */
    public function transferStock(int $fromInventoryId, int $toInventoryId, int $quantity): bool
    {
        try {
            DB::beginTransaction();

            $fromInventory = $this->getInventoryById($fromInventoryId);
            $toInventory = $this->getInventoryById($toInventoryId);

            if (!$fromInventory || !$toInventory) {
                throw new ModelNotFoundException('One or both inventory records not found');
            }

            if ($fromInventory->quantity_available < $quantity) {
                throw new ValidationException('Insufficient available quantity for transfer');
            }

            // Reduce from source
            $this->inventoryRepository->update($fromInventoryId, [
                'quantity_on_hand' => $fromInventory->quantity_on_hand - $quantity
            ]);

            // Add to destination
            $this->inventoryRepository->update($toInventoryId, [
                'quantity_on_hand' => $toInventory->quantity_on_hand + $quantity
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error transferring stock: ' . $e->getMessage());
        }
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts(): Collection
    {
        return $this->inventoryRepository->findLowStock();
    }

    /**
     * Get inventory analytics
     */
    public function getInventoryAnalytics(): array
    {
        $totalValue = $this->inventoryRepository->getTotalStockValue();
        $lowStockCount = $this->inventoryRepository->findLowStock()->count();
        
        return [
            'total_inventory_value' => $totalValue,
            'low_stock_items' => $lowStockCount,
            'total_products_tracked' => Inventory::distinct('product_id')->count(),
            'total_warehouses_active' => Inventory::distinct('warehouse_id')->count(),
        ];
    }

    /**
     * Update inventory record
     */
    public function updateInventory(int $id, array $data): bool
    {
        try {
            DB::beginTransaction();
            
            $inventory = $this->getInventoryById($id);
            if (!$inventory) {
                throw new ModelNotFoundException('Inventory not found');
            }
            
            // Set calculated available quantity
            $data['quantity_available'] = ($data['quantity_on_hand'] ?? $inventory->quantity_on_hand) - 
                ($data['quantity_reserved'] ?? $inventory->quantity_reserved);
            
            $result = $this->inventoryRepository->update($id, $data);
            
            DB::commit();
            return $result;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error updating inventory: ' . $e->getMessage());
        }
    }

    /**
     * Delete inventory record
     */
    public function deleteInventory(int $id): bool
    {
        try {
            DB::beginTransaction();

            $inventory = $this->getInventoryById($id);
            if (!$inventory) {
                throw new ModelNotFoundException('Inventory not found');
            }

            // Check if there are reserved quantities
            if ($inventory->quantity_reserved > 0) {
                throw new \Exception(json_encode([
                    'type' => 'reserved_quantity',
                    'title' => 'Cannot Delete Inventory',
                    'message' => 'This inventory has reserved quantities that must be released before deletion.',
                    'reserved_quantity' => $inventory->quantity_reserved,
                    'available_quantity' => $inventory->quantity_available,
                    'steps' => [
                        'Go to the Edit page for this inventory item',
                        'Reduce the "Quantity Reserved" to 0',
                        'Save the changes',
                        'Return to this page and try deleting again'
                    ]
                ]));
            }

            $result = $this->inventoryRepository->delete($id);

            DB::commit();
            return $result;

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error deleting inventory: ' . $e->getMessage());
        }
    }

    /**
     * Adjust inventory stock with full audit trail
     */
    public function adjustInventoryStock(int $inventoryId, string $adjustmentType, int $quantity, string $reason, ?string $notes = null): array
    {
        try {
            DB::beginTransaction();

            $inventory = $this->getInventoryById($inventoryId);
            if (!$inventory) {
                throw new ModelNotFoundException('Inventory not found');
            }

            // Calculate new quantities
            $quantityBefore = $inventory->quantity_on_hand;
            $newQuantity = $adjustmentType === 'increase' 
                ? $quantityBefore + $quantity 
                : $quantityBefore - $quantity;

            // Create adjustment record
            $adjustment = $this->stockAdjustmentRepository->create([
                'inventory_id' => $inventoryId,
                'adjustment_type' => $adjustmentType,
                'quantity_adjusted' => $quantity,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $newQuantity,
                'reason' => $reason,
                'notes' => $notes,
                'reference_number' => StockAdjustment::generateReferenceNumber(),
                'adjusted_by' => auth()->id(),
                'adjusted_at' => now(),
            ]);

            // Update inventory
            $updated = $this->inventoryRepository->update($inventoryId, [
                'quantity_on_hand' => $newQuantity
            ]);

            if (!$updated) {
                throw new \Exception('Failed to update inventory');
            }

            DB::commit();

            // Reload inventory to get updated calculated fields
            $updatedInventory = $this->getInventoryById($inventoryId);

            return [
                'success' => true,
                'adjustment' => $adjustment,
                'inventory' => $updatedInventory,
                'message' => "Stock {$adjustmentType}d by {$quantity}. Reference: {$adjustment->reference_number}"
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error adjusting stock: ' . $e->getMessage());
        }
    }

    /**
     * Get stock adjustment history for inventory
     */
    public function getInventoryAdjustmentHistory(int $inventoryId): Collection
    {
        return $this->stockAdjustmentRepository->findByInventory($inventoryId);
    }

    /**
     * Get adjustment summary for inventory
     */
    public function getInventoryAdjustmentSummary(int $inventoryId): array
    {
        return $this->stockAdjustmentRepository->getAdjustmentsSummary($inventoryId);
    }

    /**
     * Increase stock quantity for a specific warehouse/product combination
     */
    public function increaseStock(int $warehouseId, int $productId, int $quantity, string $referenceType, int $referenceId, string $notes = null): bool
    {
        try {
            DB::beginTransaction();

            // Find or create inventory record
            $inventory = $this->inventoryRepository->findByProductAndWarehouse($productId, $warehouseId);

            if (!$inventory) {
                // Create new inventory record if doesn't exist
                $inventory = $this->inventoryRepository->create([
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,
                    'quantity_on_hand' => $quantity,
                    'quantity_reserved' => 0,
                    'quantity_available' => $quantity,
                    'min_stock_level' => 0,
                    'max_stock_level' => 0,
                ]);
            } else {
                // Update existing inventory
                $newQuantityOnHand = $inventory->quantity_on_hand + $quantity;
                $newQuantityAvailable = $inventory->quantity_available + $quantity;

                $this->inventoryRepository->update($inventory->id, [
                    'quantity_on_hand' => $newQuantityOnHand,
                    'quantity_available' => $newQuantityAvailable,
                ]);

                $inventory->refresh();
            }

            // Create inventory movement record
            $this->createInventoryMovement([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'type' => 'increase',
                'quantity' => $quantity,
                'quantity_before' => $inventory->quantity_on_hand - $quantity,
                'quantity_after' => $inventory->quantity_on_hand,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'movement_date' => now(),
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Decrease stock quantity for a specific warehouse/product combination
     */
    public function decreaseStock(int $warehouseId, int $productId, int $quantity, string $referenceType, int $referenceId, string $notes = null): bool
    {
        try {
            DB::beginTransaction();

            // Find inventory record
            $inventory = $this->inventoryRepository->findByProductAndWarehouse($productId, $warehouseId);

            if (!$inventory) {
                throw new ValidationException("Inventory record not found for product {$productId} in warehouse {$warehouseId}");
            }

            // Check if there's enough stock
            if ($inventory->quantity_available < $quantity) {
                throw new ValidationException("Insufficient stock. Available: {$inventory->quantity_available}, Requested: {$quantity}");
            }

            // Update inventory
            $newQuantityOnHand = $inventory->quantity_on_hand - $quantity;
            $newQuantityAvailable = $inventory->quantity_available - $quantity;

            $this->inventoryRepository->update($inventory->id, [
                'quantity_on_hand' => $newQuantityOnHand,
                'quantity_available' => $newQuantityAvailable,
            ]);

            // Create inventory movement record
            $this->createInventoryMovement([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'type' => 'decrease',
                'quantity' => -$quantity, // Negative for decrease
                'quantity_before' => $inventory->quantity_on_hand,
                'quantity_after' => $newQuantityOnHand,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'movement_date' => now(),
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create inventory movement record
     */
    private function createInventoryMovement(array $data): void
    {
        // Assuming you have an InventoryMovement model and repository
        InventoryMovement::create($data);
    }
}