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
        return [
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
