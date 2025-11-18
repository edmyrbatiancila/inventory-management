<?php 

namespace App\Repositories\Interfaces;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface SalesOrderRepositoryInterface
{
    // ====== SALES ORDER CRUD OPERATIONS ======

    /**
     * Find sales order by ID with optional relations
     */
    public function find(int $id, array $with = ['items', 'warehouse', 'createdBy']): ?SalesOrder;

    /**
     * Get paginated sales orders with filters
     */
    public function paginate(
        array $filters = [],
        int $perPage = 15,
        array $with = ['items', 'warehouse', 'createdBy']
    ): LengthAwarePaginator;

    /**
     * Create new sales order with items
     */
    public function create(array $data): SalesOrder;

    /**
     * Update sales order
     */
    public function update(SalesOrder $salesOrder, array $data): bool;

    /**
     * Delete sales order (soft delete)
     */
    public function delete(SalesOrder $salesOrder): bool;

    // ====== SALES ORDER ITEM OPERATIONS ======

    /**
     * Add item to sales order
     */
    public function addItem(SalesOrder $salesOrder, array $itemData): SalesOrderItem;

    /**
     * Update specific item in sales order
     */
    public function updateItem(SalesOrder $salesOrder, int $itemId, array $itemData): bool;

    /**
     * Remove item from sales order
     */
    public function removeItem(SalesOrder $salesOrder, int $itemId): bool;

    /**
     * Get specific item from sales order
     */
    public function getItem(SalesOrder $salesOrder, int $itemId): ?SalesOrderItem;

    // ====== BUSINESS QUERY METHODS ======

    /**
     * Get sales orders by status
     */
    public function findByStatus(string $status, array $with = []): Collection;

    /**
     * Get overdue sales orders
     */
    public function findOverdue(array $with = []): Collection;
    
    /**
     * Get sales orders by warehouse
     */
    public function findByWarehouse(int $warehouseId, array $with = []): Collection;
    
    /**
     * Get sales orders by customer
     */
    public function findByCustomer(string $customerName, array $with = []): Collection;
    
    /**
     * Get sales orders requiring attention (urgent, overdue, etc.)
     */
    public function findRequiringAttention(): Collection;
    
    /**
     * Get sales order statistics
     */
    public function getStatistics(): array;

    // ====== SEARCH AND FILTER METHODS ======
    
    /**
     * Search sales orders with advanced filters
     */
    public function search(array $criteria): Collection;
    
    /**
     * Get sales orders with pending approvals
     */
    public function getPendingApprovals(): Collection;
    
    /**
     * Get recent sales orders
     */
    public function getRecent(int $limit = 10): Collection;

    /**
     * Get sales orders by payment status
     */
    public function findByPaymentStatus(string $paymentStatus, array $with = []): Collection;

    /**
     * Get unfulfilled sales orders
     */
    public function getUnfulfilled(): Collection;

    /**
     * Get fulfilled but unshipped orders
     */
    public function getFulfilledUnshipped(): Collection;
}