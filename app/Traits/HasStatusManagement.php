<?php

namespace App\Traits;

trait HasStatusManagement
{
    public function getStatusLabelAttribute(): string
    {
        $statuses = $this->getStatusConstants();
        return $statuses[$this->status] ?? 'Unknown';
    }

    public function getStatusColorAttribute(): string
    {
        return $this->getStatusColorMapping()[$this->status] ?? 'gray';
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', $this->getInactiveStatuses());
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, $this->getEditableStatuses());
    }

    public function canBeCancelled(): bool
    {
        return !in_array($this->status, $this->getNonCancellableStatuses());
    }

    // Abstract methods to be implemented in models
    abstract protected function getStatusConstants(): array;
    abstract protected function getStatusColorMapping(): array;
    abstract protected function getInactiveStatuses(): array;
    abstract protected function getEditableStatuses(): array;
    abstract protected function getNonCancellableStatuses(): array;
}
