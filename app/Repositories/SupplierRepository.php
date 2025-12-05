<?php

namespace App\Repositories;

use App\Contracts\SupplierRepositoryInterface;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SupplierRepository implements SupplierRepositoryInterface
{
    protected $model;

    public function __construct(Supplier $model)
    {
        $this->model = $model;
    }

    public function getAll(array $filters = [], array $relations = []): Collection
    {
        $query = $this->model->with($relations);
        
        // Apply status filter
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        // Apply type filter using scope
        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }
        
        // Apply country filter
        if (isset($filters['country'])) {
            $query->byCountry($filters['country']);
        }
        
        // Apply rating filter
        if (isset($filters['min_rating'])) {
            $query->withHighRating($filters['min_rating']);
        }
        
        // Apply search
        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('company_name', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('supplier_code', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('contact_person', 'LIKE', "%{$filters['search']}%");
            });
        }
        
        return $query->orderBy('company_name')->get();
    }

    public function findById(int $id, array $relations = []): ?Supplier
    {
        return $this->model->with($relations)->find($id);
    }

    public function findByCode(string $code): ?Supplier
    {
        return $this->model->where('supplier_code', $code)->first();
    }

    public function create(array $data): Supplier
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $supplier = $this->findById($id);
        if (!$supplier) {
            return false;
        }
        
        $data['updated_by'] = auth()->id();
        return $supplier->update($data);
    }

    public function delete(int $id): bool
    {
        $supplier = $this->findById($id);
        if (!$supplier) {
            return false;
        }
        
        return $supplier->delete();
    }

    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();
        
        // Apply same filters as getAll
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }
        
        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('company_name', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('supplier_code', 'LIKE', "%{$filters['search']}%");
            });
        }
        
        return $query->orderBy('company_name')->paginate($perPage);
    }

    public function getActive(): Collection
    {
        return $this->model->active()->orderBy('company_name')->get();
    }

    public function getByType(string $type): Collection
    {
        return $this->model->byType($type)->orderBy('company_name')->get();
    }

    public function search(string $term, array $filters = []): Collection
    {
        $query = $this->model->where(function($q) use ($term) {
            $q->where('company_name', 'LIKE', "%{$term}%")
              ->orWhere('supplier_code', 'LIKE', "%{$term}%")
              ->orWhere('contact_person', 'LIKE', "%{$term}%")
              ->orWhere('email', 'LIKE', "%{$term}%");
        });
        
        foreach ($filters as $key => $value) {
            if ($value !== null) {
                $query->where($key, $value);
            }
        }
        
        return $query->orderBy('company_name')->get();
    }

    public function getWithContactLogs(): Collection
    {
        return $this->model->with('contactLogs')->get();
    }

    public function getPerformanceMetrics(): array
    {
        return [
            'total_suppliers' => $this->model->count(),
            'active_suppliers' => $this->model->active()->count(),
            'pending_approval' => $this->model->where('status', 'pending_approval')->count(),
            'high_rated' => $this->model->withHighRating(4.5)->count(),
            'preferred_vendors' => $this->model->preferredVendors()->count(),
        ];
    }
}