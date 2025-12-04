<?php

namespace App\Constants;

class ContactLogConstants
{
    public const CONTACT_TYPES = [
        'call' => 'Phone Call',
        'email' => 'Email',
        'meeting' => 'Meeting',
        'visit' => 'Site Visit',
        'message' => 'Message',
        'other' => 'Other',
    ];

    public const DIRECTIONS = [
        'inbound' => 'Inbound',
        'outbound' => 'Outbound',
    ];

    public const OUTCOMES = [
        'successful' => 'Successful',
        'no_answer' => 'No Answer',
        'follow_up_needed' => 'Follow-up Needed',
        'resolved' => 'Resolved',
        'escalated' => 'Escalated',
    ];

    public const PRIORITIES = [
        'low' => 'Low',
        'normal' => 'Normal',
        'high' => 'High',
        'urgent' => 'Urgent',
    ];
}