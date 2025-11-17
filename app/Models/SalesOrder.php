<?php

namespace App\Models;

use App\Traits\HasDeliveryTracking;
use App\Traits\HasFinancialCalculations;
use App\Traits\HasNumberGeneration;
use App\Traits\HasOrderItems;
use App\Traits\HasPriorityManagement;
use App\Traits\HasSearchAndFilter;
use App\Traits\HasStatusManagement;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesOrder extends Model
{
    /** @use HasFactory<\Database\Factories\SalesOrderFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;
    use HasStatusManagement, HasPriorityManagement, HasFinancialCalculations;
    use HasOrderItems, HasDeliveryTracking, HasNumberGeneration;

    protected $fillable = [
        'so_number', 'customer_reference', 'customer_name', 'customer_email', 
        'customer_phone', 'customer_address', 'customer_contact_person',
        'status', 'priority', 'warehouse_id', 'created_by', 'approved_by', 
        'fulfilled_by', 'shipped_by', 'subtotal', 'tax_rate', 'tax_amount', 
        'shipping_cost', 'discount_amount', 'total_amount', 'requested_delivery_date', 
        'promised_delivery_date', 'approved_at', 'confirmed_at', 'fulfilled_at', 
        'shipped_at', 'delivered_at', 'cancelled_at', 'shipping_address', 
        'shipping_method', 'tracking_number', 'carrier', 'notes', 'customer_notes', 
        'terms_and_conditions', 'cancellation_reason', 'metadata', 'is_recurring', 
        'currency', 'payment_terms', 'payment_status'
    ];

    protected $casts = [
        'subtotal' => 'decimal:4',
        'tax_rate' => 'decimal:4',
        'tax_amount' => 'decimal:4',
        'shipping_cost' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'total_amount' => 'decimal:4',
        'requested_delivery_date' => 'date',
        'promised_delivery_date' => 'date',
        'approved_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
        'is_recurring' => 'boolean'
    ];

    // Status Constants
    public const STATUSES = [
        'draft' => 'Draft',
        'pending_approval' => 'Pending Approval',
        'approved' => 'Approved',
        'confirmed' => 'Confirmed',
        'partially_fulfilled' => 'Partially Fulfilled',
        'fully_fulfilled' => 'Fully Fulfilled',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
        'closed' => 'Closed',
    ];

    public const PAYMENT_STATUSES = [
        'pending' => 'Pending',
        'partial' => 'Partial',
        'paid' => 'Paid',
        'overdue' => 'Overdue',
        'cancelled' => 'Cancelled',
    ];

    // Relationships
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function fulfilledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fulfilled_by');
    }

    public function shippedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shipped_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'related_document_id')
                    ->where('related_document_type', 'sales_order');
    }

    // Payment Status
    public function getPaymentStatusLabelAttribute(): string
    {
        return self::PAYMENT_STATUSES[$this->payment_status] ?? 'Unknown';
    }

    public function getPaymentStatusColorAttribute(): string
    {
        return match($this->payment_status) {
            'pending' => 'yellow',
            'partial' => 'orange',
            'paid' => 'green',
            'overdue' => 'red',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }

    // Scopes
    public function scopeByCustomer($query, string $customerName)
    {
        return $query->where('customer_name', 'LIKE', "%{$customerName}%");
    }

    public function scopeByPaymentStatus($query, string $paymentStatus)
    {
        return $query->where('payment_status', $paymentStatus);
    }

    // Business Logic
    public function getTotalQuantityFulfilled(): int
    {
        return $this->items()->sum('quantity_fulfilled');
    }

    public function getTotalQuantityShipped(): int
    {
        return $this->items()->sum('quantity_shipped');
    }

    public function getFulfillmentProgress(): float
    {
        $totalOrdered = $this->getTotalQuantityOrdered();
        $totalFulfilled = $this->getTotalQuantityFulfilled();
        
        return $totalOrdered > 0 ? ($totalFulfilled / $totalOrdered) * 100 : 0;
    }

    public function updateFulfillmentStatus(): void
    {
        $totalFulfilled = $this->getTotalQuantityFulfilled();
        $totalOrdered = $this->getTotalQuantityOrdered();
        
        if ($totalFulfilled === 0) {
            $this->status = 'confirmed';
        } elseif ($totalFulfilled < $totalOrdered) {
            $this->status = 'partially_fulfilled';
        } else {
            $this->status = 'fully_fulfilled';
            $this->fulfilled_at = now();
        }
        
        $this->save();
    }

    // Trait implementations
    protected function getStatusConstants(): array
    {
        return self::STATUSES;
    }

    protected function getStatusColorMapping(): array
    {
        return [
            'draft' => 'gray',
            'pending_approval' => 'yellow',
            'approved' => 'blue',
            'confirmed' => 'indigo',
            'partially_fulfilled' => 'orange',
            'fully_fulfilled' => 'purple',
            'shipped' => 'cyan',
            'delivered' => 'green',
            'cancelled' => 'red',
            'closed' => 'slate',
        ];
    }

    protected function getInactiveStatuses(): array
    {
        return ['delivered', 'cancelled', 'closed'];
    }

    protected function getEditableStatuses(): array
    {
        return ['draft', 'pending_approval'];
    }

    protected function getNonCancellableStatuses(): array
    {
        return ['delivered', 'cancelled', 'closed'];
    }

    protected function getDeliveryDate()
    {
        return $this->promised_delivery_date ?: $this->requested_delivery_date;
    }

    protected function getDeliveryDateColumn(): string
    {
        return 'promised_delivery_date';
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($salesOrder) {
            if (!$salesOrder->so_number) {
                $salesOrder->so_number = static::generateNumber('SO');
            }
        });
        
        static::deleting(function ($salesOrder) {
            $salesOrder->items()->delete();
        });
    }
}
