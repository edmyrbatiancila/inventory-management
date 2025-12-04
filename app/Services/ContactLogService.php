<?php

namespace App\Services;

use App\Models\ContactLog;

class ContactLogService
{
    public function getFormattedDuration(ContactLog $contactLog): string
    {
        if (!$contactLog->duration_minutes) {
            return 'N/A';
        }
        
        $hours = floor($contactLog->duration_minutes / 60);
        $minutes = $contactLog->duration_minutes % 60;
        
        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }
        
        return "{$minutes}m";
    }

    public function isFollowUpDue(ContactLog $contactLog): bool
    {
        return $contactLog->follow_up_date && $contactLog->follow_up_date <= now();
    }

    public function markFollowUpCompleted(ContactLog $contactLog): void
    {
        $contactLog->update(['follow_up_date' => null]);
    }
}