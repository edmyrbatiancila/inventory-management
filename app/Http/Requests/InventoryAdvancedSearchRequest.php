<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class InventoryAdvancedSearchRequest extends FormRequest
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
            'productName' => 'nullable|string|max:255',
            'productSku' => 'nullable|string|max:100',
            'warehouseName' => 'nullable|string|max:255',
            'warehouseCode' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:500',

            // Product Filters
            'productIds' => 'nullable|array',
            'productIds.*' => 'integer|exists:products,id',
            'categoryIds' => 'nullable|array',
            'categoryIds.*' => 'integer|exists:categories,id',
            'brandIds' => 'nullable|array',
            'brandIds.*' => 'integer|exists:brands,id',

            // Warehouse Filters
            'warehouseIds' => 'nullable|array',
            'warehouseIds.*' => 'integer|exists:warehouses,id',
            'warehouseIsActive' => 'nullable|boolean',

            // Quantity Filters
            'quantityOnHandMin' => 'nullable|integer|min:0',
            'quantityOnHandMax' => 'nullable|integer|min:0',
            'quantityReservedMin' => 'nullable|integer|min:0',
            'quantityReservedMax' => 'nullable|integer|min:0',
            'quantityAvailableMin' => 'nullable|integer|min:0',
            'quantityAvailableMax' => 'nullable|integer|min:0',

            // Stock Status Filters
            'stockStatus' => 'nullable|array',
            'stockStatus.*' => 'in:healthy,low,critical,out_of_stock',
            'isLowStock' => 'nullable|boolean',
            'isOutOfStock' => 'nullable|boolean',
            'hasReservedStock' => 'nullable|boolean',

            // Date Filters
            'createdAfter' => 'nullable|date',
            'createdBefore' => 'nullable|date',
            'updatedAfter' => 'nullable|date',
            'updatedBefore' => 'nullable|date',

            // Value Filters
            'stockValueMin' => 'nullable|numeric|min:0',
            'stockValueMax' => 'nullable|numeric|min:0',

            // Quick Filters
            'myInventories' => 'nullable|boolean',
            'recentlyUpdated' => 'nullable|boolean',
            'newInventories' => 'nullable|boolean',
            'highValueInventories' => 'nullable|boolean',

            // Sorting and Pagination
            'sort' => 'nullable|string|in:newest,oldest,quantity_high,quantity_low,value_high,value_low,product_name,warehouse_name,stock_status',
            'per_page' => 'nullable|integer|min:5|max:100',
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
            'globalSearch.max' => 'Search term must not exceed 255 characters.',
            'quantityOnHandMin.min' => 'Minimum quantity on hand must be at least 0.',
            'quantityOnHandMax.min' => 'Maximum quantity on hand must be at least 0.',
            'stockValueMin.min' => 'Minimum stock value must be at least 0.',
            'stockValueMax.min' => 'Maximum stock value must be at least 0.',
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
            'warehouseIsActive', 'isLowStock', 'isOutOfStock', 'hasReservedStock',
            'myInventories', 'recentlyUpdated', 'newInventories', 'highValueInventories'
        ];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                $this->merge([$field => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)]);
            }
        }

        // Convert numeric string values to integers/floats
        $numericFields = ['quantityOnHandMin', 'quantityOnHandMax', 'quantityReservedMin', 'quantityReservedMax', 
                            'quantityAvailableMin', 'quantityAvailableMax', 'stockValueMin', 'stockValueMax', 'per_page'
                        ];
        
        foreach ($numericFields as $field) {
            if ($this->has($field) && $this->input($field) !== null && $this->input($field) !== '') {
                $value = $this->input($field);
                $this->merge([$field => is_numeric($value) ? (strpos($value, '.') !== false ? (float)$value : (int)$value) : null]);
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
            // Validate quantity ranges
            if ($this->quantityOnHandMin && $this->quantityOnHandMax && $this->quantityOnHandMin > $this->quantityOnHandMax) {
                $validator->errors()->add('quantityOnHandMax', 'Maximum quantity on hand must be greater than minimum.');
            }

            if ($this->stockValueMin && $this->stockValueMax && $this->stockValueMin > $this->stockValueMax) {
                $validator->errors()->add('stockValueMax', 'Maximum stock value must be greater than minimum.');
            }
        });
    }
}
