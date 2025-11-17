<?php

namespace App\Models;

use App\Traits\HasItemCalculations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesOrderItem extends Model
{
    use HasFactory, HasItemCalculations;

    protected $fillable = [
        'sales_order_id', 'product_id', 'inventory_id', 'product_sku', 
        'product_name', 'product_description', 'quantity_ordered', 
        'quantity_fulfilled', 'quantity_shipped', 'quantity_pending', 
        'quantity_backordered', 'unit_price', 'line_total', 'discount_percentage', 
        'discount_amount', 'final_line_total', 'item_status', 'requested_delivery_date', 
        'promised_delivery_date', 'allocated_at', 'fulfilled_at', 'shipped_at', 
        'delivered_at', 'fulfillment_notes', 'requires_allocation', 'allocated_quantity', 
        'allocation_expires_at', 'quantity_returned', 'return_reason', 'metadata', 
        'notes', 'customer_notes'
    ];

    protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_fulfilled' => 'integer',
        'quantity_shipped' => 'integer',
        'quantity_pending' => 'integer',
        'quantity_backordered' => 'integer',
        'quantity_returned' => 'integer',
        'allocated_quantity' => 'integer',
        'unit_price' => 'decimal:4',
        'line_total' => 'decimal:4',
        'discount_percentage' => 'decimal:4',
        'discount_amount' => 'decimal:4',
        'final_line_total' => 'decimal:4',
        'requested_delivery_date' => 'date',
        'promised_delivery_date' => 'date',
        'allocated_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'allocation_expires_at' => 'datetime',
        'requires_allocation' => 'boolean',
        'metadata' => 'array'
    ];

    // Relationships
    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    // Accessors
    public function getFulfillmentProgressAttribute(): float
    {
        return $this->quantity_ordered > 0 ? 
               ($this->quantity_fulfilled / $this->quantity_ordered) * 100 : 0;
    }

    public function getRemainingQuantityAttribute(): int
    {
        return max(0, $this->quantity_ordered - $this->quantity_fulfilled);
    }

    public function getIsFullyFulfilledAttribute(): bool
    {
        return $this->quantity_fulfilled >= $this->quantity_ordered;
    }

    // Scopes
    public function scopeByProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('item_status', $status);
    }

    public function scopeRequiringAllocation($query)
    {
        return $query->where('requires_allocation', true)
                    ->where('allocated_quantity', '<', 'quantity_ordered');
    }

    // Business Logic
    public function fulfillQuantity(int $quantity, ?string $notes = null): bool
    {
        if ($quantity <= 0 || ($this->quantity_fulfilled + $quantity) > $this->quantity_ordered) {
            return false;
        }

        $this->quantity_fulfilled += $quantity;
        $this->fulfilled_at = now();
        
        if ($notes) {
            $this->fulfillment_notes = $this->fulfillment_notes 
                ? $this->fulfillment_notes . "\n" . $notes 
                : $notes;
        }

        $this->save();
        $this->salesOrder->updateFulfillmentStatus();

        return true;
    }

     // Trait implementations
    protected function getUnitCostField(): string
    {
        return 'unit_price';
    }

    protected function getReceivedQuantity(): int
    {
        return $this->quantity_fulfilled;
    }

    protected function getItemStatuses(): array
    {
        return [
            'pending' => 'Pending',
            'confirmed' => 'Confirmed',
            'allocated' => 'Allocated',
            'partially_fulfilled' => 'Partially Fulfilled',
            'fully_fulfilled' => 'Fully Fulfilled',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'backordered' => 'Backordered',
        ];
    }

    protected function getItemStatusColors(): array
    {
        return [
            'pending' => 'gray',
            'confirmed' => 'blue',
            'allocated' => 'indigo',
            'partially_fulfilled' => 'orange',
            'fully_fulfilled' => 'purple',
            'shipped' => 'cyan',
            'delivered' => 'green',
            'cancelled' => 'red',
            'backordered' => 'yellow',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($item) {
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
            $item->salesOrder->calculateTotals();
        });
    }
}
