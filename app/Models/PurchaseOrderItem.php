<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\PurchaseOrderItemFactory> */
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'product_sku',
        'product_name',
        'product_description',
        'quantity_ordered',
        'quantity_received',
        'quantity_pending',
        'unit_cost',
        'line_total',
        'discount_percentage',
        'discount_amount',
        'final_line_total',
        'item_status',
        'expected_delivery_date',
        'last_received_at',
        'receiving_notes',
        'quantity_rejected',
        'rejection_reason',
        'metadata',
        'notes'
    ];

    protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_received' => 'integer',
        'quantity_pending' => 'integer',
        'quantity_rejected' => 'integer',
        'unit_cost' => 'decimal:4',
        'line_total' => 'decimal:4',
        'discount_percentage' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'final_line_total' => 'decimal:4',
        'expected_delivery_date' => 'date',
        'last_received_at' => 'datetime',
        'metadata' => 'array'
    ];

    // Status Constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_PARTIALLY_RECEIVED = 'partially_received';
    public const STATUS_FULLY_RECEIVED = 'fully_received';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_BACKORDERED = 'backordered';

    public const STATUSES = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_PARTIALLY_RECEIVED => 'Partially Received',
        self::STATUS_FULLY_RECEIVED => 'Fully Received',
        self::STATUS_CANCELLED => 'Cancelled',
        self::STATUS_BACKORDERED => 'Backordered',
    ];

    // Relationships
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->item_status] ?? 'Unknown';
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->item_status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_PARTIALLY_RECEIVED => 'orange',
            self::STATUS_FULLY_RECEIVED => 'green',
            self::STATUS_CANCELLED => 'red',
            self::STATUS_BACKORDERED => 'purple',
            default => 'gray'
        };
    }

    public function getReceivingProgressAttribute(): float
    {
        return $this->quantity_ordered > 0 ? 
               ($this->quantity_received / $this->quantity_ordered) * 100 : 0;
    }

    public function getRemainingQuantityAttribute(): int
    {
        return max(0, $this->quantity_ordered - $this->quantity_received);
    }

    public function getIsFullyReceivedAttribute(): bool
    {
        return $this->quantity_received >= $this->quantity_ordered;
    }

    public function getIsPartiallyReceivedAttribute(): bool
    {
        return $this->quantity_received > 0 && $this->quantity_received < $this->quantity_ordered;
    }

    public function getFormattedUnitCostAttribute(): string
    {
        return number_format($this->unit_cost, 4);
    }

    public function getFormattedLineTotalAttribute(): string
    {
        return number_format($this->final_line_total, 2);
    }

    // Query Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('item_status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('item_status', self::STATUS_PENDING);
    }

    public function scopeFullyReceived($query)
    {
        return $query->where('item_status', self::STATUS_FULLY_RECEIVED);
    }

    public function scopePartiallyReceived($query)
    {
        return $query->where('item_status', self::STATUS_PARTIALLY_RECEIVED);
    }

    public function scopeByProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', now())
                    ->whereNotIn('item_status', [self::STATUS_FULLY_RECEIVED, self::STATUS_CANCELLED]);
    }

    // Business Logic Methods
    public function canReceiveQuantity(int $quantity): bool
    {
        return $quantity > 0 && 
                ($this->quantity_received + $quantity) <= $this->quantity_ordered &&
                $this->item_status !== self::STATUS_CANCELLED;
    }

    public function receiveQuantity(int $quantity, ?string $notes = null): bool
    {
        if (!$this->canReceiveQuantity($quantity)) {
            return false;
        }

        $this->quantity_received += $quantity;
        $this->last_received_at = now();
        
        if ($notes) {
            $this->receiving_notes = $this->receiving_notes 
                ? $this->receiving_notes . "\n" . $notes 
                : $notes;
        }

        $this->updateStatus();
        $this->save();

        // Update parent PO receiving status
        $this->purchaseOrder->updateReceivingStatus();

        return true;
    }

    public function rejectQuantity(int $quantity, string $reason): bool
    {
        if ($quantity <= 0) {
            return false;
        }

        $this->quantity_rejected += $quantity;
        $this->rejection_reason = $this->rejection_reason 
            ? $this->rejection_reason . "\n" . $reason 
            : $reason;

        $this->save();
        return true;
    }

    public function updateStatus(): void
    {
        if ($this->quantity_received >= $this->quantity_ordered) {
            $this->item_status = self::STATUS_FULLY_RECEIVED;
        } elseif ($this->quantity_received > 0) {
            $this->item_status = self::STATUS_PARTIALLY_RECEIVED;
        } else {
            $this->item_status = self::STATUS_PENDING;
        }
    }

    public function calculateTotals(): void
    {
        $this->line_total = $this->quantity_ordered * $this->unit_cost;
        
        if ($this->discount_percentage > 0) {
            $this->discount_amount = $this->line_total * ($this->discount_percentage / 100);
        }
        
        $this->final_line_total = $this->line_total - $this->discount_amount;
        $this->quantity_pending = $this->quantity_ordered - $this->quantity_received;
    }

    // Events
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($item) {
            // Capture product information at the time of order creation
            if ($item->product) {
                $item->product_sku = $item->product->sku;
                $item->product_name = $item->product->name;
            }
            
            $item->calculateTotals();
        });
        
        static::updating(function ($item) {
            $item->calculateTotals();
        });
        
        static::saved(function ($item) {
            // Update the parent purchase order totals whenever an item changes
            $item->purchaseOrder->calculateTotals();
        });
    }
}
