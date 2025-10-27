<?php

namespace App\Models;

use App\Traits\HasSearchAndFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockAdjustment extends Model
{
    /** @use HasFactory<\Database\Factories\StockAdjustmentFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;

    protected $fillable = [
        'inventory_id',
        'adjustment_type',
        'quantity_adjusted',
        'quantity_before',
        'quantity_after',
        'reason',
        'notes',
        'reference_number',
        'adjusted_by',
        'adjusted_at'
    ];

    protected $casts = [
        'quantity_adjusted' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'adjusted_at' => 'datetime'
    ];

    // Add relationships
    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function adjustedBy()
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    // Add helper methods
    public static function generateReferenceNumber()
    {
        return 'ADJ-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    public function getFormattedAdjustmentAttribute()
    {
        $sign = $this->adjustment_type === 'increase' ? '+' : '-';
        return $sign . $this->quantity_adjusted;
    }
}
