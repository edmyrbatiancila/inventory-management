<?php

namespace App\Models;

use App\Traits\ContactLogScopes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContactLog extends Model
{
    /** @use HasFactory<\Database\Factories\ContactLogFactory> */
    use HasFactory, ContactLogScopes;

    protected $fillable = [
        'contactable_type',
        'contactable_id',
        'contact_type',
        'direction',
        'subject',
        'description',
        'outcome',
        'contact_person_id',
        'external_contact_person',
        'external_contact_email',
        'external_contact_phone',
        'contact_date',
        'duration_minutes',
        'follow_up_date',
        'attachments',
        'priority',
        'tags',
    ];

    protected $casts = [
        'contact_date' => 'datetime',
        'follow_up_date' => 'datetime',
        'attachments' => 'array',
        'tags' => 'array',
        'duration_minutes' => 'integer',
    ];

    // Relationships
    public function contactable(): MorphTo
    {
        return $this->morphTo();
    }

    public function contactPerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'contact_person_id');
    }
}
