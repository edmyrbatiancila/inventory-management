<?php

namespace App\Http\Requests;

use App\Models\PurchaseOrder;
use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', PurchaseOrder::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Purchase Order fields
            'po_number' => 'nullable|string|unique:purchase_orders,po_number',
            'supplier_name' => 'required|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_address' => 'nullable|string',
            'supplier_contact_person' => 'nullable|string|max:255',
            'warehouse_id' => 'required|exists:warehouses,id',
            'expected_delivery_date' => 'nullable|date|after:today',
            'priority' => 'nullable|in:' . implode(',', array_keys(PurchaseOrder::PRIORITIES)),
            'currency' => 'nullable|string|size:3',
            'notes' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',

            // Items validation
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_name.required' => 'Supplier name is required.',
            'warehouse_id.required' => 'Please select a warehouse.',
            'items.required' => 'Purchase order must have at least one item.',
            'items.min' => 'Purchase order must have at least one item.',
            'items.*.product_id.required' => 'Product is required for each item.',
            'items.*.quantity_ordered.required' => 'Quantity is required for each item.',
            'items.*.quantity_ordered.min' => 'Quantity must be at least 1.',
            'items.*.unit_cost.required' => 'Unit cost is required for each item.',
        ];
    }
}
