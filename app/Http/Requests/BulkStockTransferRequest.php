<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BulkStockTransferRequest extends FormRequest
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
            'transfer_ids' => 'required|array|min:1|max:50',
            'transfer_ids.*' => 'required|integer|exists:stock_transfers,id',
            'action' => 'required|string|in:approve,cancel',
            'cancellation_reason' => 'required_if:action,cancel|nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'transfer_ids.required' => 'Please select at least one transfer to process.',
            'transfer_ids.max' => 'You can only process up to 50 transfers at once.',
            'cancellation_reason.required_if' => 'Cancellation reason is required when cancelling transfers.',
        ];
    }
}
