<?php 

namespace App\Repositories;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Repositories\Interfaces\SalesOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SalesOrderRepository implements SalesOrderRepositoryInterface
{
    public function find(int $id, array $with = ['items', 'warehouse', 'createdBy']): ?SalesOrder
    {
        return SalesOrder::with($with)->find($id);
    }

    public function paginate(
        array $filters = [], 
        int $perPage = 15, 
        array $with = ['items', 'warehouse', 'createdBy']
    ): LengthAwarePaginator
    {
        $query = SalesOrder::with($with);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['customer_name'])) {
            $query->where('customer_name', 'like', '%' . $filters['customer_name'] . '%');
        }

        if (isset($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('so_number', 'like', '%' . $search . '%')
                    ->orWhere('customer_name', 'like', '%' . $search . '%')
                    ->orWhere('customer_reference', 'like', '%' . $search . '%')
                    ->orWhere('customer_email', 'like', '%' . $search . '%');
            });
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        // Default sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function create(array $data): SalesOrder
    {
        return DB::transaction(function () use ($data) {
            // Create the sales order
            $soData = $data['sales_order'] ?? $data;
            $salesOrder = SalesOrder::create($soData);

            // Add items if provided
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $itemData) {
                    $this->addItem($salesOrder, $itemData);
                }
            }

            // Update totals
            $salesOrder->calculateTotals();
            
            return $salesOrder->fresh(['items', 'warehouse', 'createdBy']);
        });
    }

    public function update(SalesOrder $salesOrder, array $data): bool
    {
        return DB::transaction(function () use ($salesOrder, $data) {
            // Separate items data from order data
            $itemsData = $data['items'] ?? null;
            unset($data['items']);
            
            // Update the sales order
            $updated = $salesOrder->update($data);
            
            // Update items if provided
            if ($updated && $itemsData !== null && $salesOrder->canBeEdited()) {
                // Delete existing items
                $salesOrder->items()->delete();
                
                // Create new items
                foreach ($itemsData as $itemData) {
                    $this->addItem($salesOrder, $itemData);
                }
            }
            
            if ($updated) {
                $salesOrder->calculateTotals();
            }
            
            return $updated;
        });
    }

    public function delete(SalesOrder $salesOrder): bool
    {
        return $salesOrder->delete();
    }

    // ====== ITEM OPERATIONS ======

    public function addItem(SalesOrder $salesOrder, array $itemData): SalesOrderItem
    {
        return DB::transaction(function () use ($salesOrder, $itemData) {
            $item = $salesOrder->items()->create($itemData);
            $salesOrder->calculateTotals();
            
            return $item;
        });
    }

    public function updateItem(SalesOrder $salesOrder, int $itemId, array $itemData): bool
    {
        return DB::transaction(function () use ($salesOrder, $itemId, $itemData) {
            $item = $salesOrder->items()->find($itemId);
            
            if (!$item) {
                return false;
            }
            
            $updated = $item->update($itemData);
            
            if ($updated) {
                $item->calculateTotals();
                $item->save();
                
                $salesOrder->calculateTotals();
                $salesOrder->updateFulfillmentStatus();
            }
            
            return $updated;
        });
    }

    public function removeItem(SalesOrder $salesOrder, int $itemId): bool
    {
        return DB::transaction(function () use ($salesOrder, $itemId) {
            $item = $salesOrder->items()->find($itemId);
            
            if (!$item) {
                return false;
            }
            
            $deleted = $item->delete();
            
            if ($deleted) {
                $salesOrder->calculateTotals();
                $salesOrder->updateFulfillmentStatus();
            }
            
            return $deleted;
        });
    }

    public function getItem(SalesOrder $salesOrder, int $itemId): ?SalesOrderItem
    {
        return $salesOrder->items()->find($itemId);
    }

    // ====== BUSINESS QUERIES ======

    public function findByStatus(string $status, array $with = []): Collection
    {
        return SalesOrder::with($with)
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findOverdue(array $with = []): Collection
    {
        return SalesOrder::with($with)
            ->overdue()
            ->orderBy('promised_delivery_date', 'asc')
            ->get();
    }

    public function findByWarehouse(int $warehouseId, array $with = []): Collection
    {
        return SalesOrder::with($with)
            ->where('warehouse_id', $warehouseId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByCustomer(string $customerName, array $with = []): Collection
    {
        return SalesOrder::with($with)
            ->byCustomer($customerName)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByPaymentStatus(string $paymentStatus, array $with = []): Collection
    {
        return SalesOrder::with($with)
            ->byPaymentStatus($paymentStatus)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findRequiringAttention(): Collection
    {
        return SalesOrder::with(['items', 'warehouse'])
            ->where(function ($query) {
                $query->where('priority', 'urgent')
                        ->orWhere('status', 'pending_approval')
                        ->orWhere(function ($q) {
                            $q->overdue();
                        });
            })
            ->orderBy('priority', 'desc')
            ->orderBy('promised_delivery_date', 'asc')
            ->get();
    }

    public function getStatistics(): array
    {
        $totalSOs = SalesOrder::count();
        $draftCount = SalesOrder::where('status', 'draft')->count();
        $pendingApprovalCount = SalesOrder::where('status', 'pending_approval')->count();
        $confirmedCount = SalesOrder::where('status', 'confirmed')->count();
        $inProgressCount = SalesOrder::whereIn('status', [
            'partially_fulfilled',
            'fully_fulfilled'
        ])->count();
        $completedCount = SalesOrder::where('status', 'delivered')->count();
        $overdueCount = $this->findOverdue()->count();

        $totalValue = SalesOrder::sum('total_amount');
        $avgOrderValue = $totalSOs > 0 ? SalesOrder::avg('total_amount') : 0;

        $pendingPaymentCount = SalesOrder::where('payment_status', 'pending')->count();
        $overduePaymentCount = SalesOrder::where('payment_status', 'overdue')->count();

        return [
            'totals' => [
                'sales_orders' => $totalSOs,
                'draft' => $draftCount,
                'pending_approval' => $pendingApprovalCount,
                'confirmed' => $confirmedCount,
                'in_progress' => $inProgressCount,
                'completed' => $completedCount,
                'overdue' => $overdueCount,
            ],
            'financial' => [
                'total_value' => round($totalValue, 2),
                'average_order_value' => round($avgOrderValue, 2),
                'pending_payment' => $pendingPaymentCount,
                'overdue_payment' => $overduePaymentCount,
            ],
            'percentages' => [
                'completion_rate' => $totalSOs > 0 ? round(($completedCount / $totalSOs) * 100, 1) : 0,
                'overdue_rate' => $totalSOs > 0 ? round(($overdueCount / $totalSOs) * 100, 1) : 0,
            ]
        ];
    }

    public function search(array $criteria): Collection
    {
        $query = SalesOrder::with(['items', 'warehouse', 'createdBy']);

        foreach ($criteria as $field => $value) {
            if (empty($value)) continue;

            switch ($field) {
                case 'so_number':
                    $query->where('so_number', 'like', '%' . $value . '%');
                    break;
                case 'customer':
                    $query->where('customer_name', 'like', '%' . $value . '%');
                    break;
                case 'status':
                    if (is_array($value)) {
                        $query->whereIn('status', $value);
                    } else {
                        $query->where('status', $value);
                    }
                    break;
                case 'priority':
                    if (is_array($value)) {
                        $query->whereIn('priority', $value);
                    } else {
                        $query->where('priority', $value);
                    }
                    break;
                case 'payment_status':
                    if (is_array($value)) {
                        $query->whereIn('payment_status', $value);
                    } else {
                        $query->where('payment_status', $value);
                    }
                    break;
                case 'warehouse_id':
                    $query->where('warehouse_id', $value);
                    break;
                case 'date_range':
                    if (isset($value['start'])) {
                        $query->where('created_at', '>=', $value['start']);
                    }
                    if (isset($value['end'])) {
                        $query->where('created_at', '<=', $value['end']);
                    }
                    break;
            }
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getPendingApprovals(): Collection
    {
        return SalesOrder::with(['items', 'createdBy', 'warehouse'])
            ->where('status', 'pending_approval')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getRecent(int $limit = 10): Collection
    {
        return SalesOrder::with(['items', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getUnfulfilled(): Collection
    {
        return SalesOrder::with(['items', 'warehouse'])
            ->whereIn('status', ['confirmed', 'partially_fulfilled'])
            ->orderBy('promised_delivery_date', 'asc')
            ->get();
    }

    public function getFulfilledUnshipped(): Collection
    {
        return SalesOrder::with(['items', 'warehouse'])
            ->where('status', 'fully_fulfilled')
            ->orderBy('fulfilled_at', 'asc')
            ->get();
    }
}