<?php

namespace App\Traits;

trait ContactLogScopes
{
    public function scopeByType($query, string $type)
    {
        return $query->where('contact_type', $type);
    }

    public function scopeByDirection($query, string $direction)
    {
        return $query->where('direction', $direction);
    }

    public function scopeNeedsFollowUp($query)
    {
        return $query->where('follow_up_date', '<=', now())
                    ->whereNotNull('follow_up_date');
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('contact_date', '>=', now()->subDays($days));
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByOutcome($query, string $outcome)
    {
        return $query->where('outcome', $outcome);
    }
}
