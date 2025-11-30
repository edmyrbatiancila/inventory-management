<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\CommonValidationRules;
use App\Models\SalesOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSalesOrderRequest extends FormRequest
{
    // use CommonValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', SalesOrder::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(
            $this->orderRules(),
            $this->customerRules(), 
            $this->itemRules(),
            $this->financialRules()
        );
    }

    protected function orderRules(): array
    {
        return [
            'so_number' => ['nullable', 'string', 'max:50', Rule::unique('sales_orders')],
            'customer_reference' => ['nullable', 'string', 'max:255'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'requested_delivery_date' => ['nullable', 'date', 'after:today'],
            'promised_delivery_date' => ['nullable', 'date', 'after:today'],
            'status' => ['sometimes', Rule::in(array_keys(SalesOrder::STATUSES))],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'payment_status' => ['nullable', Rule::in(array_keys(SalesOrder::PAYMENT_STATUSES))],
            'shipping_address' => ['nullable', 'string', 'max:1000'],
            'shipping_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
            'terms_and_conditions' => ['nullable', 'string'],
        ];
    }

    protected function customerRules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_address' => ['nullable', 'string', 'max:1000'],
            'customer_contact_person' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function financialRules(): array
    {
        return [
            'tax_rate' => ['nullable', 'numeric', 'between:0,100'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function itemRules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity_ordered' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount_percentage' => ['nullable', 'numeric', 'between:0,100'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
            'items.*.customer_notes' => ['nullable', 'string', 'max:500'],
            'items.*.requested_delivery_date' => ['nullable', 'date', 'after:today'],
        ];
    }

    protected function warehouseRules(): array
    {
        return ['required', 'integer', 'exists:warehouses,id'];
    }

    protected function priceRules($min = 0, $required = true): array
    {
        $rules = $required ? ['required'] : ['nullable'];
        $rules[] = 'numeric';
        $rules[] = "min:$min";
        return $rules;
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Customer name is required.',
            'warehouse_id.required' => 'Please select a warehouse.',
            'items.required' => 'Sales order must have at least one item.',
            'items.min' => 'Sales order must have at least one item.',
            'items.*.product_id.required' => 'Product is required for each item.',
            'items.*.quantity_ordered.required' => 'Quantity is required for each item.',
            'items.*.quantity_ordered.min' => 'Quantity must be at least 1.',
            'items.*.unit_price.required' => 'Unit price is required for each item.',
            'tax_rate.between' => 'Tax rate must be between 0% and 100%.',
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
            'items.*.product_id' => 'product',
            'items.*.quantity_ordered' => 'quantity',
            'items.*.unit_price' => 'unit price',
            'items.*.discount_percentage' => 'discount percentage',
        ];
    }
}
