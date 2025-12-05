<?php

namespace App\Services;

use App\Constants\CustomerConstants;
use App\Contracts\CustomerRepositoryInterface;
use App\Models\ContactLog;
use App\Models\Customer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CustomerService
{
    protected $customerRepository;

    public function __construct(
        CustomerRepositoryInterface $customerRepository
    ) {
        $this->customerRepository = $customerRepository;
    }

    public function getAllCustomers(array $filters = [])
    {
        return $this->customerRepository->getAll($filters, ['createdBy', 'updatedBy', 'salesRep', 'contactLogs']);
    }

    public function getCustomerById(int $id): Customer
    {
        $customer = $this->customerRepository->findById($id, ['createdBy', 'updatedBy', 'salesRep', 'contactLogs']);
        
        if (!$customer) {
            throw new ModelNotFoundException('Customer not found');
        }
        
        return $customer;
    }

    public function searchCustomers(string $term, array $filters = [])
    {
        return $this->customerRepository->search($term, $filters);
    }

    public function createCustomer(array $data): Customer
    {
        DB::beginTransaction();
        
        try {
            // Validate data
            $validatedData = $this->validateCustomerData($data);
            
            // Generate customer code if not provided
            if (empty($validatedData['customer_code'])) {
                $validatedData['customer_code'] = $this->generateCustomerCode();
            }
            
            // Set created_by
            $validatedData['created_by'] = auth()->id();
            
            $customer = $this->customerRepository->create($validatedData);
            
            // Log activity
            $this->logCustomerActivity($customer, 'created', 'Customer created successfully');
            
            DB::commit();
            return $customer;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function updateCustomer(int $id, array $data): Customer
    {
        DB::beginTransaction();
        
        try {
            // Validate data
            $validatedData = $this->validateCustomerData($data, $id);
            
            // Update customer
            $updated = $this->customerRepository->update($id, $validatedData);
            
            if (!$updated) {
                throw new ModelNotFoundException('Customer not found');
            }
            
            $customer = $this->getCustomerById($id);
            
            // Log activity
            $this->logCustomerActivity($customer, 'updated', 'Customer information updated');
            
            DB::commit();
            return $customer;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function deleteCustomer(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            $customer = $this->getCustomerById($id);
            
            // Check if customer has active orders or outstanding balance
            if ($customer->total_orders > 0 && $customer->current_balance > 0) {
                throw new \Exception('Cannot delete customer with outstanding balance');
            }
            
            // Log activity before deletion
            $this->logCustomerActivity($customer, 'deleted', 'Customer marked for deletion');
            
            $deleted = $this->customerRepository->delete($id);
            
            DB::commit();
            return $deleted;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function generateCustomerCode(): string
    {
        do {
            $code = 'CUS-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        } while (Customer::where('customer_code', $code)->exists());

        return $code;
    }

    public function validateCustomerData(array $data, ?int $customerId = null): array
    {
        $rules = [
            // Basic Information
            'customer_type' => ['required', 'in:' . implode(',', array_keys(CustomerConstants::CUSTOMER_TYPES))],
            'company_name' => 'required_if:customer_type,business,government,non_profit|nullable|string|max:255',
            'trade_name' => 'nullable|string|max:255',
            'first_name' => 'required_if:customer_type,individual|nullable|string|max:255',
            'last_name' => 'required_if:customer_type,individual|nullable|string|max:255',
            'status' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::STATUSES))],
            
            // Contact Information
            'contact_person' => 'nullable|string|max:255',
            'contact_title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255' . ($customerId ? '|unique:customers,email,' . $customerId : '|unique:customers,email'),
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'fax' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',

            // Billing Address
            'billing_address_line_1' => 'required|string|max:255',
            'billing_address_line_2' => 'nullable|string|max:255',
            'billing_city' => 'required|string|max:100',
            'billing_state_province' => 'nullable|string|max:100',
            'billing_postal_code' => 'nullable|string|max:20',
            'billing_country' => 'required|string|max:100',
            
            // Shipping Address
            'same_as_billing' => 'boolean',
            'shipping_address_line_1' => 'required_if:same_as_billing,false|nullable|string|max:255',
            'shipping_city' => 'required_if:same_as_billing,false|nullable|string|max:100',
            'shipping_country' => 'required_if:same_as_billing,false|nullable|string|max:100',
            
            // Business Information
            'tax_id' => 'nullable|string|max:50',
            'registration_number' => 'nullable|string|max:50',
            'business_description' => 'nullable|string|max:1000',
            'established_year' => 'nullable|integer|between:1800,' . date('Y'),
            'company_size' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::COMPANY_SIZES))],

            // Financial Information
            'payment_terms' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::PAYMENT_TERMS))],
            'currency' => 'nullable|string|size:3',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_status' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::CREDIT_STATUSES))],
            
            // Customer Management
            'customer_priority' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::PRIORITIES))],
            'price_tier' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::PRICE_TIERS))],
            'lead_source' => ['nullable', 'in:' . implode(',', array_keys(CustomerConstants::LEAD_SOURCES))],
            'assigned_sales_rep' => 'nullable|exists:users,id',
            'default_discount_percentage' => 'nullable|numeric|between:0,100',
            
            // Preferences
            'special_requirements' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:2000',
            'sales_notes' => 'nullable|string|max:2000',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    public function getCustomerMetrics(int $id): array
    {
        $customer = $this->getCustomerById($id);
        
        return [
            'lifetime_value' => $customer->lifetime_value ?? 0,
            'total_orders' => $customer->total_orders ?? 0,
            'average_order_value' => $customer->average_order_value ?? 0,
            'payment_delay_average' => $customer->payment_delay_days_average ?? 0,
            'return_rate' => $customer->return_rate_percentage ?? 0,
            'complaint_count' => $customer->complaint_count ?? 0,
            'last_order_date' => $customer->last_order_date,
            'credit_utilization' => $customer->credit_limit > 0 ? 
                round(($customer->current_balance / $customer->credit_limit) * 100, 2) : 0,
            'satisfaction_rating' => $customer->customer_satisfaction_rating ?? 0,
            'contact_logs_count' => $customer->contactLogs->count(),
        ];
    }

    private function logCustomerActivity(Customer $customer, string $action, string $description): void
    {
        ContactLog::create([
            'contactable_type' => Customer::class,
            'contactable_id' => $customer->id,
            'contact_type' => 'other',
            'direction' => 'outbound',
            'subject' => "Customer {$action}",
            'description' => $description,
            'contact_person_id' => auth()->id(),
            'contact_date' => now(),
            'outcome' => 'successful',
        ]);
    }

    public function getFullName(Customer $customer): string
    {
        if ($customer->customer_type === 'individual') {
            return trim($customer->first_name . ' ' . $customer->last_name);
        }
        
        return $customer->trade_name ?: $customer->company_name;
    }

    public function getDisplayName(Customer $customer): string
    {
        return $this->getFullName($customer);
    }

    public function getBillingAddress(Customer $customer): string
    {
        $address = $customer->billing_address_line_1;
        if ($customer->billing_address_line_2) {
            $address .= ', ' . $customer->billing_address_line_2;
        }
        $address .= ', ' . $customer->billing_city;
        if ($customer->billing_state_province) {
            $address .= ', ' . $customer->billing_state_province;
        }
        if ($customer->billing_postal_code) {
            $address .= ' ' . $customer->billing_postal_code;
        }
        $address .= ', ' . $customer->billing_country;
        
        return $address;
    }

    public function getShippingAddress(Customer $customer): string
    {
        if ($customer->same_as_billing) {
            return $this->getBillingAddress($customer);
        }
        
        $address = $customer->shipping_address_line_1;
        if ($customer->shipping_address_line_2) {
            $address .= ', ' . $customer->shipping_address_line_2;
        }
        $address .= ', ' . $customer->shipping_city;
        if ($customer->shipping_state_province) {
            $address .= ', ' . $customer->shipping_state_province;
        }
        if ($customer->shipping_postal_code) {
            $address .= ' ' . $customer->shipping_postal_code;
        }
        $address .= ', ' . $customer->shipping_country;
        
        return $address;
    }

    public function getCreditStatusColor(Customer $customer): string
    {
        return match($customer->credit_status) {
            'good' => 'green',
            'watch' => 'yellow',
            'hold' => 'red',
            'collections' => 'red',
            default => 'gray'
        };
    }

    public function isActive(Customer $customer): bool
    {
        return $customer->status === 'active';
    }

    public function canPlaceOrders(Customer $customer): bool
    {
        return $customer->status === 'active' && $customer->credit_status !== 'hold';
    }

    public function hasAvailableCredit(Customer $customer, float $amount = 0): bool
    {
        return $customer->available_credit >= $amount;
    }

    public function applyDiscount(Customer $customer, float $amount): float
    {
        if ($customer->default_discount_percentage > 0) {
            return $amount * (1 - $customer->default_discount_percentage / 100);
        }
        
        return $amount;
    }

    public function updateCustomerMetrics(Customer $customer): void
    {
        $orders = $customer->salesOrders()
            ->where('status', '!=', 'cancelled')
            ->get();

        $firstOrder = $orders->min('created_at');
        
        $customer->update([
            'total_orders' => $orders->count(),
            'total_order_value' => $orders->sum('total_amount'),
            'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
            'lifetime_value' => $orders->sum('total_amount'),
            'last_order_date' => $orders->max('created_at'),
            'first_purchase_date' => $firstOrder,
        ]);
    }

    public function addContactLog(Customer $customer, array $data): ContactLog
    {
        return $customer->contactLogs()->create($data);
    }
}