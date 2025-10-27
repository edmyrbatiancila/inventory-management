<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreStockTransferRequest extends FormRequest
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
            'from_warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,id',
                'different:to_warehouse_id'
            ],
            'to_warehouse_id' => [
                'required',
                'integer',
                'exists:warehouses,id',
                'different:from_warehouse_id'
            ],
            'product_id' => [
                'required',
                'integer',
                'exists:products,id'
            ],
            'quantity_transferred' => [
                'required',
                'integer',
                'min:1',
                'max:999999'
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'from_warehouse_id.different' => 'Source and destination warehouses must be different.',
            'to_warehouse_id.different' => 'Source and destination warehouses must be different.',
            'quantity_transferred.min' => 'Transfer quantity must be at least 1.',
        ];
    }
}
