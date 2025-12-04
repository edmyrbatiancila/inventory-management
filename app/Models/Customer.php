<?php

namespace App\Models;

use App\Services\CustomerService;
use App\Traits\CustomerScopes;
use App\Traits\HasSearchAndFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter, CustomerScopes;

    protected $fillable = [
        'customer_code',
        'customer_type',
        'company_name',
        'trade_name',
        'first_name',
        'last_name',
        'status',
        'contact_person',
        'contact_title',
        'email',
        'phone',
        'mobile',
        'fax',
        'website',
        'billing_address_line_1',
        'billing_address_line_2',
        'billing_city',
        'billing_state_province',
        'billing_postal_code',
        'billing_country',
        'same_as_billing',
        'shipping_address_line_1',
        'shipping_address_line_2',
        'shipping_city',
        'shipping_state_province',
        'shipping_postal_code',
        'shipping_country',
        'tax_id',
        'registration_number',
        'business_description',
        'industry_sectors',
        'established_year',
        'company_size',
        'payment_terms',
        'currency',
        'credit_limit',
        'current_balance',
        'available_credit',
        'credit_status',
        'payment_method',
        'customer_satisfaction_rating',
        'total_orders',
        'total_order_value',
        'average_order_value',
        'lifetime_value',
        'payment_delay_days_average',
        'return_rate_percentage',
        'complaint_count',
        'assigned_sales_rep',
        'customer_priority',
        'lead_source',
        'special_requirements',
        'preferred_delivery_methods',
        'price_tier',
        'default_discount_percentage',
        'volume_discount_eligible',
        'seasonal_discount_eligible',
        'communication_preferences',
        'marketing_preferences',
        'newsletter_subscription',
        'customer_categories',
        'tags',
        'internal_notes',
        'sales_notes',
        'tax_exempt',
        'tax_exempt_certificate',
        'created_by',
        'updated_by',
        'last_order_date',
        'last_contact_date',
        'first_purchase_date',
        'contract_start_date',
        'contract_end_date',
        'contract_type',
    ];

    protected $casts = [
        'industry_sectors' => 'array',
        'preferred_delivery_methods' => 'array',
        'communication_preferences' => 'array',
        'marketing_preferences' => 'array',
        'customer_categories' => 'array',
        'tags' => 'array',
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'available_credit' => 'decimal:2',
        'customer_satisfaction_rating' => 'decimal:2',
        'total_order_value' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'lifetime_value' => 'decimal:2',
        'default_discount_percentage' => 'decimal:2',
        'same_as_billing' => 'boolean',
        'volume_discount_eligible' => 'boolean',
        'seasonal_discount_eligible' => 'boolean',
        'newsletter_subscription' => 'boolean',
        'tax_exempt' => 'boolean',
        'established_year' => 'integer',
        'total_orders' => 'integer',
        'payment_delay_days_average' => 'integer',
        'return_rate_percentage' => 'integer',
        'complaint_count' => 'integer',
        'last_order_date' => 'datetime',
        'last_contact_date' => 'datetime',
        'first_purchase_date' => 'datetime',
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

    public function salesRep(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_sales_rep');
    }

    public function salesOrders(): HasMany
    {
        return $this->hasMany(SalesOrder::class);
    }

    public function contactLogs(): MorphMany
    {
        return $this->morphMany(ContactLog::class, 'contactable');
    }

    // Boot method for model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->customer_code)) {
                $customer->customer_code = app(CustomerService::class)->generateCustomerCode();
            }
        });
    }
}
