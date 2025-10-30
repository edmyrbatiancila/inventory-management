<?php

namespace App\Http\Requests;

use App\Models\StockTransfer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateStockTransferRequest extends FormRequest
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
        $transfer = $this->route('stockTransfer');

        return [
            // Core details (only for pending transfers)
            'from_warehouse_id' => [
                'sometimes',
                'integer',
                'exists:warehouses,id',
                'different:to_warehouse_id',
                Rule::requiredIf($transfer->transfer_status === 'pending')
            ],
            'to_warehouse_id' => [
                'sometimes', 
                'integer',
                'exists:warehouses,id',
                'different:from_warehouse_id',
                Rule::requiredIf($transfer->transfer_status === 'pending')
            ],
            'product_id' => [
                'sometimes',
                'integer', 
                'exists:products,id',
                Rule::requiredIf($transfer->transfer_status === 'pending')
            ],
            'quantity_transferred' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::requiredIf($transfer->transfer_status === 'pending')
            ],

            'transfer_status' => [
                'sometimes',
                'string',
                Rule::in(StockTransfer::STATUSES)
            ],
            'notes' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000'
            ],
            'cancellation_reason' => [
                'required_if:transfer_status,cancelled',
                'nullable',
                'string',
                'max:500'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'transfer_status.in' => 'Invalid transfer status.',
            'cancellation_reason.required_if' => 'Cancellation reason is required when cancelling a transfer.',
        ];
    }
}
