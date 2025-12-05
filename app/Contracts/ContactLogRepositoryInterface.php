<?php

namespace App\Contracts;

use App\Models\ContactLog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ContactLogRepositoryInterface
{
    public function getAll(array $filters = [], array $relations = []): Collection;
    public function findById(int $id, array $relations = []): ?ContactLog;
    public function create(array $data): ContactLog;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator;
    public function getByContactable(string $type, int $id): Collection;
    public function getNeedingFollowUp(): Collection;
    public function getRecent(int $days = 30): Collection;
    public function getByType(string $type): Collection;
    public function getByPriority(string $priority): Collection;
}