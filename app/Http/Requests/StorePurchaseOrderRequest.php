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
            'purchase_order.supplier_name' => 'required|string|max:255',
            'purchase_order.supplier_email' => 'nullable|email|max:255',
            'purchase_order.supplier_phone' => 'nullable|string|max:50',
            'purchase_order.supplier_address' => 'nullable|string',
            'purchase_order.supplier_contact_person' => 'nullable|string|max:255',
            'purchase_order.warehouse_id' => 'required|exists:warehouses,id',
            'purchase_order.priority' => 'nullable|in:low,normal,high,urgent',
            'purchase_order.expected_delivery_date' => 'nullable|date|after:today',
            'purchase_order.notes' => 'nullable|string',
            'purchase_order.terms_and_conditions' => 'nullable|string',
            
            'items' => 'nullable|array|min:0',
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
            'purchase_order.supplier_name.required' => 'Supplier name is required',
            'purchase_order.warehouse_id.required' => 'Warehouse is required',
            'items.*.product_id.required' => 'Product is required for each item',
            'items.*.quantity_ordered.min' => 'Quantity must be at least 1',
            'items.*.unit_cost.min' => 'Unit cost cannot be negative',
        ];
    }
}
