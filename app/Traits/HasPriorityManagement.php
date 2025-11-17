<?php

namespace App\Traits;

trait HasPriorityManagement
{
    public function getPriorityLabelAttribute(): string
    {
        return $this->getPriorityConstants()[$this->priority] ?? 'Unknown';
    }

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'gray',
            'normal' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }

    public function scopeByPriority($query, string $priority) 
    {
        return $query->where('priority', $priority);
    }

    protected function getPriorityConstants(): array
    {
        return [
            'low' => 'Low',
            'normal' => 'Normal',
            'high' => 'High',
            'urgent' => 'Urgent'
        ];
    }
}
