<?php

namespace App\Models;

use App\Traits\HasSearchAndFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryMovement extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryMovementFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;

    // Movement type constants
    public const TYPE_STOCK_IN = 'stock_in';
    public const TYPE_STOCK_OUT = 'stock_out';
    public const TYPE_ADJUSTMENT_IN = 'adjustment_in';
    public const TYPE_ADJUSTMENT_OUT = 'adjustment_out';
    public const TYPE_TRANSFER_IN = 'transfer_in';
    public const TYPE_TRANSFER_OUT = 'transfer_out';
    public const TYPE_INCREASE = 'increase';  // For InventoryService compatibility
    public const TYPE_DECREASE = 'decrease';  // For InventoryService compatibility

    public const TYPES = [
        self::TYPE_STOCK_IN,
        self::TYPE_STOCK_OUT,
        self::TYPE_ADJUSTMENT_IN,
        self::TYPE_ADJUSTMENT_OUT,
        self::TYPE_TRANSFER_IN,
        self::TYPE_TRANSFER_OUT,
        self::TYPE_INCREASE,
        self::TYPE_DECREASE,
    ];

    protected $fillable = [
        'product_id',
        'warehouse_id', 
        'type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'reference_type',
        'reference_id',
        'notes',
        'movement_date'
    ];

    protected $casts = [
        'movement_date' => 'datetime',
        'quantity' => 'integer',
        'quantity_before' => 'integer', 
        'quantity_after' => 'integer'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
