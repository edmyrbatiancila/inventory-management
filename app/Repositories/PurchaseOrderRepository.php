<?php 

namespace App\Repositories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Repositories\Interfaces\PurchaseOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PurchaseOrderRepository implements PurchaseOrderRepositoryInterface
{
    public function find(int $id, array $with = ['items', 'warehouse', 'createdBy']): ?PurchaseOrder
    {
        return PurchaseOrder::with($with)->find($id);
    }

    public function paginate(
        array $filters = [], 
        int $perPage = 15, 
        array $with = ['items', 'warehouse', 'createdBy']
    ): LengthAwarePaginator {
        $query = PurchaseOrder::with($with);

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

        if (isset($filters['supplier_name'])) {
            $query->where('supplier_name', 'like', '%' . $filters['supplier_name'] . '%');
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('po_number', 'like', '%' . $search . '%')
                    ->orWhere('supplier_name', 'like', '%' . $search . '%')
                    ->orWhere('supplier_reference', 'like', '%' . $search . '%');
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

    public function create(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
            // Create the purchase order
            $poData = $data['purchase_order'] ?? $data;
            $purchaseOrder = PurchaseOrder::create($poData);

            // Add items if provided
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $itemData) {
                    $this->addItem($purchaseOrder, $itemData);
                }
            }

            // Update totals
            $purchaseOrder->updateTotals();
            
            return $purchaseOrder->fresh(['items', 'warehouse', 'createdBy']);
        });
    }

    public function update(PurchaseOrder $purchaseOrder, array $data): bool
    {
        return DB::transaction(function () use ($purchaseOrder, $data) {
            $updated = $purchaseOrder->update($data);
            
            if ($updated) {
                $purchaseOrder->updateTotals();
            }
            
            return $updated;
        });
    }

    public function delete(PurchaseOrder $purchaseOrder): bool
    {
        return $purchaseOrder->delete();
    }

    // ====== ITEM OPERATIONS ======

    public function addItem(PurchaseOrder $purchaseOrder, array $itemData): PurchaseOrderItem
    {
        return DB::transaction(function () use ($purchaseOrder, $itemData) {
            $item = $purchaseOrder->items()->create($itemData);
            $purchaseOrder->updateTotals();
            
            return $item;
        });
    }

    public function updateItem(PurchaseOrder $purchaseOrder, int $itemId, array $itemData): bool
    {
        return DB::transaction(function () use ($purchaseOrder, $itemId, $itemData) {
            $item = $purchaseOrder->items()->find($itemId);
            
            if (!$item) {
                return false;
            }
            
            $updated = $item->update($itemData);
            
            if ($updated) {
                $item->calculateTotals();
                $item->updateStatus();
                $item->save();
                
                $purchaseOrder->updateTotals();
                $purchaseOrder->updateReceivingStatus();
            }
            
            return $updated;
        });
    }

    public function removeItem(PurchaseOrder $purchaseOrder, int $itemId): bool
    {
        return DB::transaction(function () use ($purchaseOrder, $itemId) {
            $item = $purchaseOrder->items()->find($itemId);
            
            if (!$item) {
                return false;
            }
            
            $deleted = $item->delete();
            
            if ($deleted) {
                $purchaseOrder->updateTotals();
                $purchaseOrder->updateReceivingStatus();
            }
            
            return $deleted;
        });
    }

    public function getItem(PurchaseOrder $purchaseOrder, int $itemId): ?PurchaseOrderItem
    {
        return $purchaseOrder->items()->find($itemId);
    }

    // ====== BUSINESS QUERIES ======

    public function findByStatus(string $status, array $with = []): Collection
    {
        return PurchaseOrder::with($with)
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findOverdue(array $with = []): Collection
    {
        return PurchaseOrder::with($with)
            ->where('expected_delivery_date', '<', now())
            ->whereNotIn('status', [
                PurchaseOrder::STATUS_FULLY_RECEIVED,
                PurchaseOrder::STATUS_CANCELLED,
                PurchaseOrder::STATUS_CLOSED
            ])
            ->orderBy('expected_delivery_date', 'asc')
            ->get();
    }

    public function findByWarehouse(int $warehouseId, array $with = []): Collection
    {
        return PurchaseOrder::with($with)
            ->where('warehouse_id', $warehouseId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findBySupplier(string $supplierName, array $with = []): Collection
    {
        return PurchaseOrder::with($with)
            ->where('supplier_name', 'like', '%' . $supplierName . '%')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findRequiringAttention(): Collection
    {
        return PurchaseOrder::with(['items', 'warehouse'])
            ->where(function ($query) {
                $query->where('priority', PurchaseOrder::PRIORITY_URGENT)
                        ->orWhere('status', PurchaseOrder::STATUS_PENDING_APPROVAL)
                        ->orWhere(function ($q) {
                            $q->where('expected_delivery_date', '<', now())
                            ->whereNotIn('status', [
                                PurchaseOrder::STATUS_FULLY_RECEIVED,
                                PurchaseOrder::STATUS_CANCELLED
                            ]);
                        });
            })
            ->orderBy('priority', 'desc')
            ->orderBy('expected_delivery_date', 'asc')
            ->get();
    }

    public function getStatistics(): array
    {
        $totalPOs = PurchaseOrder::count();
        $draftCount = PurchaseOrder::where('status', PurchaseOrder::STATUS_DRAFT)->count();
        $pendingApprovalCount = PurchaseOrder::where('status', PurchaseOrder::STATUS_PENDING_APPROVAL)->count();
        $approvedCount = PurchaseOrder::where('status', PurchaseOrder::STATUS_APPROVED)->count();
        $inProgressCount = PurchaseOrder::whereIn('status', [
            PurchaseOrder::STATUS_SENT_TO_SUPPLIER,
            PurchaseOrder::STATUS_PARTIALLY_RECEIVED
        ])->count();
        $completedCount = PurchaseOrder::where('status', PurchaseOrder::STATUS_FULLY_RECEIVED)->count();
        $overdueCount = $this->findOverdue()->count();

        $totalValue = PurchaseOrder::sum('total_amount');
        $avgOrderValue = $totalPOs > 0 ? PurchaseOrder::avg('total_amount') : 0;

        return [
            'totals' => [
                'purchase_orders' => $totalPOs,
                'draft' => $draftCount,
                'pending_approval' => $pendingApprovalCount,
                'approved' => $approvedCount,
                'in_progress' => $inProgressCount,
                'completed' => $completedCount,
                'overdue' => $overdueCount,
            ],
            'financial' => [
                'total_value' => round($totalValue, 2),
                'average_order_value' => round($avgOrderValue, 2),
            ],
            'percentages' => [
                'completion_rate' => $totalPOs > 0 ? round(($completedCount / $totalPOs) * 100, 1) : 0,
                'overdue_rate' => $totalPOs > 0 ? round(($overdueCount / $totalPOs) * 100, 1) : 0,
            ]
        ];
    }

    public function search(array $criteria): Collection
    {
        $query = PurchaseOrder::with(['items', 'warehouse', 'createdBy']);

        foreach ($criteria as $field => $value) {
            if (empty($value)) continue;

            switch ($field) {
                case 'po_number':
                    $query->where('po_number', 'like', '%' . $value . '%');
                    break;
                case 'supplier':
                    $query->where('supplier_name', 'like', '%' . $value . '%');
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
        return PurchaseOrder::with(['items', 'createdBy', 'warehouse'])
            ->where('status', PurchaseOrder::STATUS_PENDING_APPROVAL)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getRecent(int $limit = 10): Collection
    {
        return PurchaseOrder::with(['items', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}