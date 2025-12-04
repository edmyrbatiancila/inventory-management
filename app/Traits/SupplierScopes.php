<?php

namespace App\Traits;

trait SupplierScopes
{
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('supplier_type', $type);
    }

    public function scopeByCountry($query, string $country)
    {
        return $query->where('country', $country);
    }

    public function scopeWithHighRating($query, float $minRating = 4.0)
    {
        return $query->where('overall_rating', '>=', $minRating);
    }

    public function scopeRecentOrders($query, int $days = 30)
    {
        return $query->where('last_order_date', '>=', now()->subDays($days));
    }

    public function scopeByPaymentTerms($query, string $terms)
    {
        return $query->where('payment_terms', $terms);
    }

    public function scopePreferredVendors($query)
    {
        return $query->where('contract_type', 'preferred_vendor');
    }
}
