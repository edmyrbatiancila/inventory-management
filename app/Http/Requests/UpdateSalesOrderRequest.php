<?php

namespace App\Http\Requests;

use App\Models\SalesOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSalesOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('salesOrder'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $salesOrder = $this->route('salesOrder');
        $isDraft = $salesOrder && $salesOrder->status === 'draft';
        $isPendingApproval = $salesOrder && $salesOrder->status === 'pending_approval';
        $canEditItems = $isDraft || $isPendingApproval;
        $canEditBasicInfo = in_array($salesOrder?->status, ['draft', 'pending_approval', 'approved']);

        return array_merge(
            $this->getOrderRules($salesOrder, $canEditBasicInfo),
            $this->getCustomerRules($canEditBasicInfo),
            $this->getItemRules($canEditItems),
            $this->getFinancialRules($isDraft)
        );
    }

    protected function getOrderRules($salesOrder, bool $canEditBasicInfo): array
    {
        return [
            'so_number' => [
                'sometimes', 'string', 'max:50',
                Rule::unique('sales_orders')->ignore($salesOrder?->id)
            ],
            'customer_reference' => $canEditBasicInfo ? ['sometimes', 'nullable', 'string', 'max:255'] : ['prohibited'],
            'warehouse_id' => $canEditBasicInfo ? ['sometimes', 'required', 'exists:warehouses,id'] : ['prohibited'],
            'requested_delivery_date' => ['sometimes', 'nullable', 'date', 'after:today'],
            'promised_delivery_date' => ['sometimes', 'nullable', 'date', 'after:today'],
            'status' => ['sometimes', Rule::in(array_keys(SalesOrder::STATUSES))],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'payment_status' => ['sometimes', Rule::in(array_keys(SalesOrder::PAYMENT_STATUSES))],
            'shipping_address' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'shipping_method' => ['sometimes', 'nullable', 'string', 'max:100'],
            'tracking_number' => ['sometimes', 'nullable', 'string', 'max:100'],
            'carrier' => ['sometimes', 'nullable', 'string', 'max:100'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'customer_notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'terms_and_conditions' => ['sometimes', 'nullable', 'string'],
            'cancellation_reason' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }

    protected function getCustomerRules(bool $canEditBasicInfo): array
    {
        $baseRule = $canEditBasicInfo ? 'sometimes' : 'prohibited';
        
        return [
            'customer_name' => [$baseRule, 'required', 'string', 'max:255'],
            'customer_email' => [$baseRule, 'nullable', 'email', 'max:255'],
            'customer_phone' => [$baseRule, 'nullable', 'string', 'max:50'],
            'customer_address' => [$baseRule, 'nullable', 'string', 'max:1000'],
            'customer_contact_person' => [$baseRule, 'nullable', 'string', 'max:255'],
        ];
    }

    protected function getFinancialRules(bool $isDraft): array
    {
        $baseRule = $isDraft ? 'sometimes' : 'prohibited';
        
        return [
            'tax_rate' => [$baseRule, 'nullable', 'numeric', 'between:0,1'],
            'shipping_cost' => [$baseRule, 'nullable', 'numeric', 'min:0'],
            'discount_amount' => [$baseRule, 'nullable', 'numeric', 'min:0'],
            'currency' => [$baseRule, 'nullable', 'string', 'size:3'],
            'payment_terms' => [$baseRule, 'nullable', 'string', 'max:255'],
        ];
    }

    protected function getItemRules(bool $canEditItems): array
    {
        $baseRule = $canEditItems ? 'sometimes' : 'prohibited';
        
        return [
            'items' => [$baseRule, 'array', 'min:1'],
            'items.*.product_id' => [$baseRule, 'required', 'exists:products,id'],
            'items.*.quantity_ordered' => [$baseRule, 'required', 'integer', 'min:1'],
            'items.*.unit_price' => [$baseRule, 'required', 'numeric', 'min:0.01'],
            'items.*.discount_percentage' => [$baseRule, 'nullable', 'numeric', 'between:0,100'],
            'items.*.notes' => [$baseRule, 'nullable', 'string', 'max:500'],
            'items.*.customer_notes' => [$baseRule, 'nullable', 'string', 'max:500'],
            'items.*.requested_delivery_date' => [$baseRule, 'nullable', 'date', 'after:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Customer name is required.',
            'customer_name.prohibited' => 'Customer information cannot be changed for orders in this status.',
            'warehouse_id.required' => 'Please select a warehouse.',
            'warehouse_id.prohibited' => 'Warehouse cannot be changed for orders in this status.',
            'items.required' => 'Sales order must have at least one item.',
            'items.min' => 'Sales order must have at least one item.',
            'items.prohibited' => 'Items cannot be modified for orders in this status.',
            'items.*.product_id.required' => 'Product is required for each item.',
            'items.*.quantity_ordered.required' => 'Quantity is required for each item.',
            'items.*.quantity_ordered.min' => 'Quantity must be at least 1.',
            'items.*.unit_price.required' => 'Unit price is required for each item.',
            'tax_rate.between' => 'Tax rate must be between 0% and 100%.',
            'tax_rate.prohibited' => 'Financial details cannot be changed for orders in this status.',
        ];
    }

    public function attributes(): array
    {
        return [
            'so_number' => 'sales order number',
            'customer_reference' => 'customer reference',
            'warehouse_id' => 'warehouse',
            'requested_delivery_date' => 'requested delivery date',
            'promised_delivery_date' => 'promised delivery date',
            'shipping_cost' => 'shipping cost',
            'discount_amount' => 'discount amount',
            'tracking_number' => 'tracking number',
            'items.*.product_id' => 'product',
            'items.*.quantity_ordered' => 'quantity',
            'items.*.unit_price' => 'unit price',
            'items.*.discount_percentage' => 'discount percentage',
        ];
    }
}
