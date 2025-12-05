<?php

namespace App\Http\Requests;

use App\Constants\ContactLogConstants;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactLogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Polymorphic relationship
            'contactable_type' => 'required|string|in:App\\Models\\Supplier,App\\Models\\Customer',
            'contactable_id' => 'required|integer|min:1',
            
            // Contact Information
            'contact_type' => ['required', Rule::in(array_keys(ContactLogConstants::CONTACT_TYPES))],
            'direction' => ['required', Rule::in(array_keys(ContactLogConstants::DIRECTIONS))],
            'subject' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'outcome' => ['nullable', Rule::in(array_keys(ContactLogConstants::OUTCOMES))],
            
            // Participants
            'contact_person_id' => 'nullable|exists:users,id',
            'external_contact_person' => 'nullable|string|max:255',
            'external_contact_email' => 'nullable|email|max:255',
            'external_contact_phone' => 'nullable|string|max:20',
            
            // Timing
            'contact_date' => 'required|date|before_or_equal:now',
            'duration_minutes' => 'nullable|integer|min:1|max:1440', // Max 24 hours
            'follow_up_date' => 'nullable|date|after:now',

            // Additional Information
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'string|max:255', // File paths or URLs
            'priority' => ['required', Rule::in(array_keys(ContactLogConstants::PRIORITIES))],
            'tags' => 'nullable|array|max:20',
            'tags.*' => 'string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'contactable_type.required' => 'Please select the contact type.',
            'contactable_id.required' => 'Please select the contact entity.',
            'contact_type.required' => 'Contact method is required.',
            'direction.required' => 'Contact direction is required.',
            'subject.required' => 'Subject is required.',
            'description.required' => 'Description is required.',
            'description.min' => 'Description must be at least 10 characters.',
            'contact_date.required' => 'Contact date is required.',
            'contact_date.before_or_equal' => 'Contact date cannot be in the future.',
            'follow_up_date.after' => 'Follow-up date must be in the future.',
            'duration_minutes.max' => 'Duration cannot exceed 24 hours.',
            'external_contact_email.email' => 'Please provide a valid email address.',
        ];
    }

    public function attributes(): array
    {
        return [
            'contactable_type' => 'contact type',
            'contactable_id' => 'contact entity',
            'contact_type' => 'contact method',
            'external_contact_person' => 'external contact person',
            'external_contact_email' => 'external contact email',
            'external_contact_phone' => 'external contact phone',
            'duration_minutes' => 'duration',
            'follow_up_date' => 'follow-up date',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Clean phone number
        if ($this->external_contact_phone) {
            $this->merge([
                'external_contact_phone' => preg_replace('/[^\d+\-\(\)\s]/', '', $this->external_contact_phone)
            ]);
        }

        // Normalize email
        if ($this->external_contact_email) {
            $this->merge([
                'external_contact_email' => strtolower(trim($this->external_contact_email))
            ]);
        }

        // Set default priority
        if (!$this->priority) {
            $this->merge(['priority' => 'normal']);
        }
    }
}
