<?php

namespace App\Services;

use App\Models\Warehouse;
use App\Repositories\Interfaces\WarehouseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WarehouseService
{
    protected WarehouseRepositoryInterface $warehouseRepository;

    public function __construct(WarehouseRepositoryInterface $warehouseRepository)
    {
        $this->warehouseRepository = $warehouseRepository;
    }

    /**
     * Get all warehouses with filtering and pagination
     */
    public function getAllWarehouses(array $filters = []): LengthAwarePaginator
    {
        // add default filters
        $defaultFilters = [
            'sort' => 'newest',
            'per_page' => 15,
        ];

        $filters = array_merge($defaultFilters, $filters);

        return $this->warehouseRepository->findAll($filters);
        // try {
        //     // Add default filters
        //     $filters = array_merge([
        //         'per_page' => 15,
        //     ], $filters);

        //     return $this->warehouseRepository->findAll($filters);

        // } catch (\Exception $e) {
        //     throw new \Exception('Error fetching warehouses: ' . $e->getMessage());
        // }
    }

    /**
     * Get search statistics for warehouses
     */
    public function getSearchStats(array $filters = []): array
    {
        return $this->warehouseRepository->getOptimizedSearchStats($filters);
    }

    /**
     * Get warehouse by ID
     */
    public function getWarehouseById(int $id): ?Warehouse
    {
        return $this->warehouseRepository->findById($id);
    }

    /**
     * Create a new warehouse
     */
    public function createWarehouse(array $data): Warehouse
    {

        DB::beginTransaction();

        try {
            // Generate warehouse code if not provided
            if (empty($data['code'])) {
                $data['code'] = $this->generateWarehouseCode();
            }

            // Validate unique code
            if ($this->warehouseRepository->findByCode($data['code'])) {
                throw new ValidationException('Warehouse code already exists.');
            }

            $warehouse = $this->warehouseRepository->create($data);

            DB::commit();
            
            return $warehouse;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update warehouse
     */
    public function updateWarehouse(int $id, array $data): bool
    {

        DB::beginTransaction();

        try {
            // Check if warehouse exists
            $warehouse = $this->warehouseRepository->findById($id);
            if (!$warehouse) {
                throw new ModelNotFoundException('Warehouse not found.');
            }

            // Validate unique code if changed
            if (isset($data['code']) && $data['code'] !== $warehouse->code) {
                $existingWarehouse = $this->warehouseRepository->findByCode($data['code']);
                if ($existingWarehouse && $existingWarehouse->id !== $id) {
                    throw new ValidationException('Warehouse code already exists.');
                }
            }

            $result = $this->warehouseRepository->update($id, $data);

            DB::commit();
            
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete warehouse
     */
    public function deleteWarehouse(int $id): bool
    {

        DB::beginTransaction();

        try {
            // Check if warehouse exists
            $warehouse = $this->warehouseRepository->findById($id);
            if (!$warehouse) {
                throw new ModelNotFoundException('Warehouse not found.');
            }

            // Check if warehouse has inventory (optional business rule)
            $warehouseWithInventories = $this->warehouseRepository->findWithInventories($id);
            if ($warehouseWithInventories && $warehouseWithInventories->inventories->count() > 0) {
                throw new ValidationException('Cannot delete warehouse with existing inventory.');
            }

            $result = $this->warehouseRepository->delete($id);

            DB::commit();
            
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get warehouse analytics
     */
    public function getWarehouseAnalytics(int $id): array
    {
        return $this->warehouseRepository->getWarehouseCapacityAnalytics($id);
    }

    /**
     * Get active warehouses
     */
    public function getActiveWarehouses(): Collection
    {
        return $this->warehouseRepository->findActiveWarehouses();
    }

    /**
     * Search warehouses
     */
    public function searchWarehouses(string $query): Collection
    {
        return $this->warehouseRepository->searchWarehouses($query);
    }

    /**
     * Generate unique warehouse code
     */
    private function generateWarehouseCode(): string
    {
        do {
            $code = 'WH' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while ($this->warehouseRepository->findByCode($code));

        return $code;
    }

    /**
     * Get warehouses with stock summary
     */
    public function getWarehouseWithStock(): Collection
    {
        return $this->warehouseRepository->findWarehousesWithStock();
    }

    /**
     * Get warehouses needing restock
     */
    public function getWarehousesNeedingRestock(): Collection
    {
        return $this->warehouseRepository->findWarehousesNeedingRestock();
    }

    /**
     * Get warehouse with detailed inventory
     */
    public function getWarehouseWithInventories(int $id): ?Warehouse
    {
        return $this->warehouseRepository->findWithInventories($id);
    }
}