<?php

namespace App\Traits;

use Carbon\Carbon;

trait HasDeliveryTracking
{
    public function getDaysUntilDeliveryAttribute(): ?int
    {
        $deliveryDate = $this->getDeliveryDate();
        if (!$deliveryDate) {
            return null;
        }

        return Carbon::now()->diffInDays($deliveryDate, false);
    }

    public function getIsOverdueAttribute(): bool
    {
        $deliveryDate = $this->getDeliveryDate();
        if (!$deliveryDate) {
            return false;
        }

        return $deliveryDate->isPast() && 
                !in_array($this->status, $this->getInactiveStatuses());
    }

    public function scopeOverdue($query)
    {
        return $query->where($this->getDeliveryDateColumn(), '<', Carbon::now())
                    ->whereNotIn('status', $this->getInactiveStatuses());
    }

    // Abstract methods
    abstract protected function getDeliveryDate();
    abstract protected function getDeliveryDateColumn(): string;
}
