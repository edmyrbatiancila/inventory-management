<?php

namespace App\Traits;

trait HasOrderItems
{
    public function getTotalItemsCount(): int
    {
        return $this->items()->count();
    }

    public function getTotalQuantityOrdered(): int
    {
        return $this->items()->sum('quantity_ordered');
    }

    public function scopeWithRelations($query)
    {
        return $query->with([
            'warehouse', 'createdBy',
            'items.product', 'items' => function($query) {
                $query->orderBy('created_at');
            }
        ]);
    }
}
