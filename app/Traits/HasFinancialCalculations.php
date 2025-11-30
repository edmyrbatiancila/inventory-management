<?php

namespace App\Traits;

trait HasFinancialCalculations
{
    public function getFormattedTotalAmountAttribute(): string
    {
        return number_format($this->total_amount, 2);
    }

    public function calculateTotals(): void
    {
        $this->subtotal = $this->items()->sum('final_line_total');
        $taxRate = (float) ($this->tax_rate ?? 0);
        $shippingCost = (float) ($this->shipping_cost ?? 0);
        $discountAmount = (float) ($this->discount_amount ?? 0);
        
        $this->tax_amount = $this->subtotal * $taxRate;
        $this->total_amount = $this->subtotal + $this->tax_amount + $shippingCost - $discountAmount;
        $this->save();
    }

    public function updateTotals(): void
    {
        $this->calculateTotals();
    }
}
