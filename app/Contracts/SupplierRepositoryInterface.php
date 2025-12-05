<?php

namespace App\Contracts;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface SupplierRepositoryInterface
{
    public function getAll(array $filters = [], array $relations = []): Collection;
    public function findById(int $id, array $relations = []): ?Supplier;
    public function findByCode(string $code): ?Supplier;
    public function create(array $data): Supplier;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function getActive(): Collection;
    public function getByType(string $type): Collection;
    public function search(string $term, array $filters = []): Collection;
    public function getWithContactLogs(): Collection;
    public function getPerformanceMetrics(): array;
}