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
        $this->line_total = $this->quantity_ordered * $this->$unitField;
        
        if ($this->discount_percentage > 0) {
            $this->discount_amount = $this->line_total * ($this->discount_percentage / 100);
        }
        
        $this->final_line_total = $this->line_total - $this->discount_amount;
        $this->quantity_pending = $this->quantity_ordered - $this->getReceivedQuantity();
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
