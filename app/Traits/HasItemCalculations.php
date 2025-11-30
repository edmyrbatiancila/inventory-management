<?php

namespace App\Traits;

trait HasItemCalculations
{
    public function getFormattedUnitCostAttribute(): string
    {
        $field = $this->getUnitCostField();
        return number_format($this->$field, 4);
    }

    public function getFormattedLineTotalAttribute(): string
    {
        return number_format($this->final_line_total, 2);
    }

    public function calculateTotals(): void
    {
        $unitField = $this->getUnitCostField();
        $unitCost = (float) ($this->$unitField ?? 0);
        $quantity = (int) ($this->quantity_ordered ?? 0);
        $discountPercentage = (float) ($this->discount_percentage ?? 0);
        
        $this->line_total = $quantity * $unitCost;
        
        if ($discountPercentage > 0) {
            $this->discount_amount = $this->line_total * ($discountPercentage / 100);
        } else {
            $this->discount_amount = 0;
        }
        
        $this->final_line_total = $this->line_total - $this->discount_amount;
        $this->quantity_pending = $quantity - $this->getReceivedQuantity();
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->getItemStatuses()[$this->item_status] ?? 'Unknown';
    }

    public function getStatusColorAttribute(): string
    {
        return $this->getItemStatusColors()[$this->item_status] ?? 'gray';
    }

    // Abstract methods
    abstract protected function getUnitCostField(): string;
    abstract protected function getReceivedQuantity(): int;
    abstract protected function getItemStatuses(): array;
    abstract protected function getItemStatusColors(): array;
}
