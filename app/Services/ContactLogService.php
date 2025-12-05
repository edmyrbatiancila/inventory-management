<?php

namespace App\Services;

use App\Constants\ContactLogConstants;
use App\Contracts\ContactLogRepositoryInterface;
use App\Models\ContactLog;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ContactLogService
{
    protected $contactLogRepository;

    public function __construct(
        ContactLogRepositoryInterface $contactLogRepository
    ) {
        $this->contactLogRepository = $contactLogRepository;
    }

    public function getAllContactLogs(array $filters = [])
    {
        return $this->contactLogRepository->getAll($filters, ['contactable', 'contactPerson']);
    }

    public function getContactLogById(int $id): ContactLog
    {
        $contactLog = $this->contactLogRepository->findById($id, ['contactable', 'contactPerson']);
        
        if (!$contactLog) {
            throw new ModelNotFoundException("Contact log not found with ID: {$id}");
        }

        return $contactLog;
    }

    public function createContactLog(array $data): ContactLog
    {
        try {
            DB::beginTransaction();

            // Validate contactable exists
            $this->validateContactable($data['contactable_type'], $data['contactable_id']);

            // Create the contact log
            $contactLog = $this->contactLogRepository->create($data);

            DB::commit();

            return $contactLog->load(['contactable', 'contactPerson']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateContactLog(int $id, array $data): ContactLog
    {
        try {
            DB::beginTransaction();

            $contactLog = $this->getContactLogById($id);

            // Validate contactable exists if changed
            if (isset($data['contactable_type']) || isset($data['contactable_id'])) {
                $contactableType = $data['contactable_type'] ?? $contactLog->contactable_type;
                $contactableId = $data['contactable_id'] ?? $contactLog->contactable_id;
                $this->validateContactable($contactableType, $contactableId);
            }

            $updated = $this->contactLogRepository->update($id, $data);

            if (!$updated) {
                throw new \Exception('Failed to update contact log.');
            }

            DB::commit();

            return $this->getContactLogById($id);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteContactLog(int $id): bool
    {
        try {
            DB::beginTransaction();

            $contactLog = $this->getContactLogById($id);
            $deleted = $this->contactLogRepository->delete($id);

            if (!$deleted) {
                throw new \Exception('Failed to delete contact log.');
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getContactLogsForEntity(string $type, int $id)
    {
        return $this->contactLogRepository->getByContactable($type, $id);
    }

    public function getFollowUpsDue()
    {
        return $this->contactLogRepository->getNeedingFollowUp();
    }

    public function getRecentContactLogs(int $days = 30)
    {
        return $this->contactLogRepository->getRecent($days);
    }

    public function getContactLogsByType(string $type)
    {
        return $this->contactLogRepository->getByType($type);
    }

    public function getContactLogsByPriority(string $priority)
    {
        return $this->contactLogRepository->getByPriority($priority);
    }

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

    public function getContactLogMetrics(array $filters = []): array
    {
        $query = ContactLog::query();

        // Apply filters
        if (!empty($filters['date_from'])) {
            $query->whereDate('contact_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('contact_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['contactable_type'])) {
            $query->where('contactable_type', $filters['contactable_type']);
        }

        $contactLogs = $query->get();

        return [
            'total_contacts' => $contactLogs->count(),
            'by_type' => $contactLogs->groupBy('contact_type')->map->count(),
            'by_direction' => $contactLogs->groupBy('direction')->map->count(),
            'by_outcome' => $contactLogs->groupBy('outcome')->map->count(),
            'by_priority' => $contactLogs->groupBy('priority')->map->count(),
            'follow_ups_due' => $contactLogs->filter(function ($log) {
                return $this->isFollowUpDue($log);
            })->count(),
            'avg_duration' => round($contactLogs->whereNotNull('duration_minutes')->avg('duration_minutes'), 2),
            'total_duration' => $contactLogs->sum('duration_minutes'),
        ];
    }

    public function validateContactLogData(array $data, ?int $contactLogId = null): array
    {
        $rules = [
            'contactable_type' => 'required|string|in:App\\Models\\Supplier,App\\Models\\Customer',
            'contactable_id' => 'required|integer|min:1',
            'contact_type' => 'required|in:' . implode(',', array_keys(ContactLogConstants::CONTACT_TYPES)),
            'direction' => 'required|in:' . implode(',', array_keys(ContactLogConstants::DIRECTIONS)),
            'subject' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'outcome' => 'nullable|in:' . implode(',', array_keys(ContactLogConstants::OUTCOMES)),
            'contact_person_id' => 'nullable|exists:users,id',
            'external_contact_person' => 'nullable|string|max:255',
            'external_contact_email' => 'nullable|email|max:255',
            'external_contact_phone' => 'nullable|string|max:20',
            'contact_date' => 'required|date|before_or_equal:now',
            'duration_minutes' => 'nullable|integer|min:1|max:1440',
            'follow_up_date' => 'nullable|date|after:contact_date',
            'attachments' => 'nullable|array|max:10',
            'priority' => 'required|in:' . implode(',', array_keys(ContactLogConstants::PRIORITIES)),
            'tags' => 'nullable|array|max:20',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function validateContactable(string $type, int $id): void
    {
        $model = match($type) {
            'App\\Models\\Supplier' => Supplier::find($id),
            'App\\Models\\Customer' => Customer::find($id),
            default => null
        };

        if (!$model) {
            throw new ModelNotFoundException("Contact entity not found: {$type} with ID {$id}");
        }
    }

    public function getActivitySummary(string $contactableType, int $contactableId): array
    {
        $contactLogs = $this->contactLogRepository->getByContactable($contactableType, $contactableId);

        return [
            'total_contacts' => $contactLogs->count(),
            'last_contact' => $contactLogs->first()?->contact_date,
            'pending_follow_ups' => $contactLogs->filter(function ($log) {
                return $this->isFollowUpDue($log);
            })->count(),
            'most_common_type' => $contactLogs->groupBy('contact_type')->sortByDesc->count()->keys()->first(),
            'total_duration' => $contactLogs->sum('duration_minutes'),
        ];
    }

    public function markFollowUpCompleted(ContactLog $contactLog): void
    {
        $contactLog->update(['follow_up_date' => null]);
    }
}