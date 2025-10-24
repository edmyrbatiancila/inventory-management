<?php

namespace App\Services;

use App\Models\Inventory;
use App\Repositories\Interfaces\InventoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    protected InventoryRepositoryInterface $inventoryRepository;

    public function __construct(InventoryRepositoryInterface $inventoryRepository)
    {
        $this->inventoryRepository = $inventoryRepository;
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
                throw new ValidationException('Cannot delete inventory with reserved quantities');
            }

            $result = $this->inventoryRepository->delete($id);

            DB::commit();
            return $result;

        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Error deleting inventory: ' . $e->getMessage());
        }
    }

}