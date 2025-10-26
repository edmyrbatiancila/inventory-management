<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreStockAdjustmentRequest extends FormRequest
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
            'inventory_id' => 'required|exists:inventories,id',
            'adjustment_type' => 'required|in:increase,decrease',
            'quantity_adjusted' => 'required|integer|min:1',
            'reason' => 'required|string|in:damage,theft,found,expired,returned,transfer_in,transfer_out,correction,recount,other',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'inventory_id.required' => 'Please select an inventory item.',
            'inventory_id.exists' => 'The selected inventory item does not exist.',
            'adjustment_type.required' => 'Please select adjustment type (increase or decrease).',
            'adjustment_type.in' => 'Adjustment type must be either increase or decrease.',
            'quantity_adjusted.required' => 'Please enter the quantity to adjust.',
            'quantity_adjusted.integer' => 'Quantity must be a whole number.',
            'quantity_adjusted.min' => 'Quantity must be at least 1.',
            'reason.required' => 'Please select a reason for the adjustment.',
            'reason.in' => 'Please select a valid reason for the adjustment.',
            'notes.max' => 'Notes cannot be longer than 1000 characters.',
        ];
    }
}
