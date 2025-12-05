<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Information
            'company_name' => 'required|string|max:255',
            'trade_name' => 'nullable|string|max:255',
            'supplier_type' => ['required', 'in:manufacturer,distributor,wholesaler,retailer,service_provider'],
            'status' => ['nullable', 'in:active,inactive,blacklisted,pending_approval'],
            
            // Contact Information
            'contact_person' => 'nullable|string|max:255',
            'contact_title' => 'nullable|string|max:255',
            'email' => 'nullable|email:rfc,dns|max:255|unique:suppliers,email,' . $this->route('supplier'),
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'fax' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            
            // Address Information
            'address_line_1' => 'required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'required|string|max:100',
            'state_province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            
            // Business Information
            'tax_id' => 'nullable|string|max:50',
            'registration_number' => 'nullable|string|max:100',
            'business_description' => 'nullable|string|max:1000',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            
            // Financial Information
            'payment_terms' => ['nullable', 'in:cod,net_15,net_30,net_45,net_60,net_90,prepaid'],
            'currency' => 'nullable|string|size:3',
            'credit_limit' => 'nullable|numeric|min:0|max:999999999.99',
            
            // Additional fields
            'minimum_order_value' => 'nullable|numeric|min:0',
            'tax_exempt' => 'boolean',
            'internal_notes' => 'nullable|string|max:2000',
            'special_instructions' => 'nullable|string|max:1000',
        ];
    }
}
