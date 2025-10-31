<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('id');

        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0.01',
            'cost_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|max:255' . $productId,
            'barcode' => 'nullable|string|max:255' . $productId,
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $productId,
            'min_stock_level' => 'nullable|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0|gt:min_stock_level',
            'images' => 'nullable|array',
            'images.*' => 'string|max:500',
            'specifications' => 'nullable|array',
            'is_active' => 'boolean',
            'track_quantity' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'max_stock_level.gt' => 'Maximum stock level must be greater than minimum stock level.',
            'price.min' => 'Price must be greater than 0.',
            'sku.unique' => 'This SKU is already in use.',
            'barcode.unique' => 'This barcode is already in use.',
        ];
    }
}
