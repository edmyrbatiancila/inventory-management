<?php

namespace App\Http\Requests;

use App\Models\PurchaseOrder;
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
        $isDraft = $purchaseOrder && $purchaseOrder->status === 'draft';
        $canEditItems = $isDraft || ($purchaseOrder && $purchaseOrder->status === 'pending_approval');

        return [
            // Purchase Order fields - more restrictive based on status
            'po_number' => 'sometimes|string|unique:purchase_orders,po_number,' . $purchaseOrder->id,
            'supplier_name' => 'sometimes|required|string|max:255',
            'supplier_email' => 'sometimes|nullable|email|max:255',
            'supplier_phone' => 'sometimes|nullable|string|max:50',
            'supplier_address' => 'sometimes|nullable|string',
            'supplier_contact_person' => 'sometimes|nullable|string|max:255',
            'warehouse_id' => $canEditItems ? 'sometimes|required|exists:warehouses,id' : 'prohibited',
            'expected_delivery_date' => 'sometimes|nullable|date|after:today',
            'priority' => 'sometimes|in:' . implode(',', array_keys(PurchaseOrder::PRIORITIES)),
            'currency' => 'sometimes|nullable|string|size:3',
            'notes' => 'sometimes|nullable|string',
            'terms_and_conditions' => 'sometimes|nullable|string',

            // Items validation - only allow if in draft or pending approval
            'items' => $canEditItems ? 'sometimes|required|array|min:1' : 'prohibited',
            'items.*.product_id' => $canEditItems ? 'required|exists:products,id' : 'prohibited',
            'items.*.quantity_ordered' => $canEditItems ? 'required|integer|min:1' : 'prohibited',
            'items.*.unit_cost' => $canEditItems ? 'required|numeric|min:0' : 'prohibited',
            'items.*.discount_percentage' => $canEditItems ? 'nullable|numeric|min:0|max:100' : 'prohibited',
            'items.*.notes' => $canEditItems ? 'nullable|string' : 'prohibited',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_name.required' => 'Supplier name is required.',
            'warehouse_id.required' => 'Please select a warehouse.',
            'warehouse_id.prohibited' => 'Warehouse cannot be changed for orders in this status.',
            'items.required' => 'Purchase order must have at least one item.',
            'items.min' => 'Purchase order must have at least one item.',
            'items.prohibited' => 'Items cannot be modified for orders in this status.',
            'items.*.product_id.required' => 'Product is required for each item.',
            'items.*.quantity_ordered.required' => 'Quantity is required for each item.',
            'items.*.quantity_ordered.min' => 'Quantity must be at least 1.',
            'items.*.unit_cost.required' => 'Unit cost is required for each item.',
        ];
    }
}
