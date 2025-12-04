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
    use HasFactory, SoftDeletes, HasSearchAndFilter, SupplierScopes;

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
