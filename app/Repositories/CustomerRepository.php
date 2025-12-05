<?php

namespace App\Repositories;

use App\Contracts\CustomerRepositoryInterface;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerRepository implements CustomerRepositoryInterface
{
    protected $model;

    public function __construct(Customer $model)
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
        
        // Apply customer type filter
        if (isset($filters['customer_type'])) {
            $query->byType($filters['customer_type']);
        }
        
        // Apply priority filter
        if (isset($filters['priority'])) {
            $query->byPriority($filters['priority']);
        }
        
        // Apply credit status filter
        if (isset($filters['credit_status'])) {
            $query->byCreditStatus($filters['credit_status']);
        }
        
        // Apply price tier filter
        if (isset($filters['price_tier'])) {
            $query->byPriceTier($filters['price_tier']);
        }

        // Apply search
        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('company_name', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('customer_code', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('first_name', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('last_name', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('contact_person', 'LIKE', "%{$filters['search']}%");
            });
        }
        
        return $query->orderBy('company_name')->orderBy('last_name')->get();
    }

    public function findById(int $id, array $relations = []): ?Customer
    {
        return $this->model->with($relations)->find($id);
    }

    public function findByCode(string $code): ?Customer
    {
        return $this->model->where('customer_code', $code)->first();
    }

    public function create(array $data): Customer
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $customer = $this->findById($id);
        if (!$customer) {
            return false;
        }
        
        $data['updated_by'] = auth()->id();
        return $customer->update($data);
    }

    public function delete(int $id): bool
    {
        $customer = $this->findById($id);
        if (!$customer) {
            return false;
        }
        
        return $customer->delete();
    }

    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();
        
        // Apply same filters as getAll
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['customer_type'])) {
            $query->byType($filters['customer_type']);
        }
        
        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('company_name', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('customer_code', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('first_name', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('last_name', 'LIKE', "%{$filters['search']}%");
            });
        }
        
        return $query->orderBy('company_name')->orderBy('last_name')->paginate($perPage);
    }

    public function getActive(): Collection
    {
        return $this->model->active()->orderBy('company_name')->orderBy('last_name')->get();
    }

    public function getByType(string $type): Collection
    {
        return $this->model->byType($type)->orderBy('company_name')->orderBy('last_name')->get();
    }

    public function getVipCustomers(): Collection
    {
        return $this->model->vip()->orderBy('company_name')->orderBy('last_name')->get();
    }

    public function getByCreditStatus(string $status): Collection
    {
        return $this->model->byCreditStatus($status)->orderBy('company_name')->orderBy('last_name')->get();
    }

    public function search(string $term, array $filters = []): Collection
    {
        $query = $this->model->where(function($q) use ($term) {
            $q->where('company_name', 'LIKE', "%{$term}%")
                ->orWhere('customer_code', 'LIKE', "%{$term}%")
                ->orWhere('first_name', 'LIKE', "%{$term}%")
                ->orWhere('last_name', 'LIKE', "%{$term}%")
                ->orWhere('contact_person', 'LIKE', "%{$term}%")
                ->orWhere('email', 'LIKE', "%{$term}%");
        });
        
        foreach ($filters as $key => $value) {
            if ($value !== null) {
                $query->where($key, $value);
            }
        }
        
        return $query->orderBy('company_name')->orderBy('last_name')->get();
    }

    public function getPerformanceMetrics(): array
    {
        return [
            'total_customers' => $this->model->count(),
            'active_customers' => $this->model->active()->count(),
            'prospects' => $this->model->where('status', 'prospect')->count(),
            'vip_customers' => $this->model->vip()->count(),
            'credit_holds' => $this->model->withCreditHold()->count(),
            'business_customers' => $this->model->byType('business')->count(),
            'individual_customers' => $this->model->byType('individual')->count(),
        ];
    }
}