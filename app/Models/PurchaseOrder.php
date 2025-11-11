<?php

namespace App\Models;

use App\Traits\HasSearchAndFilter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    /** @use HasFactory<\Database\Factories\PurchaseOrderFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;

    protected $fillable = [
        'po_number',
        'supplier_reference',
        'supplier_name',
        'supplier_email',
        'supplier_phone',
        'supplier_address',
        'supplier_contact_person',
        'status',
        'priority',
        'warehouse_id',
        'created_by',
        'approved_by',
        'received_by',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'shipping_cost',
        'discount_amount',
        'total_amount',
        'expected_delivery_date',
        'approved_at',
        'sent_at',
        'received_at',
        'cancelled_at',
        'notes',
        'terms_and_conditions',
        'cancellation_reason',
        'metadata',
        'is_recurring',
        'currency'
    ];

    protected $casts = [
        'subtotal' => 'decimal:4',
        'tax_rate' => 'decimal:4',
        'tax_amount' => 'decimal:4',
        'shipping_cost' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'total_amount' => 'decimal:4',
        'expected_delivery_date' => 'date',
        'approved_at' => 'datetime',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
        'is_recurring' => 'boolean'
    ];

    // Status Constants
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING_APPROVAL = 'pending_approval';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_SENT_TO_SUPPLIER = 'sent_to_supplier';
    public const STATUS_PARTIALLY_RECEIVED = 'partially_received';
    public const STATUS_FULLY_RECEIVED = 'fully_received';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_CLOSED = 'closed';

    public const STATUSES = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_PENDING_APPROVAL => 'Pending Approval',
        self::STATUS_APPROVED => 'Approved',
        self::STATUS_SENT_TO_SUPPLIER => 'Sent to Supplier',
        self::STATUS_PARTIALLY_RECEIVED => 'Partially Received',
        self::STATUS_FULLY_RECEIVED => 'Fully Received',
        self::STATUS_CANCELLED => 'Cancelled',
        self::STATUS_CLOSED => 'Closed',
    ];

    // Priority Constants
    public const PRIORITY_LOW = 'low';
    public const PRIORITY_NORMAL = 'normal';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_URGENT = 'urgent';

    public const PRIORITIES = [
        self::PRIORITY_LOW => 'Low',
        self::PRIORITY_NORMAL => 'Normal',
        self::PRIORITY_HIGH => 'High',
        self::PRIORITY_URGENT => 'Urgent',
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

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'related_document_id')
                    ->where('related_document_type', 'purchase_order');
    }

    // Accessors
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    public function getPriorityLabelAttribute(): string
    {
        return self::PRIORITIES[$this->priority] ?? 'Unknown';
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'gray',
            self::STATUS_PENDING_APPROVAL => 'yellow',
            self::STATUS_APPROVED => 'blue',
            self::STATUS_SENT_TO_SUPPLIER => 'purple',
            self::STATUS_PARTIALLY_RECEIVED => 'orange',
            self::STATUS_FULLY_RECEIVED => 'green',
            self::STATUS_CANCELLED => 'red',
            self::STATUS_CLOSED => 'slate',
            default => 'gray'
        };
    }

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            self::PRIORITY_LOW => 'gray',
            self::PRIORITY_NORMAL => 'blue',
            self::PRIORITY_HIGH => 'orange',
            self::PRIORITY_URGENT => 'red',
            default => 'gray'
        };
    }

    public function getFormattedTotalAmountAttribute(): string
    {
        return number_format($this->total_amount, 2);
    }

    public function getDaysUntilDeliveryAttribute(): ?int
    {
        if (!$this->expected_delivery_date) {
            return null;
        }
        
        return Carbon::now()->diffInDays($this->expected_delivery_date, false);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (!$this->expected_delivery_date) {
            return false;
        }
        
        return $this->expected_delivery_date->isPast() && 
                !in_array($this->status, [self::STATUS_FULLY_RECEIVED, self::STATUS_CANCELLED, self::STATUS_CLOSED]);
    }

    // Query Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('status', self::STATUS_PENDING_APPROVAL);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_CANCELLED, self::STATUS_CLOSED]);
    }

    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', Carbon::now())
                    ->whereNotIn('status', [self::STATUS_FULLY_RECEIVED, self::STATUS_CANCELLED, self::STATUS_CLOSED]);
    }

    public function scopeByWarehouse($query, int $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    public function scopeBySupplier($query, string $supplierName)
    {
        return $query->where('supplier_name', 'LIKE', "%{$supplierName}%");
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeWithRelations($query)
    {
        return $query->with([
            'warehouse', 'createdBy', 'approvedBy', 'receivedBy',
            'items.product', 'items' => function($query) {
                $query->orderBy('created_at');
            }
        ]);
    }

    // Business Logic Methods
    public function canBeApproved(): bool
    {
        return $this->status === self::STATUS_PENDING_APPROVAL && $this->items()->count() > 0;
    }

    public function canBeSent(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function canBeReceived(): bool
    {
        return in_array($this->status, [self::STATUS_SENT_TO_SUPPLIER, self::STATUS_PARTIALLY_RECEIVED]);
    }

    public function canBeCancelled(): bool
    {
        return !in_array($this->status, [self::STATUS_FULLY_RECEIVED, self::STATUS_CANCELLED, self::STATUS_CLOSED]);
    }

    public function canBeClosed(): bool
    {
        return in_array($this->status, [self::STATUS_FULLY_RECEIVED, self::STATUS_PARTIALLY_RECEIVED]);
    }

    public function getTotalItemsCount(): int
    {
        return $this->items()->count();
    }

    public function getTotalQuantityOrdered(): int
    {
        return $this->items()->sum('quantity_ordered');
    }

    public function getTotalQuantityReceived(): int
    {
        return $this->items()->sum('quantity_received');
    }

    public function getReceivingProgress(): float
    {
        $totalOrdered = $this->getTotalQuantityOrdered();
        $totalReceived = $this->getTotalQuantityReceived();
        
        return $totalOrdered > 0 ? ($totalReceived / $totalOrdered) * 100 : 0;
    }

    public function updateReceivingStatus(): void
    {
        $totalReceived = $this->getTotalQuantityReceived();
        $totalOrdered = $this->getTotalQuantityOrdered();
        
        if ($totalReceived === 0) {
            $this->status = self::STATUS_SENT_TO_SUPPLIER;
        } elseif ($totalReceived < $totalOrdered) {
            $this->status = self::STATUS_PARTIALLY_RECEIVED;
        } else {
            $this->status = self::STATUS_FULLY_RECEIVED;
            $this->received_at = Carbon::now();
        }
        
        $this->save();
    }

    public function calculateTotals(): void
    {
        $this->subtotal = $this->items()->sum('final_line_total');
        $this->tax_amount = $this->subtotal * $this->tax_rate;
        $this->total_amount = $this->subtotal + $this->tax_amount + $this->shipping_cost - $this->discount_amount;
        $this->save();
    }

    public function updateTotals(): void
    {
        $this->calculateTotals();
    }

    // Static Methods
    public static function generatePoNumber(): string
    {
        $prefix = 'PO';
        $year = date('Y');
        $month = date('m');
        
        $lastPo = static::whereYear('created_at', $year)
                        ->whereMonth('created_at', $month)
                        ->orderBy('id', 'desc')
                        ->first();
        
        $sequence = $lastPo ? (int) substr($lastPo->po_number, -3) + 1 : 1;
        
        return sprintf('%s-%s%s-%03d', $prefix, $year, $month, $sequence);
    }

    // Events
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($purchaseOrder) {
            if (!$purchaseOrder->po_number) {
                $purchaseOrder->po_number = static::generatePoNumber();
            }
        });
        
        static::deleting(function ($purchaseOrder) {
            // Soft delete related items
            $purchaseOrder->items()->delete();
        });
    }
}
