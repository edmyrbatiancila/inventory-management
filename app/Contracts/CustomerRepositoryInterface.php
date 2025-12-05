<?php

namespace App\Contracts;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function getAll(array $filters = [], array $relations = []): Collection;
    public function findById(int $id, array $relations = []): ?Customer;
    public function findByCode(string $code): ?Customer;
    public function create(array $data): Customer;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function getActive(): Collection;
    public function getByType(string $type): Collection;
    public function getVipCustomers(): Collection;
    public function getByCreditStatus(string $status): Collection;
    public function search(string $term, array $filters = []): Collection;
}