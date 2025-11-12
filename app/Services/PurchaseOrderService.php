<?php 

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Repositories\Interfaces\PurchaseOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PurchaseOrderService
{
    public function __construct(
        private PurchaseOrderRepositoryInterface $repository
    ) {}

    // ====== MAIN BUSINESS OPERATIONS ======

    /**
     * Create new purchase order with business logic
     */
    public function createPurchaseOrder(array $data): PurchaseOrder
    {
        // Set created_by if not provided
        if (!isset($data['purchase_order']['created_by'])) {
            $data['purchase_order']['created_by'] = Auth::id();
        }

        // Generate PO number if not provided
        if (!isset($data['purchase_order']['po_number'])) {
            $data['purchase_order']['po_number'] = PurchaseOrder::generatePoNumber();
        }

        // Set default status
        if (!isset($data['purchase_order']['status'])) {
            $data['purchase_order']['status'] = PurchaseOrder::STATUS_DRAFT;
        }

        // Validate items if provided
        if (isset($data['items'])) {
            $this->validateItems($data['items']);
        }

        return $this->repository->create($data);
    }

    /**
     * Update purchase order with business rules
     */
    public function updatePurchaseOrder(int $id, array $data): PurchaseOrder
    {
        $purchaseOrder = $this->repository->find($id);
        
        if (!$purchaseOrder) {
            throw new InvalidArgumentException("Purchase order not found with ID: {$id}");
        }

        // Business rule: Can't modify certain fields after approval
        if ($purchaseOrder->status !== PurchaseOrder::STATUS_DRAFT && 
            $purchaseOrder->status !== PurchaseOrder::STATUS_PENDING_APPROVAL) {
            
            $restrictedFields = ['warehouse_id', 'supplier_name', 'supplier_email'];
            foreach ($restrictedFields as $field) {
                if (isset($data[$field])) {
                    unset($data[$field]);
                }
            }
        }

        $this->repository->update($purchaseOrder, $data);
        
        return $this->repository->find($id);
    }

    /**
     * Approve purchase order
     */
    public function approvePurchaseOrder(int $id, int $approvedBy): bool
    {
        $purchaseOrder = $this->repository->find($id);
        
        if (!$purchaseOrder) {
            throw new InvalidArgumentException("Purchase order not found");
        }

        if (!$purchaseOrder->canBeApproved()) {
            throw new InvalidArgumentException("Purchase order cannot be approved in its current state");
        }

        return $this->repository->update($purchaseOrder, [
            'status' => PurchaseOrder::STATUS_APPROVED,
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
    }

    /**
     * Send purchase order to supplier
     */
    public function sendToSupplier(int $id): bool
    {
        $purchaseOrder = $this->repository->find($id);
        
        if (!$purchaseOrder || !$purchaseOrder->canBeSent()) {
            throw new InvalidArgumentException("Purchase order cannot be sent to supplier");
        }

        return $this->repository->update($purchaseOrder, [
            'status' => PurchaseOrder::STATUS_SENT_TO_SUPPLIER,
            'sent_at' => now(),
        ]);
    }

    /**
     * Cancel purchase order
     */
    public function cancelPurchaseOrder(int $id, string $reason): bool
    {
        $purchaseOrder = $this->repository->find($id);
        
        if (!$purchaseOrder || !$purchaseOrder->canBeCancelled()) {
            throw new InvalidArgumentException("Purchase order cannot be cancelled");
        }

        return $this->repository->update($purchaseOrder, [
            'status' => PurchaseOrder::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    // ====== ITEM MANAGEMENT ======

    /**
     * Add item to purchase order with validation
     */
    public function addItemToPurchaseOrder(int $poId, array $itemData): PurchaseOrderItem
    {
        $purchaseOrder = $this->repository->find($poId);
        
        if (!$purchaseOrder) {
            throw new InvalidArgumentException("Purchase order not found");
        }

        // Business rule: Can't add items after sent to supplier
        if (in_array($purchaseOrder->status, [
            PurchaseOrder::STATUS_SENT_TO_SUPPLIER,
            PurchaseOrder::STATUS_PARTIALLY_RECEIVED,
            PurchaseOrder::STATUS_FULLY_RECEIVED,
            PurchaseOrder::STATUS_CANCELLED
        ])) {
            throw new InvalidArgumentException("Cannot add items to purchase order in current status");
        }

        $this->validateItemData($itemData);
        
        return $this->repository->addItem($purchaseOrder, $itemData);
    }

    /**
     * Update item with business logic
     */
    public function updateItem(int $poId, int $itemId, array $itemData): bool
    {
        $purchaseOrder = $this->repository->find($poId);
        
        if (!$purchaseOrder) {
            throw new InvalidArgumentException("Purchase order not found");
        }

        return $this->repository->updateItem($purchaseOrder, $itemId, $itemData);
    }

    /**
     * Receive items (partial or full)
     */
    public function receiveItems(int $poId, array $receivingData): bool
    {
        $purchaseOrder = $this->repository->find($poId);
        
        if (!$purchaseOrder || !$purchaseOrder->canBeReceived()) {
            throw new InvalidArgumentException("Purchase order cannot receive items");
        }

        return DB::transaction(function () use ($purchaseOrder, $receivingData) {
            foreach ($receivingData['items'] as $itemData) {
                $item = $this->repository->getItem($purchaseOrder, $itemData['item_id']);
                
                if ($item && isset($itemData['quantity_received'])) {
                    $item->receiveQuantity(
                        $itemData['quantity_received'], 
                        $itemData['notes'] ?? null
                    );
                }
            }

            // Update received_by if this is the first receiving
            if (!$purchaseOrder->received_by) {
                $this->repository->update($purchaseOrder, [
                    'received_by' => $receivingData['received_by'] ?? Auth::id(),
                    'received_at' => now(),
                ]);
            }

            return true;
        });
    }

    // ====== QUERY METHODS ======

    public function getPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function getPurchaseOrder(int $id): ?PurchaseOrder
    {
        return $this->repository->find($id);
    }

    public function getOverduePurchaseOrders(): Collection
    {
        return $this->repository->findOverdue();
    }

    public function getPendingApprovals(): Collection
    {
        return $this->repository->getPendingApprovals();
    }

    public function getDashboardStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    // ====== VALIDATION HELPERS ======

    private function validateItems(array $items): void
    {
        foreach ($items as $item) {
            $this->validateItemData($item);
        }
    }

    private function validateItemData(array $itemData): void
    {
        $required = ['product_id', 'quantity_ordered', 'unit_cost'];
        
        foreach ($required as $field) {
            if (!isset($itemData[$field])) {
                throw new InvalidArgumentException("Missing required field: {$field}");
            }
        }

        if ($itemData['quantity_ordered'] <= 0) {
            throw new InvalidArgumentException("Quantity ordered must be greater than 0");
        }

        if ($itemData['unit_cost'] < 0) {
            throw new InvalidArgumentException("Unit cost cannot be negative");
        }
    }
}