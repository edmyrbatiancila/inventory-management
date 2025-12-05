<?php

namespace App\Http\Resources;

use App\Constants\ContactLogConstants;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            
            // Polymorphic relationship
            'contactable_type' => $this->contactable_type,
            'contactable_id' => $this->contactable_id,
            'contactable' => $this->whenLoaded('contactable', function () {
                return [
                    'id' => $this->contactable->id,
                    'type' => class_basename($this->contactable_type),
                    'name' => $this->getContactableName(),
                    'display_name' => $this->getContactableDisplayName(),
                ];
            }),

             // Contact Information
            'contact_type' => $this->contact_type,
            'contact_type_label' => ContactLogConstants::CONTACT_TYPES[$this->contact_type] ?? $this->contact_type,
            'direction' => $this->direction,
            'direction_label' => ContactLogConstants::DIRECTIONS[$this->direction] ?? $this->direction,
            'subject' => $this->subject,
            'description' => $this->description,
            'outcome' => $this->outcome,
            'outcome_label' => $this->outcome ? (ContactLogConstants::OUTCOMES[$this->outcome] ?? $this->outcome) : null,
            
            // Participants
            'contact_person_id' => $this->contact_person_id,
            'contact_person' => $this->whenLoaded('contactPerson', function () {
                return [
                    'id' => $this->contactPerson->id,
                    'name' => $this->contactPerson->name,
                    'email' => $this->contactPerson->email,
                ];
            }),
            'external_contact_person' => $this->external_contact_person,
            'external_contact_email' => $this->external_contact_email,
            'external_contact_phone' => $this->external_contact_phone,

            // Timing
            'contact_date' => $this->contact_date,
            'contact_date_formatted' => $this->contact_date->format('M d, Y g:i A'),
            'contact_date_human' => $this->contact_date->diffForHumans(),
            'duration_minutes' => $this->duration_minutes,
            'duration_formatted' => $this->getFormattedDuration(),
            'follow_up_date' => $this->follow_up_date,
            'follow_up_date_formatted' => $this->follow_up_date?->format('M d, Y g:i A'),
            'is_follow_up_due' => $this->isFollowUpDue(),
            'follow_up_status' => $this->getFollowUpStatus(),
            
            // Additional Information
            'attachments' => $this->attachments,
            'attachment_count' => is_array($this->attachments) ? count($this->attachments) : 0,
            'priority' => $this->priority,
            'priority_label' => ContactLogConstants::PRIORITIES[$this->priority] ?? $this->priority,
            'priority_badge_color' => $this->getPriorityBadgeColor(),
            'tags' => $this->tags,
            'tag_count' => is_array($this->tags) ? count($this->tags) : 0,
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'created_at_formatted' => $this->created_at->format('M d, Y g:i A'),
            'updated_at_formatted' => $this->updated_at->format('M d, Y g:i A'),

            // Computed fields
            'type_icon' => $this->getTypeIcon(),
            'direction_icon' => $this->getDirectionIcon(),
            'outcome_badge_color' => $this->getOutcomeBadgeColor(),
            'can_edit' => $this->canEdit(),
            'can_delete' => $this->canDelete(),
        ];
    }

    private function getContactableName(): string
    {
        if (!$this->relationLoaded('contactable') || !$this->contactable) {
            return 'Unknown';
        }

        return match (class_basename($this->contactable_type)) {
            'Supplier' => $this->contactable->company_name,
            'Customer' => $this->contactable->customer_type === 'individual' 
                ? "{$this->contactable->first_name} {$this->contactable->last_name}"
                : ($this->contactable->trade_name ?: $this->contactable->company_name),
            default => 'Unknown Contact'
        };
    }

    private function getContactableDisplayName(): string
    {
        if (!$this->relationLoaded('contactable') || !$this->contactable) {
            return 'Unknown Contact';
        }

        $type = class_basename($this->contactable_type);
        $name = $this->getContactableName();
        
        return "{$type}: {$name}";
    }

    private function getFormattedDuration(): string
    {
        if (!$this->duration_minutes) {
            return 'N/A';
        }
        
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }
        
        return "{$minutes}m";
    }

    private function isFollowUpDue(): bool
    {
        return $this->follow_up_date && $this->follow_up_date <= now();
    }

    private function getFollowUpStatus(): ?string
    {
        if (!$this->follow_up_date) {
            return null;
        }

        if ($this->follow_up_date <= now()) {
            return 'overdue';
        }

        if ($this->follow_up_date <= now()->addDays(1)) {
            return 'due_soon';
        }

        return 'scheduled';
    }

    private function getPriorityBadgeColor(): string
    {
        return match($this->priority) {
            'low' => 'bg-gray-100 text-gray-800',
            'normal' => 'bg-blue-100 text-blue-800',
            'high' => 'bg-orange-100 text-orange-800',
            'urgent' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    private function getOutcomeBadgeColor(): string
    {
        return match($this->outcome) {
            'successful' => 'bg-green-100 text-green-800',
            'resolved' => 'bg-blue-100 text-blue-800',
            'no_answer' => 'bg-yellow-100 text-yellow-800',
            'follow_up_needed' => 'bg-orange-100 text-orange-800',
            'escalated' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    private function getTypeIcon(): string
    {
        return match($this->contact_type) {
            'call' => 'phone',
            'email' => 'mail',
            'meeting' => 'users',
            'visit' => 'map-pin',
            'message' => 'message-circle',
            default => 'contact'
        };
    }

    private function getDirectionIcon(): string
    {
        return match($this->direction) {
            'inbound' => 'arrow-down-left',
            'outbound' => 'arrow-up-right',
            default => 'arrow-right'
        };
    }

    private function canEdit(): bool
    {
        // Add your authorization logic here
        return auth()->check();
    }

    private function canDelete(): bool
    {
        // Add your authorization logic here
        return auth()->check() && auth()->user()->isAdmin();
    }
}
