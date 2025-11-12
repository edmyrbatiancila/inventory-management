<?php 

namespace App\Repositories\Interfaces;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PurchaseOrderRepositoryInterface
{
     // ====== PURCHASE ORDER CRUD OPERATIONS ======

    /**
     * Find purchase order by ID with optional relations
     */
    public function find(int $id, array $with = ['items', 'warehouse', 'createdBy']): ?PurchaseOrder;

    /**
     * Get paginated purchase orders with filters
     */
    public function paginate(
        array $filters = [],
        int $perPage = 15,
        array $with = ['items', 'warehouse', 'createdBy']
    ): LengthAwarePaginator;

    /**
     * Create new purchase order with items
     */
    public function create(array $data): PurchaseOrder;

    /**
     * Update purchase order
     */
    public function update(PurchaseOrder $purchaseOrder, array $data): bool;

    /**
     * Delete purchase order (soft delete)
     */
    public function delete(PurchaseOrder $purchaseOrder): bool;

    // ====== PURCHASE ORDER ITEM OPERATIONS ======

    /**
     * Add item to purchase order
     */
    public function addItem(PurchaseOrder $purchaseOrder, array $itemData): PurchaseOrderItem;

    /**
     * Update specific item in purchase order
     */
    public function updateItem(PurchaseOrder $purchaseOrder, int $itemId, array $itemData): bool;

    /**
     * Remove item from purchase order
     */
    public function removeItem(PurchaseOrder $purchaseOrder, int $itemId): bool;

    /**
     * Get specific item from purchase order
     */
    public function getItem(PurchaseOrder $purchaseOrder, int $itemId): ?PurchaseOrderItem;

    // ====== BUSINESS QUERY METHODS ======

    /**
     * Get purchase orders by status
     */
    public function findByStatus(string $status, array $with = []): Collection;

    /**
     * Get overdue purchase orders
     */
    public function findOverdue(array $with = []): Collection;
    
    /**
     * Get purchase orders by warehouse
     */
    public function findByWarehouse(int $warehouseId, array $with = []): Collection;
    
    /**
     * Get purchase orders by supplier
     */
    public function findBySupplier(string $supplierName, array $with = []): Collection;
    
    /**
     * Get purchase orders requiring attention (urgent, overdue, etc.)
     */
    public function findRequiringAttention(): Collection;
    
    /**
     * Get purchase order statistics
     */
    public function getStatistics(): array;

    // ====== SEARCH AND FILTER METHODS ======
    
    /**
     * Search purchase orders with advanced filters
     */
    public function search(array $criteria): Collection;
    
    /**
     * Get purchase orders with pending approvals
     */
    public function getPendingApprovals(): Collection;
    
    /**
     * Get recent purchase orders
     */
    public function getRecent(int $limit = 10): Collection;
}