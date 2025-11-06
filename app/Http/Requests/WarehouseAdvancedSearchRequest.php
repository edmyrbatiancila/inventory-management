<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class WarehouseAdvancedSearchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Text Search Filters
            'globalSearch' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postalCode' => 'nullable|string|max:20',

            // Contact Filters
            'contactPerson' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',

            // Capacity & Storage Filters
            'capacityMin' => 'nullable|integer|min:0',
            'capacityMax' => 'nullable|integer|min:0|gte:capacityMin',

            // Status Filters
            'isActive' => 'nullable|boolean',
            'isMain' => 'nullable|boolean',

            // Date Filters
            'createdAfter' => 'nullable|date',
            'createdBefore' => 'nullable|date|after_or_equal:createdAfter',
            'updatedAfter' => 'nullable|date',
            'updatedBefore' => 'nullable|date|after_or_equal:updatedAfter',

            // Location & Zone Filters
            'hasZones' => 'nullable|boolean',
            'zoneCount' => 'nullable|integer|min:0',

            // Quick Filters
            'myWarehouses' => 'nullable|boolean',
            'recentlyUpdated' => 'nullable|boolean',
            'newWarehouses' => 'nullable|boolean',
            'largeWarehouses' => 'nullable|boolean',

            // Pagination & Sorting
            'sort' => 'nullable|string|in:newest,oldest,name_asc,name_desc,code_asc,code_desc,city_asc,city_desc',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'globalSearch.max' => 'Search term cannot exceed 255 characters.',
            'name.max' => 'Warehouse name filter cannot exceed 255 characters.',
            'code.max' => 'Warehouse code filter cannot exceed 50 characters.',
            'email.email' => 'Please provide a valid email address format.',
            'capacityMin.min' => 'Minimum capacity must be greater than or equal to 0.',
            'capacityMax.min' => 'Maximum capacity must be greater than or equal to 0.',
            'capacityMax.gte' => 'Maximum capacity must be greater than or equal to minimum capacity.',
            'createdBefore.after_or_equal' => 'Created before date must be after or equal to created after date.',
            'updatedBefore.after_or_equal' => 'Updated before date must be after or equal to updated after date.',
            'per_page.min' => 'Per page value must be at least 1.',
            'per_page.max' => 'Per page value cannot exceed 100.',
            'sort.in' => 'Invalid sort option selected.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string boolean values to actual booleans
        $booleanFields = [
            'isActive', 'isMain', 'hasZones', 'myWarehouses', 
            'recentlyUpdated', 'newWarehouses', 'largeWarehouses'
        ];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $this->merge([
                    $field => $this->boolean($field)
                ]);
            }
        }

        // Convert numeric string values to integers
        $numericFields = ['capacityMin', 'capacityMax', 'zoneCount', 'per_page'];
        
        foreach ($numericFields as $field) {
            if ($this->has($field) && $this->input($field) !== null && $this->input($field) !== '') {
                $this->merge([
                    $field => (int) $this->input($field)
                ]);
            }
        }

        // Set default sorting if not provided
        if (!$this->has('sort') || empty($this->input('sort'))) {
            $this->merge(['sort' => 'newest']);
        }

        // Set default per_page if not provided
        if (!$this->has('per_page') || empty($this->input('per_page'))) {
            $this->merge(['per_page' => 15]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Custom validation logic can be added here
            // For example, checking if at least one filter is provided
            $hasFilters = false;
            $filterFields = [
                'globalSearch', 'name', 'code', 'address', 'city', 'state', 
                'country', 'postalCode', 'phone', 'email', 'isActive', 
                'isMain', 'createdAfter', 'createdBefore', 'updatedAfter', 
                'updatedBefore', 'hasZones', 'myWarehouses', 'recentlyUpdated', 
                'newWarehouses', 'largeWarehouses'
            ];

            foreach ($filterFields as $field) {
                if ($this->filled($field)) {
                    $hasFilters = true;
                    break;
                }
            }

            if (!$hasFilters) {
                $validator->errors()->add('filters', 'At least one search filter must be provided.');
            }
        });
    }
}
