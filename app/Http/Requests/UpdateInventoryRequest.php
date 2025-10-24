<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateInventoryRequest extends FormRequest
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
            'product_id' => 'required|integer|exists:products,id',
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'quantity_on_hand' => 'required|integer|min:0',
            'quantity_reserved' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required',
            'warehouse_id.required' => 'Warehouse is required',
            'quantity_on_hand.required' => 'Quantity on hand is required',
            'quantity_on_hand.min' => 'Quantity cannot be negative',
        ];
    }
}
