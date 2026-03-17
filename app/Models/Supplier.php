<?php

namespace App\Models;

use App\Services\SupplierService;
use App\Traits\HasSearchAndFilter;
use App\Traits\SupplierScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory, HasSearchAndFilter, SoftDeletes, SupplierScopes;

    protected $fillable = [
        'supplier_code',
        'company_name',
        'trade_name',
        'supplier_type',
        'status',
        'contact_person',
        'contact_title',
        'email',
        'phone',
        'mobile',
        'fax',
        'website',
        'address_line_1',
        'address_line_2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'tax_id',
        'registration_number',
        'business_description',
        'certifications',
        'established_year',
        'payment_terms',
        'currency',
        'credit_limit',
        'current_balance',
        'payment_method',
        'bank_name',
        'bank_account_number',
        'bank_routing_number',
        'overall_rating',
        'quality_rating',
        'delivery_rating',
        'service_rating',
        'total_orders',
        'total_order_value',
        'average_order_value',
        'on_time_delivery_percentage',
        'quality_issues_count',
        'standard_lead_time',
        'rush_order_lead_time',
        'minimum_order_value',
        'tax_exempt',
        'required_documents',
        'insurance_expiry',
        'shipping_methods',
        'product_categories',
        'tags',
        'internal_notes',
        'special_instructions',
        'created_by',
        'updated_by',
        'last_order_date',
        'last_contact_date',
        'contract_start_date',
        'contract_end_date',
        'contract_type',
    ];

    protected $casts = [
        'certifications' => 'array',
        'required_documents' => 'array',
        'shipping_methods' => 'array',
        'product_categories' => 'array',
        'tags' => 'array',
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'overall_rating' => 'decimal:2',
        'quality_rating' => 'decimal:2',
        'delivery_rating' => 'decimal:2',
        'service_rating' => 'decimal:2',
        'total_order_value' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'minimum_order_value' => 'decimal:2',
        'tax_exempt' => 'boolean',
        'established_year' => 'integer',
        'total_orders' => 'integer',
        'on_time_delivery_percentage' => 'integer',
        'quality_issues_count' => 'integer',
        'standard_lead_time' => 'integer',
        'rush_order_lead_time' => 'integer',
        'insurance_expiry' => 'date',
        'last_order_date' => 'datetime',
        'last_contact_date' => 'datetime',
        'contract_start_date' => 'date',
        'contract_end_date' => 'date',
    ];

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function contactLogs(): MorphMany
    {
        return $this->morphMany(ContactLog::class, 'contactable');
    }

    // Helper Methods
    public function getFullAddress(): string
    {
        $addressParts = array_filter([
            $this->address_line_1,
            $this->address_line_2,
            $this->city,
            $this->state_province,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $addressParts);
    }

    public function getPerformanceScore(): float
    {
        // Calculate weighted performance score
        $weights = [
            'quality_rating' => 0.3,
            'delivery_rating' => 0.3,
            'service_rating' => 0.2,
            'overall_rating' => 0.2,
        ];

        $score = 0;
        $totalWeight = 0;

        foreach ($weights as $field => $weight) {
            $value = $this->$field;
            if ($value > 0) {
                $score += $value * $weight;
                $totalWeight += $weight;
            }
        }

        return $totalWeight > 0 ? round($score / $totalWeight * 100 / 5, 2) : 0;
    }

    public function getStatusBadgeColor(): string
    {
        return match ($this->status) {
            'active' => 'green',
            'inactive' => 'gray',
            'blacklisted' => 'red',
            'pending_approval' => 'yellow',
            default => 'gray',
        };
    }

    public function getDisplayName(): string
    {
        return $this->trade_name ?: $this->company_name;
    }

    public function isContractActive(): bool
    {
        if (! $this->contract_start_date || ! $this->contract_end_date) {
            return false;
        }

        $now = now();

        return $now >= $this->contract_start_date && $now <= $this->contract_end_date;
    }

    public function canReceiveOrders(): bool
    {
        return in_array($this->status, ['active', 'pending_approval']);
    }

    public function hasActiveOrders(): bool
    {
        // Check if supplier has active purchase orders
        return $this->purchaseOrders()
            ->whereIn('status', ['pending', 'approved', 'sent_to_supplier', 'partially_received'])
            ->exists();
    }

    // Boot method for model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (empty($supplier->supplier_code)) {
                $supplier->supplier_code = app(SupplierService::class)->generateSupplierCode();
            }
        });
    }
}
