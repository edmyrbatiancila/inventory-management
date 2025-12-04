<?php

namespace App\Traits;

trait CustomerScopes
{
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('customer_type', $type);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('customer_priority', $priority);
    }

    public function scopeByCreditStatus($query, string $status)
    {
        return $query->where('credit_status', $status);
    }

    public function scopeVip($query)
    {
        return $query->where('customer_priority', 'vip');
    }

    public function scopeRecentOrders($query, int $days = 30)
    {
        return $query->where('last_order_date', '>=', now()->subDays($days));
    }

    public function scopeByPriceTier($query, string $tier)
    {
        return $query->where('price_tier', $tier);
    }

    public function scopeWithCreditHold($query)
    {
        return $query->where('credit_status', 'hold');
    }
}
