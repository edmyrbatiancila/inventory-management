<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('purchaseOrder'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $purchaseOrder = $this->route('purchaseOrder');
        $isDraft = $purchaseOrder->status === 'draft';

        return [
            'supplier_name' => $isDraft ? 'sometimes|string|max:255' : 'sometimes|string|max:255',
            'supplier_email' => 'sometimes|nullable|email|max:255',
            'supplier_phone' => 'sometimes|nullable|string|max:50',
            'supplier_address' => 'sometimes|nullable|string',
            'supplier_contact_person' => 'sometimes|nullable|string|max:255',
            'warehouse_id' => $isDraft ? 'sometimes|exists:warehouses,id' : 'prohibited',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'expected_delivery_date' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string',
            'terms_and_conditions' => 'sometimes|nullable|string',
        ];
    }
}
