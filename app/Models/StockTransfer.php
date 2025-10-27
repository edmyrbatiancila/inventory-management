<?php

namespace App\Models;

use App\Traits\HasSearchAndFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockTransfer extends Model
{
    /** @use HasFactory<\Database\Factories\StockTransferFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;

    protected $fillable = [
        'from_warehouse_id',
        'to_warehouse_id', 
        'product_id',
        'quantity_transferred',
        'transfer_status',
        'reference_number',
        'initiated_by',
        'approved_by',
        'completed_by',
        'notes',
        'cancellation_reason',
        'initiated_at',
        'approved_at',
        'completed_at',
        'cancelled_at'
    ];

    // Cast attributes to proper types
    protected $casts = [
        'quantity_transferred' => 'integer',
        'initiated_at' => 'datetime',
        'approved_at' => 'datetime', 
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Status constrants
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_IN_TRANSIT = 'in_transit';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_IN_TRANSIT,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED
    ];

    // Relationships
    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse(): BelongsTo  
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    // Accessors
    public function getStatusLabelAttribute(): string
    {
        return match($this->transfer_status) {
            self::STATUS_PENDING => 'Pending Approval',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_IN_TRANSIT => 'In Transit', 
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->transfer_status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_APPROVED => 'blue',
            self::STATUS_IN_TRANSIT => 'purple',
            self::STATUS_COMPLETED => 'green', 
            self::STATUS_CANCELLED => 'red',
            default => 'gray'
        };
    }

    // Query Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('transfer_status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('transfer_status', self::STATUS_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('transfer_status', self::STATUS_COMPLETED);
    }

    public function scopeByWarehouse($query, int $warehouseId, string $type = 'both')
    {
        return match($type) {
            'from' => $query->where('from_warehouse_id', $warehouseId),
            'to' => $query->where('to_warehouse_id', $warehouseId),
            default => $query->where(function($q) use ($warehouseId) {
                $q->where('from_warehouse_id', $warehouseId)
                    ->orWhere('to_warehouse_id', $warehouseId);
            })
        };
    }

    public function scopeByProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeWithRelations($query)
    {
        return $query->with([
            'fromWarehouse',
            'toWarehouse', 
            'product',
            'initiatedBy',
            'approvedBy',
            'completedBy'
        ]);
    }

    // Helper Methods
    public function canBeApproved(): bool
    {
        return $this->transfer_status === self::STATUS_PENDING;
    }

    public function canBeMarkedInTransit(): bool
    {
        return $this->transfer_status === self::STATUS_APPROVED;
    }

    public function canBeCompleted(): bool
    {
        return $this->transfer_status === self::STATUS_IN_TRANSIT;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->transfer_status, [
            self::STATUS_PENDING,
            self::STATUS_APPROVED
        ]);
    }
}
