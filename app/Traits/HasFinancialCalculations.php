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
        $this->tax_amount = $this->subtotal * $this->tax_rate;
        $this->total_amount = $this->subtotal + $this->tax_amount + $this->shipping_cost - $this->discount_amount;
        $this->save();
    }

    public function updateTotals(): void
    {
        $this->calculateTotals();
    }
}
