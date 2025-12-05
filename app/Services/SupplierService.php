<?php

namespace App\Services;

use App\Constants\SupplierConstants;
use App\Contracts\SupplierRepositoryInterface;
use App\Models\ContactLog;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SupplierService
{
    protected $supplierRepository;

    public function __construct(
        SupplierRepositoryInterface $supplierRepository
    ) {
        $this->supplierRepository = $supplierRepository;
    }

    public function getAllSuppliers(array $filters = [])
    {
        return $this->supplierRepository->getAll($filters, ['createdBy', 'contactLogs']);
    }

    public function getSupplierById(int $id): Supplier
    {
        $supplier = $this->supplierRepository->findById($id, ['createdBy', 'contactLogs']);
        
        if (!$supplier) {
            throw new ModelNotFoundException('Supplier not found');
        }
        
        return $supplier;
    }

    public function searchSuppliers(string $term, array $filters = [])
    {
        return $this->supplierRepository->search($term, $filters);
    }

    public function createSupplier(array $data): Supplier
    {
        // Validate data
        $validatedData = $this->validateSupplierData($data);
        
        // Auto-generate supplier code
        $validatedData['supplier_code'] = $this->generateSupplierCode();
        
        // Set defaults
        $validatedData['created_by'] = auth()->id();
        $validatedData['status'] = $validatedData['status'] ?? 'pending_approval';
        $validatedData['currency'] = $validatedData['currency'] ?? 'USD';
        
        return DB::transaction(function () use ($validatedData) {
            $supplier = $this->supplierRepository->create($validatedData);
            
            // Log creation activity
            $this->logSupplierActivity($supplier, 'created', 'Supplier created successfully');
            
            return $supplier;
        });
    }

    public function updateSupplier(int $id, array $data): Supplier
    {
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            throw new ModelNotFoundException('Supplier not found');
        }
        
        $validatedData = $this->validateSupplierData($data, $id);
        
        return DB::transaction(function () use ($supplier, $validatedData, $id) {
            $this->supplierRepository->update($id, $validatedData);
            
            // Reload model
            $supplier = $this->supplierRepository->findById($id);
            
            // Log update activity
            $this->logSupplierActivity($supplier, 'updated', 'Supplier information updated');
            
            return $supplier;
        });
    }

    public function deleteSupplier(int $id): bool
    {
        $supplier = $this->supplierRepository->findById($id);
        
        if (!$supplier) {
            return false;
        }
        
        // Check if supplier has active orders
        if ($supplier->purchaseOrders()->whereIn('status', ['pending', 'approved', 'partial'])->exists()) {
            throw new ValidationException('Cannot delete supplier with active purchase orders');
        }
        
        return DB::transaction(function () use ($supplier, $id) {
            // Log deletion activity
            $this->logSupplierActivity($supplier, 'deleted', 'Supplier deleted');
            
            return $this->supplierRepository->delete($id);
        });
    }

    public function generateSupplierCode(): string
    {
        do {
            $code = 'SUP-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        } while (Supplier::where('supplier_code', $code)->exists());

        return $code;
    }

    public function validateSupplierData(array $data, ?int $supplierId = null): array
    {
        $rules = [
            'company_name' => 'required|string|max:255',
            'trade_name' => 'nullable|string|max:255',
            'supplier_type' => ['required', 'in:' . implode(',', array_keys(SupplierConstants::SUPPLIER_TYPES))],
            'status' => ['nullable', 'in:' . implode(',', array_keys(SupplierConstants::STATUSES))],
            'contact_person' => 'nullable|string|max:255',
            'contact_title' => 'nullable|string|max:255',
            'email' => [
                'nullable',
                'email:rfc,dns',
                'max:255',
                $supplierId ? "unique:suppliers,email,{$supplierId}" : 'unique:suppliers,email'
            ],
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',

            // Address validation
            'address_line_1' => 'required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'required|string|max:100',
            'state_province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            
            // Business information
            'tax_id' => 'nullable|string|max:50',
            'registration_number' => 'nullable|string|max:100',
            'business_description' => 'nullable|string|max:1000',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            
            // Financial information
            'payment_terms' => ['nullable', 'in:' . implode(',', array_keys(SupplierConstants::PAYMENT_TERMS))],
            'currency' => 'nullable|string|size:3',
            'credit_limit' => 'nullable|numeric|min:0|max:999999999.99',
            
            // JSON fields
            'certifications' => 'nullable|array',
            'shipping_methods' => 'nullable|array',
            'product_categories' => 'nullable|array',
            'tags' => 'nullable|array',
        ];

        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    public function getSupplierMetrics(int $id): array
    {
        $supplier = $this->supplierRepository->findById($id, ['purchaseOrders', 'contactLogs']);
        
        if (!$supplier) {
            throw new ModelNotFoundException('Supplier not found');
        }

        return [
            'total_orders' => $supplier->total_orders ?? 0,
            'total_order_value' => $supplier->total_order_value ?? 0,
            'average_order_value' => $supplier->average_order_value ?? 0,
            'on_time_delivery_percentage' => $supplier->on_time_delivery_percentage ?? 0,
            'overall_rating' => $supplier->overall_rating ?? 0,
            'quality_rating' => $supplier->quality_rating ?? 0,
            'delivery_rating' => $supplier->delivery_rating ?? 0,
            'service_rating' => $supplier->service_rating ?? 0,
            'contact_logs_count' => $supplier->contactLogs->count(),
            'performance_score' => $this->calculatePerformanceScore($supplier),
        ];
    }

    private function logSupplierActivity(Supplier $supplier, string $action, string $description): void
    {
        ContactLog::create([
            'contactable_type' => Supplier::class,
            'contactable_id' => $supplier->id,
            'contact_type' => 'other',
            'direction' => 'outbound',
            'subject' => "Supplier {$action}",
            'description' => $description,
            'contact_date' => now(),
            'contact_person_id' => auth()->id(),
            'priority' => 'normal',
        ]);
    }

    private function calculatePerformanceScore(Supplier $supplier): float
    {
        $scores = array_filter([
            $supplier->overall_rating,
            $supplier->quality_rating,
            $supplier->delivery_rating,
            $supplier->service_rating,
        ]);
        
        return empty($scores) ? 0 : round(array_sum($scores) / count($scores), 2);
    }

    public function getDisplayName(Supplier $supplier): string
    {
        return $supplier->trade_name ?: $supplier->company_name;
    }

    public function getFullAddress(Supplier $supplier): string
    {
        $address = $supplier->address_line_1;
        if ($supplier->address_line_2) {
            $address .= ', ' . $supplier->address_line_2;
        }
        $address .= ', ' . $supplier->city;
        if ($supplier->state_province) {
            $address .= ', ' . $supplier->state_province;
        }
        if ($supplier->postal_code) {
            $address .= ' ' . $supplier->postal_code;
        }
        $address .= ', ' . $supplier->country;
        
        return $address;
    }

    public function getAvailableCredit(Supplier $supplier): float
    {
        return max(0, $supplier->credit_limit - $supplier->current_balance);
    }

    public function getPerformanceScore(Supplier $supplier): float
    {
        $scores = [
            $supplier->overall_rating,
            $supplier->quality_rating,
            $supplier->delivery_rating,
            $supplier->service_rating
        ];
        
        $validScores = array_filter($scores, fn($score) => $score > 0);
        
        return empty($validScores) ? 0 : round(array_sum($validScores) / count($validScores), 2);
    }

    public function isActive(Supplier $supplier): bool
    {
        return $supplier->status === 'active';
    }

    public function canReceiveOrders(Supplier $supplier): bool
    {
        return in_array($supplier->status, ['active', 'pending_approval']);
    }

    public function updatePerformanceMetrics(Supplier $supplier): void
    {
        $orders = $supplier->purchaseOrders()
            ->where('status', '!=', 'cancelled')
            ->get();

        $supplier->update([
            'total_orders' => $orders->count(),
            'total_order_value' => $orders->sum('total_amount'),
            'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
            'last_order_date' => $orders->max('created_at'),
        ]);
    }

    public function addContactLog(Supplier $supplier, array $data): ContactLog
    {
        return $supplier->contactLogs()->create($data);
    }

    public function getNextOrderNumber(Supplier $supplier): string
    {
        $lastOrder = $supplier->purchaseOrders()
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = $lastOrder ? 
            intval(substr($lastOrder->po_number, -3)) + 1 : 1;

        return $supplier->supplier_code . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}