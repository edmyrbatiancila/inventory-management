<?php

namespace App\Models;

use App\Traits\HasSearchAndFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($inventory) {
            $inventory->quantity_available = $inventory->quantity_on_hand - $inventory->quantity_reserved;
        });
    }

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'quantity_on_hand',
        'quantity_reserved',
        'quantity_available',
        'notes'
    ];

    protected $casts = [
        'quantity_on_hand' => 'integer',
        'quantity_reserved' => 'integer',
        'quantity_available' => 'integer'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function updateAvailableQuantity()
    {
        $this->quantity_available = $this->quantity_on_hand - $this->quantity_reserved;

        $this->save();
    }

    public function isLowStock()
    {
        return $this->quantity_available <= $this->product->min_stock_level;
    }

    // Reserve quantity for orders
    public function reserveQuantity($quantity)
    {
        if ($this->quantity_available >= $quantity) {
            $this->quantity_reserved += $quantity;
            $this->updateAvailableQuantity();
            return true;
        }
        return false;
    }

    // Release reserved quantity
    public function releaseReservedQuantity($quantity)
    {
        $this->quantity_reserved = max(0, $this->quantity_reserved - $quantity);
        $this->updateAvailableQuantity();
    }

    
}
