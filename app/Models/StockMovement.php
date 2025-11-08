<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    /** @use HasFactory<\Database\Factories\StockMovementFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'warehouse_id', 
        'user_id',
        'reference_number',
        'movement_type',
        'quantity_before',
        'quantity_moved',
        'quantity_after',
        'unit_cost',
        'total_value',
        'reason',
        'notes',
        'metadata',
        'related_document_type',
        'related_document_id',
        'status',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'approved_at' => 'datetime',
        'unit_cost' => 'decimal:4',
        'total_value' => 'decimal:4'
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeForWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    public function scopeByMovementType($query, $type)
    {
        return $query->where('movement_type', $type);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeApplied($query)
    {
        return $query->where('status', 'applied');
    }

    // Helper Methods
    public function isIncrease(): bool
    {
        return $this->quantity_moved > 0;
    }

    public function isDecrease(): bool
    {
        return $this->quantity_moved < 0;
    }

    public function getFormattedMovementTypeAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->movement_type));
    }

    public function getAbsoluteQuantityAttribute(): int
    {
        return abs($this->quantity_moved);
    }

    // Generate reference number
    public static function generateReferenceNumber(): string
    {
        $prefix = 'SM';
        $date = now()->format('Ymd');
        $sequence = static::whereDate('created_at', today())->count() + 1;
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
