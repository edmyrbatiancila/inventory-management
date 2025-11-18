<?php 

namespace App\Services;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Repositories\Interfaces\SalesOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SalesOrderService
{
    public function __construct(
        private SalesOrderRepositoryInterface $repository
    ) {}

    // ====== MAIN BUSINESS OPERATIONS ======

    /**
     * Create new sales order with business logic
     */
    public function createSalesOrder(array $data): SalesOrder
    {
        // Set created_by if not provided
        if (!isset($data['sales_order']['created_by'])) {
            $data['sales_order']['created_by'] = Auth::id();
        }

        // Generate SO number if not provided
        if (!isset($data['sales_order']['so_number'])) {
            $data['sales_order']['so_number'] = SalesOrder::generateNumber('SO');
        }

        // Set default status
        if (!isset($data['sales_order']['status'])) {
            $data['sales_order']['status'] = 'draft';
        }

        // Set default payment status
        if (!isset($data['sales_order']['payment_status'])) {
            $data['sales_order']['payment_status'] = 'pending';
        }

        // Validate items if provided
        if (isset($data['items'])) {
            $this->validateItems($data['items']);
        }

        return $this->repository->create($data);
    }

    /**
     * Update sales order with business rules
     */
    public function updateSalesOrder(int $id, array $data): SalesOrder
    {
        $salesOrder = $this->repository->find($id);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found with ID: {$id}");
        }

        // Business rule: Can't modify certain fields after confirmation
        if (!$salesOrder->canBeEdited()) {
            $restrictedFields = ['warehouse_id', 'customer_name', 'customer_email'];
            foreach ($restrictedFields as $field) {
                if (isset($data[$field])) {
                    unset($data[$field]);
                }
            }
        }

        $this->repository->update($salesOrder, $data);
        
        return $this->repository->find($id);
    }

    /**
     * Approve sales order
     */
    public function approveSalesOrder(int $id, int $approvedBy): bool
    {
        $salesOrder = $this->repository->find($id);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        if ($salesOrder->status !== 'pending_approval') {
            throw new InvalidArgumentException("Sales order cannot be approved in its current state");
        }

        return $this->repository->update($salesOrder, [
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
    }

    /**
     * Confirm sales order
     */
    public function confirmSalesOrder(int $id): bool
    {
        $salesOrder = $this->repository->find($id);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        if (!in_array($salesOrder->status, ['draft', 'approved'])) {
            throw new InvalidArgumentException("Sales order cannot be confirmed in its current state");
        }

        return $this->repository->update($salesOrder, [
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    /**
     * Cancel sales order
     */
    public function cancelSalesOrder(int $id, string $reason): bool
    {
        $salesOrder = $this->repository->find($id);
        
        if (!$salesOrder || !$salesOrder->canBeCancelled()) {
            throw new InvalidArgumentException("Sales order cannot be cancelled");
        }

        return $this->repository->update($salesOrder, [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }

    /**
     * Ship sales order
     */
    public function shipSalesOrder(int $id, array $shippingData): bool
    {
        $salesOrder = $this->repository->find($id);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        if ($salesOrder->status !== 'fully_fulfilled') {
            throw new InvalidArgumentException("Sales order must be fully fulfilled before shipping");
        }

        $updateData = [
            'status' => 'shipped',
            'shipped_at' => now(),
            'shipped_by' => $shippingData['shipped_by'] ?? Auth::id(),
        ];

        if (isset($shippingData['tracking_number'])) {
            $updateData['tracking_number'] = $shippingData['tracking_number'];
        }

        if (isset($shippingData['carrier'])) {
            $updateData['carrier'] = $shippingData['carrier'];
        }

        return $this->repository->update($salesOrder, $updateData);
    }

    /**
     * Mark sales order as delivered
     */
    public function markAsDelivered(int $id): bool
    {
        $salesOrder = $this->repository->find($id);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        if ($salesOrder->status !== 'shipped') {
            throw new InvalidArgumentException("Sales order must be shipped before marking as delivered");
        }

        return $this->repository->update($salesOrder, [
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    // ====== ITEM MANAGEMENT ======

    /**
     * Add item to sales order with validation
     */
    public function addItemToSalesOrder(int $soId, array $itemData): SalesOrderItem
    {
        $salesOrder = $this->repository->find($soId);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        // Business rule: Can't add items after confirmation
        if (!$salesOrder->canBeEdited()) {
            throw new InvalidArgumentException("Cannot add items to sales order in current status");
        }

        $this->validateItemData($itemData);
        
        return $this->repository->addItem($salesOrder, $itemData);
    }

    /**
     * Update item in sales order
     */
    public function updateItem(int $soId, int $itemId, array $itemData): bool
    {
        $salesOrder = $this->repository->find($soId);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        return $this->repository->updateItem($salesOrder, $itemId, $itemData);
    }

    /**
     * Remove item from sales order
     */
    public function removeItem(int $soId, int $itemId): bool
    {
        $salesOrder = $this->repository->find($soId);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        // Only allow item removal if SO is editable
        if (!$salesOrder->canBeEdited()) {
            throw new InvalidArgumentException("Can only remove items from draft or pending approval sales orders");
        }

        return $this->repository->removeItem($salesOrder, $itemId);
    }

    /**
     * Fulfill items (partial or full)
     */
    public function fulfillItems(int $soId, array $fulfillmentData): bool
    {
        $salesOrder = $this->repository->find($soId);
        
        if (!$salesOrder) {
            throw new InvalidArgumentException("Sales order not found");
        }

        if (!in_array($salesOrder->status, ['confirmed', 'partially_fulfilled'])) {
            throw new InvalidArgumentException("Sales order cannot be fulfilled in its current status");
        }

        return DB::transaction(function () use ($salesOrder, $fulfillmentData) {
            foreach ($fulfillmentData['items'] as $itemData) {
                $item = $this->repository->getItem($salesOrder, $itemData['item_id']);
                
                if ($item && isset($itemData['quantity_fulfilled'])) {
                    $item->fulfillQuantity(
                        $itemData['quantity_fulfilled'], 
                        $itemData['notes'] ?? null
                    );
                }
            }

            // Update fulfilled_by if this is the first fulfillment
            if (!$salesOrder->fulfilled_by) {
                $this->repository->update($salesOrder, [
                    'fulfilled_by' => $fulfillmentData['fulfilled_by'] ?? Auth::id(),
                ]);
            }

            return true;
        });
    }

    // ====== QUERY METHODS ======

    public function getSalesOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function getSalesOrder(int $id): ?SalesOrder
    {
        return $this->repository->find($id);
    }

    public function getOverdueSalesOrders(): Collection
    {
        return $this->repository->findOverdue();
    }

    public function getPendingApprovals(): Collection
    {
        return $this->repository->getPendingApprovals();
    }

    public function getUnfulfilledOrders(): Collection
    {
        return $this->repository->getUnfulfilled();
    }

    public function getFulfilledUnshippedOrders(): Collection
    {
        return $this->repository->getFulfilledUnshipped();
    }

    public function getDashboardStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    public function getOrdersByCustomer(string $customerName): Collection
    {
        return $this->repository->findByCustomer($customerName);
    }

    public function getOrdersByPaymentStatus(string $paymentStatus): Collection
    {
        return $this->repository->findByPaymentStatus($paymentStatus);
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
        $required = ['product_id', 'quantity_ordered', 'unit_price'];
        
        foreach ($required as $field) {
            if (!isset($itemData[$field])) {
                throw new InvalidArgumentException("Missing required field: {$field}");
            }
        }

        if ($itemData['quantity_ordered'] <= 0) {
            throw new InvalidArgumentException("Quantity ordered must be greater than 0");
        }

        if ($itemData['unit_price'] < 0) {
            throw new InvalidArgumentException("Unit price cannot be negative");
        }
    }
}