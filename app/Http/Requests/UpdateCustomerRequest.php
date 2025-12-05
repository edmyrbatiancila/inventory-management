<?php

namespace App\Http\Requests;

use App\Constants\CustomerConstants;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $customerId = $this->route('customer')->id;

        return [
            // Basic Information
            'customer_type' => ['required', Rule::in(array_keys(CustomerConstants::CUSTOMER_TYPES))],
            'company_name' => 'required_if:customer_type,business,government,non_profit|nullable|string|max:255',
            'trade_name' => 'nullable|string|max:255',
            'first_name' => 'required_if:customer_type,individual|nullable|string|max:255',
            'last_name' => 'required_if:customer_type,individual|nullable|string|max:255',
            'status' => ['required', Rule::in(array_keys(CustomerConstants::STATUSES))],
            
            // Contact Information
            'contact_person' => 'nullable|string|max:255',
            'contact_title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:customers,email,' . $customerId,
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'fax' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            
            // Billing Address
            'billing_address_line_1' => 'required|string|max:255',
            'billing_address_line_2' => 'nullable|string|max:255',
            'billing_city' => 'required|string|max:100',
            'billing_state_province' => 'nullable|string|max:100',
            'billing_postal_code' => 'nullable|string|max:20',
            'billing_country' => 'required|string|max:100',

            // Shipping Address
            'same_as_billing' => 'boolean',
            'shipping_address_line_1' => 'required_if:same_as_billing,false|nullable|string|max:255',
            'shipping_address_line_2' => 'nullable|string|max:255',
            'shipping_city' => 'required_if:same_as_billing,false|nullable|string|max:100',
            'shipping_state_province' => 'nullable|string|max:100',
            'shipping_postal_code' => 'nullable|string|max:20',
            'shipping_country' => 'required_if:same_as_billing,false|nullable|string|max:100',
            
            // Business Information
            'tax_id' => 'nullable|string|max:50',
            'registration_number' => 'nullable|string|max:50',
            'business_description' => 'nullable|string|max:1000',
            'established_year' => 'nullable|integer|between:1800,' . date('Y'),
            'company_size' => ['nullable', Rule::in(array_keys(CustomerConstants::COMPANY_SIZES))],
            
            // Financial Information
            'payment_terms' => ['nullable', Rule::in(array_keys(CustomerConstants::PAYMENT_TERMS))],
            'currency' => 'nullable|string|size:3',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_status' => ['nullable', Rule::in(array_keys(CustomerConstants::CREDIT_STATUSES))],
            
            // Customer Management
            'customer_priority' => ['nullable', Rule::in(array_keys(CustomerConstants::PRIORITIES))],
            'price_tier' => ['nullable', Rule::in(array_keys(CustomerConstants::PRICE_TIERS))],
            'lead_source' => ['nullable', Rule::in(array_keys(CustomerConstants::LEAD_SOURCES))],
            'assigned_sales_rep' => 'nullable|exists:users,id',
            'default_discount_percentage' => 'nullable|numeric|between:0,100',

            // Preferences & Settings
            'volume_discount_eligible' => 'boolean',
            'seasonal_discount_eligible' => 'boolean',
            'tax_exempt' => 'boolean',
            'newsletter_subscription' => 'boolean',
            
            // Notes
            'special_requirements' => 'nullable|string|max:1000',
            'internal_notes' => 'nullable|string|max:2000',
            'sales_notes' => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required_if' => 'Company name is required for business, government, and non-profit customers.',
            'first_name.required_if' => 'First name is required for individual customers.',
            'last_name.required_if' => 'Last name is required for individual customers.',
            'billing_address_line_1.required' => 'Billing address is required.',
            'billing_city.required' => 'Billing city is required.',
            'billing_country.required' => 'Billing country is required.',
            'shipping_address_line_1.required_if' => 'Shipping address is required when different from billing.',
            'shipping_city.required_if' => 'Shipping city is required when different from billing.',
            'shipping_country.required_if' => 'Shipping country is required when different from billing.',
            'email.unique' => 'This email address is already registered to another customer.',
            'assigned_sales_rep.exists' => 'The selected sales representative does not exist.',
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
        
        // Ensure boolean values are properly set
        $this->merge([
            'same_as_billing' => $this->same_as_billing ?? false,
            'volume_discount_eligible' => $this->volume_discount_eligible ?? false,
            'seasonal_discount_eligible' => $this->seasonal_discount_eligible ?? false,
            'tax_exempt' => $this->tax_exempt ?? false,
            'newsletter_subscription' => $this->newsletter_subscription ?? true,
        ]);
    }
}
