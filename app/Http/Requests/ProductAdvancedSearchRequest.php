<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ProductAdvancedSearchRequest extends FormRequest
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
            'global_search' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:255',

            // Category & Brand Filters
            'categories' => 'nullable|string', // comma-separated category IDs
            'brands' => 'nullable|string', // comma-separated brand IDs

            // Price Range Filters
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0|gte:price_min',
            'cost_price_min' => 'nullable|numeric|min:0',
            'cost_price_max' => 'nullable|numeric|min:0|gte:cost_price_min',

            // Stock Level Filters
            'min_stock_min' => 'nullable|integer|min:0',
            'min_stock_max' => 'nullable|integer|min:0|gte:min_stock_min',
            'max_stock_min' => 'nullable|integer|min:0',
            'max_stock_max' => 'nullable|integer|min:0|gte:max_stock_min',

            // Status Filters
            'is_active' => 'nullable|boolean',
            'track_quantity' => 'nullable|boolean',

            // Date Filters
            'created_after' => 'nullable|date',
            'created_before' => 'nullable|date|after_or_equal:created_after',
            'updated_after' => 'nullable|date',
            'updated_before' => 'nullable|date|after_or_equal:updated_after',

            // Stock Status Filters
            'has_inventory' => 'nullable|boolean',
            'is_low_stock' => 'nullable|boolean',
            'is_out_of_stock' => 'nullable|boolean',
            'is_overstock' => 'nullable|boolean',

            // Quick Filters
            'recently_updated' => 'nullable|boolean',
            'new_products' => 'nullable|boolean',
            'expensive_products' => 'nullable|boolean',

            // Pagination & Sorting
            'per_page' => 'nullable|integer|min:10|max:100',
            'sort' => 'nullable|string|in:newest,oldest,name_asc,name_desc,price_asc,price_desc,updated',
        ];
    }

    /**
     * Get the validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'price_max.gte' => 'Maximum price must be greater than or equal to minimum price.',
            'cost_price_max.gte' => 'Maximum cost price must be greater than or equal to minimum cost price.',
            'min_stock_max.gte' => 'Maximum minimum stock must be greater than or equal to minimum minimum stock.',
            'max_stock_max.gte' => 'Maximum maximum stock must be greater than or equal to minimum maximum stock.',
            'created_before.after_or_equal' => 'Created before date must be after or equal to created after date.',
            'updated_before.after_or_equal' => 'Updated before date must be after or equal to updated after date.',
            'per_page.min' => 'Per page must be at least 10.',
            'per_page.max' => 'Per page cannot exceed 100.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string 'true'/'false' to boolean for boolean fields
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        if ($this->has('track_quantity')) {
            $this->merge([
                'track_quantity' => filter_var($this->track_quantity, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        if ($this->has('has_inventory')) {
            $this->merge([
                'has_inventory' => filter_var($this->has_inventory, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        if ($this->has('is_low_stock')) {
            $this->merge([
                'is_low_stock' => filter_var($this->is_low_stock, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        if ($this->has('recently_updated')) {
            $this->merge([
                'recently_updated' => filter_var($this->recently_updated, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }
    }

    /**
     * Get validated and processed filters
     */
    public function getFilters(): array
    {
        $validated = $this->validated();
        
        // Convert comma-separated strings to arrays
        if (!empty($validated['categories'])) {
            $validated['categories'] = array_filter(
                array_map('intval', explode(',', $validated['categories']))
            );
        }

        if (!empty($validated['brands'])) {
            $validated['brands'] = array_filter(
                array_map('intval', explode(',', $validated['brands']))
            );
        }

        return $validated;
    }
}
