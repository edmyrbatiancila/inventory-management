<?php

namespace App\Http\Requests;

use App\Constants\SupplierConstants;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
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
            'supplier_type' => ['required', Rule::in(array_keys(SupplierConstants::SUPPLIER_TYPES))],
            'status' => ['nullable', Rule::in(array_keys(SupplierConstants::STATUSES))],
            
            // Contact Information
            'contact_person' => 'nullable|string|max:255',
            'contact_title' => 'nullable|string|max:255',
            'email' => 'nullable|email:rfc,dns|max:255|unique:suppliers,email',
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
            'payment_terms' => ['nullable', Rule::in(array_keys(SupplierConstants::PAYMENT_TERMS))],
            'currency' => 'nullable|string|size:3|in:USD,EUR,GBP,JPY,CAD,AUD',
            'credit_limit' => 'nullable|numeric|min:0|max:999999999.99',
            'payment_method' => ['nullable', Rule::in(array_keys(SupplierConstants::PAYMENT_METHODS))],
            
            // Banking Information
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_routing_number' => 'nullable|string|max:20',
            
            // Lead Times
            'standard_lead_time' => 'nullable|integer|min:0|max:365',
            'rush_order_lead_time' => 'nullable|integer|min:0|max:365',
            'minimum_order_value' => 'nullable|numeric|min:0',
            
            // Compliance
            'tax_exempt' => 'boolean',
            'required_documents' => 'nullable|array',
            'insurance_expiry' => 'nullable|date|after:today',

            // Categories and Methods
            'shipping_methods' => 'nullable|array',
            'product_categories' => 'nullable|array',
            'tags' => 'nullable|array',
            
            // Notes
            'internal_notes' => 'nullable|string|max:2000',
            'special_instructions' => 'nullable|string|max:1000',
            
            // Contract Information
            'contract_type' => ['nullable', Rule::in(array_keys(SupplierConstants::CONTRACT_TYPES))],
            'contract_start_date' => 'nullable|date',
            'contract_end_date' => 'nullable|date|after:contract_start_date',
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'Company name is required.',
            'supplier_type.required' => 'Supplier type is required.',
            'supplier_type.in' => 'Please select a valid supplier type.',
            'email.unique' => 'This email is already registered for another supplier.',
            'email.email' => 'Please enter a valid email address.',
            'address_line_1.required' => 'Address is required.',
            'city.required' => 'City is required.',
            'country.required' => 'Country is required.',
            'established_year.max' => 'Established year cannot be in the future.',
            'credit_limit.numeric' => 'Credit limit must be a valid number.',
            'website.url' => 'Please enter a valid website URL.',
            'insurance_expiry.after' => 'Insurance expiry date must be in the future.',
            'contract_end_date.after' => 'Contract end date must be after start date.',
        ];
    }

    public function attributes(): array
    {
        return [
            'company_name' => 'company name',
            'supplier_type' => 'supplier type',
            'address_line_1' => 'address',
            'payment_terms' => 'payment terms',
            'credit_limit' => 'credit limit',
            'minimum_order_value' => 'minimum order value',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize phone numbers
        if ($this->phone) {
            $this->merge(['phone' => preg_replace('/[^0-9+\-\(\)\s]/', '', $this->phone)]);
        }
        
        if ($this->mobile) {
            $this->merge(['mobile' => preg_replace('/[^0-9+\-\(\)\s]/', '', $this->mobile)]);
        }
        
        // Normalize email
        if ($this->email) {
            $this->merge(['email' => strtolower(trim($this->email))]);
        }
        
        // Set default status
        if (!$this->status) {
            $this->merge(['status' => 'pending_approval']);
        }
    }
}
