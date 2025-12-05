<?php

namespace App\Repositories;

use App\Contracts\ContactLogRepositoryInterface;
use App\Models\ContactLog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ContactLogRepository implements ContactLogRepositoryInterface
{
    protected $model;

    public function __construct(ContactLog $model)
    {
        $this->model = $model;
    }

    public function getAll(array $filters = [], array $relations = []): Collection
    {
        $query = $this->model->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        // Apply filters
        if (!empty($filters['contact_type'])) {
            $query->where('contact_type', $filters['contact_type']);
        }

        if (!empty($filters['direction'])) {
            $query->where('direction', $filters['direction']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['outcome'])) {
            $query->where('outcome', $filters['outcome']);
        }

        if (!empty($filters['contactable_type'])) {
            $query->where('contactable_type', $filters['contactable_type']);
        }

        if (!empty($filters['contact_person_id'])) {
            $query->where('contact_person_id', $filters['contact_person_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('contact_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('contact_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['needs_follow_up'])) {
            $query->needsFollowUp();
        }

        return $query->orderBy('contact_date', 'desc')->get();
    }

    public function findById(int $id, array $relations = []): ?ContactLog
    {
        return $this->model->with($relations)->find($id);
    }

    public function create(array $data): ContactLog
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $contactLog = $this->model->find($id);
        if (!$contactLog) {
            return false;
        }

        return $contactLog->update($data);
    }

    public function delete(int $id): bool
    {
        $contactLog = $this->model->find($id);
        if (!$contactLog) {
            return false;
        }

        return $contactLog->delete();
    }

    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with(['contactable', 'contactPerson']);

        // Apply same filters as getAll method
        if (!empty($filters['contact_type'])) {
            $query->byType($filters['contact_type']);
        }

        if (!empty($filters['direction'])) {
            $query->byDirection($filters['direction']);
        }

        if (!empty($filters['priority'])) {
            $query->byPriority($filters['priority']);
        }

        if (!empty($filters['outcome'])) {
            $query->byOutcome($filters['outcome']);
        }

        if (!empty($filters['contactable_type'])) {
            $query->where('contactable_type', $filters['contactable_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('contact_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('contact_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['needs_follow_up'])) {
            $query->needsFollowUp();
        }

        return $query->orderBy('contact_date', 'desc')->paginate($perPage);
    }

    public function getByContactable(string $type, int $id): Collection
    {
        return $this->model->where('contactable_type', $type)
                            ->where('contactable_id', $id)
                            ->with(['contactPerson'])
                            ->orderBy('contact_date', 'desc')
                            ->get();
    }

    public function getNeedingFollowUp(): Collection
    {
        return $this->model->needsFollowUp()
                            ->with(['contactable', 'contactPerson'])
                            ->orderBy('follow_up_date', 'asc')
                            ->get();
    }

    public function getRecent(int $days = 30): Collection
    {
        return $this->model->recent($days)
                            ->with(['contactable', 'contactPerson'])
                            ->orderBy('contact_date', 'desc')
                            ->get();
    }

    public function getByType(string $type): Collection
    {
        return $this->model->byType($type)
                            ->with(['contactable', 'contactPerson'])
                            ->orderBy('contact_date', 'desc')
                            ->get();
    }

    public function getByPriority(string $priority): Collection
    {
        return $this->model->byPriority($priority)
                            ->with(['contactable', 'contactPerson'])
                            ->orderBy('contact_date', 'desc')
                            ->get();
    }
}