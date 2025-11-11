<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StockMovementAdvancedSearch extends FormRequest
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
            'referenceNumber' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'productName' => 'nullable|string|max:255',
            'productSku' => 'nullable|string|max:100',
            'warehouseName' => 'nullable|string|max:255',
            'userName' => 'nullable|string|max:255',

            // Movement Type Filters
            'movementTypes' => 'nullable|array',
            'movementTypes.*' => 'in:adjustment_increase,adjustment_decrease,transfer_in,transfer_out,purchase_receive,sale_fulfill,return_customer,return_supplier,damage_write_off,expiry_write_off',

            // Status Filters
            'statuses' => 'nullable|array',
            'statuses.*' => 'in:pending,approved,rejected,applied',

            // Related Entity Filters
            'productIds' => 'nullable|array',
            'productIds.*' => 'integer|exists:products,id',
            'warehouseIds' => 'nullable|array',
            'warehouseIds.*' => 'integer|exists:warehouses,id',
            'userIds' => 'nullable|array',
            'userIds.*' => 'integer|exists:users,id',

            // Quantity Filters
            'quantityMovedMin' => 'nullable|integer|min:0',
            'quantityMovedMax' => 'nullable|integer|min:0',
            'quantityBeforeMin' => 'nullable|integer|min:0',
            'quantityBeforeMax' => 'nullable|integer|min:0',
            'quantityAfterMin' => 'nullable|integer|min:0',
            'quantityAfterMax' => 'nullable|integer|min:0',

            // Value Filters
            'unitCostMin' => 'nullable|numeric|min:0',
            'unitCostMax' => 'nullable|numeric|min:0',
            'totalValueMin' => 'nullable|numeric|min:0',
            'totalValueMax' => 'nullable|numeric|min:0',

            // Date Filters
            'createdAfter' => 'nullable|date',
            'createdBefore' => 'nullable|date',
            'approvedAfter' => 'nullable|date',
            'approvedBefore' => 'nullable|date',

            // Movement Direction Filters
            'movementDirection' => 'nullable|in:increase,decrease,all',

            // Document Reference Filters
            'relatedDocumentTypes' => 'nullable|array',
            'relatedDocumentTypes.*' => 'in:adjustment,transfer,purchase_order,sale_order,return',

            // Quick Filters
            'myMovements' => 'nullable|boolean',
            'recentMovements' => 'nullable|boolean',
            'pendingApproval' => 'nullable|boolean',
            'highValueMovements' => 'nullable|boolean',
            'hasApprover' => 'nullable|boolean',
            'hasDocumentReference' => 'nullable|boolean',

            // Sorting and Pagination
            'sort' => 'nullable|string|in:newest,oldest,quantity_high,quantity_low,value_high,value_low,reference_number,movement_type,status',
            'per_page' => 'nullable|integer|min:5|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'globalSearch.max' => 'Search term must not exceed 255 characters.',
            'quantityMovedMin.min' => 'Minimum quantity moved must be at least 0.',
            'quantityMovedMax.min' => 'Maximum quantity moved must be at least 0.',
            'unitCostMin.min' => 'Minimum unit cost must be at least 0.',
            'unitCostMax.min' => 'Maximum unit cost must be at least 0.',
            'totalValueMin.min' => 'Minimum total value must be at least 0.',
            'totalValueMax.min' => 'Maximum total value must be at least 0.',
            'per_page.min' => 'Items per page must be at least 5.',
            'per_page.max' => 'Items per page cannot exceed 100.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string boolean values to actual booleans
        $booleanFields = [
            'myMovements', 'recentMovements', 'pendingApproval', 
            'highValueMovements', 'hasApprover', 'hasDocumentReference'
        ];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                $this->merge([$field => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)]);
            }
        }

        // Convert numeric string values to integers/floats
        $numericFields = [
            'quantityMovedMin', 'quantityMovedMax', 'quantityBeforeMin', 'quantityBeforeMax',
            'quantityAfterMin', 'quantityAfterMax', 'unitCostMin', 'unitCostMax',
            'totalValueMin', 'totalValueMax', 'per_page'
        ];
        
        foreach ($numericFields as $field) {
            if ($this->has($field) && $this->input($field) !== null && $this->input($field) !== '') {
                $value = $this->input($field);
                $this->merge([$field => is_numeric($value) ? (strpos($value, '.') !== false ? (float)$value : (int)$value) : null]);
            }
        }

        // Set defaults
        if (!$this->has('sort') || empty($this->input('sort'))) {
            $this->merge(['sort' => 'newest']);
        }

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
            // Validate quantity ranges
            if ($this->quantityMovedMin && $this->quantityMovedMax && $this->quantityMovedMin > $this->quantityMovedMax) {
                $validator->errors()->add('quantityMovedMax', 'Maximum quantity moved must be greater than minimum.');
            }

            if ($this->unitCostMin && $this->unitCostMax && $this->unitCostMin > $this->unitCostMax) {
                $validator->errors()->add('unitCostMax', 'Maximum unit cost must be greater than minimum.');
            }

            if ($this->totalValueMin && $this->totalValueMax && $this->totalValueMin > $this->totalValueMax) {
                $validator->errors()->add('totalValueMax', 'Maximum total value must be greater than minimum.');
            }
        });
    }
}
