<?php

namespace App\Repositories;

use App\Models\StockMovement;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class StockMovementRepository implements StockMovementRepositoryInterface
{
    public function findAll(array $filters = []): LengthAwarePaginator
    {
        $query = StockMovement::with(['product', 'warehouse', 'user', 'approvedBy']);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Sorting
        $sortBy = $filters['sort'] ?? 'newest';
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'quantity_high':
                $query->orderBy(DB::raw('ABS(quantity_moved)'), 'desc');
                break;
            case 'quantity_low':
                $query->orderBy(DB::raw('ABS(quantity_moved)'), 'asc');
                break;
            case 'value_high':
                $query->orderBy('total_value', 'desc');
                break;
            case 'value_low':
                $query->orderBy('total_value', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getSearchStats(array $filters = []): array
    {
        $baseQuery = StockMovement::with(['product', 'warehouse', 'user']);
        $filteredQuery = clone $baseQuery;
        $this->applyFilters($filteredQuery, $filters);

        // Movement type distribution
        $movementTypes = (clone $filteredQuery)
            ->select('movement_type', DB::raw('count(*) as count'))
            ->groupBy('movement_type')
            ->pluck('count', 'movement_type')
            ->toArray();

        // Status distribution
        $statusCounts = (clone $filteredQuery)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Value analysis
        $valueStats = (clone $filteredQuery)
            ->selectRaw('
                SUM(CASE WHEN quantity_moved > 0 THEN total_value ELSE 0 END) as value_in,
                SUM(CASE WHEN quantity_moved < 0 THEN ABS(total_value) ELSE 0 END) as value_out,
                SUM(total_value) as net_value,
                AVG(ABS(total_value)) as avg_value
            ')
            ->first();

        // Quantity analysis
        $quantityStats = (clone $filteredQuery)
            ->selectRaw('
                SUM(CASE WHEN quantity_moved > 0 THEN quantity_moved ELSE 0 END) as quantity_in,
                SUM(CASE WHEN quantity_moved < 0 THEN ABS(quantity_moved) ELSE 0 END) as quantity_out,
                SUM(quantity_moved) as net_quantity,
                AVG(ABS(quantity_moved)) as avg_quantity
            ')
            ->first();

        return [
            'totalMovements' => $filteredQuery->count(),
            'movementTypes' => $movementTypes,
            'statusCounts' => array_merge([
                'pending' => 0,
                'approved' => 0, 
                'rejected' => 0,
                'applied' => 0
            ], $statusCounts),
            'valueAnalysis' => [
                'valueIn' => round($valueStats->value_in ?? 0, 2),
                'valueOut' => round($valueStats->value_out ?? 0, 2),
                'netValue' => round($valueStats->net_value ?? 0, 2),
                'avgValue' => round($valueStats->avg_value ?? 0, 2),
            ],
            'quantityAnalysis' => [
                'quantityIn' => $quantityStats->quantity_in ?? 0,
                'quantityOut' => $quantityStats->quantity_out ?? 0,
                'netQuantity' => $quantityStats->net_quantity ?? 0,
                'avgQuantity' => round($quantityStats->avg_quantity ?? 0, 2),
            ],
            'generatedAt' => now()->toISOString()
        ];
    }

    private function applyFilters($query, array $filters)
    {
        // Global search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Movement type filter
        if (!empty($filters['movement_types'])) {
            $types = is_array($filters['movement_types']) 
                ? $filters['movement_types'] 
                : explode(',', $filters['movement_types']);
            $query->whereIn('movement_type', $types);
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Product filter
        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        // Warehouse filter
        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        // User filter
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Date filters
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Quantity filters
        if (isset($filters['quantity_min'])) {
            $query->where(DB::raw('ABS(quantity_moved)'), '>=', $filters['quantity_min']);
        }

        if (isset($filters['quantity_max'])) {
            $query->where(DB::raw('ABS(quantity_moved)'), '<=', $filters['quantity_max']);
        }

        // Value filters
        if (isset($filters['value_min'])) {
            $query->where(DB::raw('ABS(total_value)'), '>=', $filters['value_min']);
        }

        if (isset($filters['value_max'])) {
            $query->where(DB::raw('ABS(total_value)'), '<=', $filters['value_max']);
        }
    }

    // Implement other interface methods...
    public function findById(int $id): ?StockMovement
    {
        return StockMovement::with(['product', 'warehouse', 'user', 'approvedBy'])->find($id);
    }

    public function create(array $data): StockMovement
    {
        return StockMovement::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return StockMovement::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return StockMovement::destroy($id);
    }

    public function findByProduct(int $productId): Collection
    {
        return StockMovement::forProduct($productId)
            ->with(['warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByWarehouse(int $warehouseId): Collection
    {
        return StockMovement::forWarehouse($warehouseId)
            ->with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByMovementType(string $type): Collection
    {
        return StockMovement::byMovementType($type)
            ->with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findByUser(int $userId): Collection
    {
        return StockMovement::where('user_id', $userId)
            ->with(['product', 'warehouse'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findPendingApproval(): Collection
    {
        return StockMovement::where('status', 'pending')
            ->with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findRecentMovements(int $limit = 10): Collection
    {
        return StockMovement::with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getMovementSummaryByProduct(int $productId): array
    {
        return StockMovement::forProduct($productId)
            ->selectRaw('
                movement_type,
                COUNT(*) as count,
                SUM(quantity_moved) as total_quantity,
                SUM(total_value) as total_value
            ')
            ->groupBy('movement_type')
            ->get()
            ->toArray();
    }

    public function getMovementSummaryByWarehouse(int $warehouseId): array
    {
        return StockMovement::forWarehouse($warehouseId)
            ->selectRaw('
                movement_type,
                COUNT(*) as count,
                SUM(quantity_moved) as total_quantity,
                SUM(total_value) as total_value
            ')
            ->groupBy('movement_type')
            ->get()
            ->toArray();
    }

    public function getMovementsByDateRange(string $startDate, string $endDate): Collection
    {
        return StockMovement::whereBetween('created_at', [$startDate, $endDate])
            ->with(['product', 'warehouse', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTopMovementsByValue(int $limit = 10): Collection
    {
        return StockMovement::with(['product', 'warehouse', 'user'])
            ->orderBy(DB::raw('ABS(total_value)'), 'desc')
            ->limit($limit)
            ->get();
    }
}