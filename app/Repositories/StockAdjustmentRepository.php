<?php

namespace App\Repositories;

use App\Models\StockAdjustment;
use App\Repositories\Interfaces\StockAdjustmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class StockAdjustmentRepository implements StockAdjustmentRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = StockAdjustment::with(['inventory.product', 'inventory.warehouse', 'adjustedBy']);

        // Apply Filters
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('inventory.product', function($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (isset($filters['inventory_id'])) {
            $query->where('inventory_id', $filters['inventory_id']);
        }

        if (isset($filters['adjustment_type'])) {
            $query->where('adjustment_type', $filters['adjustment_type']);
        }

        if (isset($filters['adjusted_by'])) {
            $query->where('adjusted_by', $filters['adjusted_by']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('adjusted_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('adjusted_at', '<=', $filters['date_to']);
        }

        // Sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('adjusted_at', 'asc');
                break;
            case 'reference':
                $query->orderBy('reference_number', 'asc');
                break;
            case 'quantity_high':
                $query->orderBy('quantity_adjusted', 'desc');
                break;
            case 'quantity_low':
                $query->orderBy('quantity_adjusted', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('adjusted_at', 'desc');
                break;
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function findById(int $id): ?StockAdjustment
    {
        return StockAdjustment::with(['inventory.product', 'inventory.warehouse', 'adjustedBy'])
            ->find($id);
    }

    public function create(array $data): StockAdjustment
    {
        return StockAdjustment::create($data);
    }

    public function findByInventory(int $inventoryId): Collection
    {
        return StockAdjustment::with(['adjustedBy'])
            ->where('inventory_id', $inventoryId)
            ->orderBy('adjusted_at', 'desc')
            ->get();
    }

    public function findByUser(int $userId): Collection
    {
        return StockAdjustment::with(['inventory.product', 'inventory.warehouse'])
            ->where('adjusted_by', $userId)
            ->orderBy('adjusted_at', 'desc')
            ->get();
    }

    public function findByDateRange(string $startDate, string $endDate): Collection
    {
        return StockAdjustment::with(['inventory.product', 'inventory.warehouse', 'adjustedBy'])
            ->whereBetween('adjusted_at', [$startDate, $endDate])
            ->orderBy('adjusted_at', 'desc')
            ->get();
    }

    public function findByAdjustmentType(string $type): Collection
    {
        return StockAdjustment::with(['inventory.product', 'inventory.warehouse', 'adjustedBy'])
            ->where('adjustment_type', $type)
            ->orderBy('adjusted_at', 'desc')
            ->get();
    }

    public function getTotalAdjustmentsByType(): array
    {
        return StockAdjustment::selectRaw('adjustment_type, COUNT(*) as count, SUM(quantity_adjusted) as total_quantity')
            ->groupBy('adjustment_type')
            ->get()
            ->pluck(['count', 'total_quantity'], 'adjustment_type')
            ->toArray();
    }

    public function getAdjustmentsSummary(int $inventoryId): array
    {
        $adjustments = StockAdjustment::where('inventory_id', $inventoryId)
            ->selectRaw('
                adjustment_type, 
                COUNT(*) as count, 
                SUM(quantity_adjusted) as total_quantity,
                MAX(adjusted_at) as last_adjustment
            ')
            ->groupBy('adjustment_type')
            ->get();

        return [
            'total_adjustments' => $adjustments->sum('count'),
            'increases' => $adjustments->where('adjustment_type', 'increase')->first(),
            'decreases' => $adjustments->where('adjustment_type', 'decrease')->first(),
        ];
    }

    public function getRecentAdjustments(int $limit = 10): Collection
    {
        return StockAdjustment::with(['inventory.product', 'inventory.warehouse', 'adjustedBy'])
            ->orderBy('adjusted_at', 'desc')
            ->limit($limit)
            ->get();
    }
}