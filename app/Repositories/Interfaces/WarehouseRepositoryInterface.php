<?php

namespace App\Repositories\Interfaces;

use App\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface WarehouseRepositoryInterface
{
    // Core CRUD Operations
    public function findAll(array $filters = []): LengthAwarePaginator;
    public function findById(int $id): ?Warehouse;
    public function create(array $data): Warehouse;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;

    // Business-Specific Queries
    public function findByCode(string $code): ?Warehouse;
    public function findActiveWarehouses(): Collection;
    public function findByLocation(string $city, string $state = null): Collection;
    public function searchWarehouses(string $query): Collection;

    // Inventory-Related Methods
    public function findWithInventories(int $id): ?Warehouse;
    public function findWarehousesWithStock(): Collection;
    public function findWarehousesNeedingRestock(): Collection;
    public function getWarehouseCapacityAnalytics(int $id): array;
}