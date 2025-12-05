<?php

namespace App\Http\Resources;

use App\Constants\CustomerConstants;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_code' => $this->customer_code,
            'customer_type' => $this->customer_type,
            'customer_type_label' => CustomerConstants::CUSTOMER_TYPES[$this->customer_type] ?? $this->customer_type,
            
            // Name Information
            'company_name' => $this->company_name,
            'trade_name' => $this->trade_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'display_name' => $this->getDisplayName(),
            'full_name' => $this->getFullName(),
            
            // Status
            'status' => $this->status,
            'status_label' => CustomerConstants::STATUSES[$this->status] ?? $this->status,
            'status_color' => $this->getStatusBadgeColor(),
            
            // Contact Information
            'contact_person' => $this->contact_person,
            'contact_title' => $this->contact_title,
            'email' => $this->email,
            'phone' => $this->phone,
            'mobile' => $this->mobile,
            'fax' => $this->fax,
            'website' => $this->website,

            // Addresses
            'billing_address' => [
                'line_1' => $this->billing_address_line_1,
                'line_2' => $this->billing_address_line_2,
                'city' => $this->billing_city,
                'state_province' => $this->billing_state_province,
                'postal_code' => $this->billing_postal_code,
                'country' => $this->billing_country,
                'full_address' => $this->getBillingAddress(),
            ],
            'shipping_address' => [
                'same_as_billing' => $this->same_as_billing,
                'line_1' => $this->shipping_address_line_1,
                'line_2' => $this->shipping_address_line_2,
                'city' => $this->shipping_city,
                'state_province' => $this->shipping_state_province,
                'postal_code' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
                'full_address' => $this->getShippingAddress(),
            ],

            // Business Information
            'tax_id' => $this->tax_id,
            'registration_number' => $this->registration_number,
            'business_description' => $this->business_description,
            'industry_sectors' => $this->industry_sectors,
            'established_year' => $this->established_year,
            'company_size' => $this->company_size,
            'company_size_label' => CustomerConstants::COMPANY_SIZES[$this->company_size] ?? $this->company_size,
            
            // Financial Information
            'payment_terms' => $this->payment_terms,
            'payment_terms_label' => CustomerConstants::PAYMENT_TERMS[$this->payment_terms] ?? $this->payment_terms,
            'currency' => $this->currency,
            'credit_limit' => $this->credit_limit,
            'current_balance' => $this->current_balance,
            'available_credit' => $this->available_credit,
            'credit_status' => $this->credit_status,
            'credit_status_label' => CustomerConstants::CREDIT_STATUSES[$this->credit_status] ?? $this->credit_status,
            'credit_status_color' => $this->getCreditStatusColor(),
            'payment_method' => $this->payment_method,

            // Customer Management
            'customer_priority' => $this->customer_priority,
            'priority_label' => CustomerConstants::PRIORITIES[$this->customer_priority] ?? $this->customer_priority,
            'lead_source' => $this->lead_source,
            'lead_source_label' => CustomerConstants::LEAD_SOURCES[$this->lead_source] ?? $this->lead_source,
            'assigned_sales_rep' => $this->assigned_sales_rep,
            'sales_rep' => $this->whenLoaded('salesRep', function () {
                return [
                    'id' => $this->salesRep->id,
                    'name' => $this->salesRep->name,
                    'email' => $this->salesRep->email,
                ];
            }),
            
            // Pricing & Discounts
            'price_tier' => $this->price_tier,
            'price_tier_label' => CustomerConstants::PRICE_TIERS[$this->price_tier] ?? $this->price_tier,
            'default_discount_percentage' => $this->default_discount_percentage,
            'volume_discount_eligible' => $this->volume_discount_eligible,
            'seasonal_discount_eligible' => $this->seasonal_discount_eligible,
            
            // Performance Metrics
            'customer_satisfaction_rating' => $this->customer_satisfaction_rating,
            'total_orders' => $this->total_orders,
            'total_order_value' => $this->total_order_value,
            'average_order_value' => $this->average_order_value,
            'lifetime_value' => $this->lifetime_value,
            'payment_delay_days_average' => $this->payment_delay_days_average,
            'return_rate_percentage' => $this->return_rate_percentage,
            'complaint_count' => $this->complaint_count,

            // Preferences & Settings
            'special_requirements' => $this->special_requirements,
            'preferred_delivery_methods' => $this->preferred_delivery_methods,
            'communication_preferences' => $this->communication_preferences,
            'marketing_preferences' => $this->marketing_preferences,
            'newsletter_subscription' => $this->newsletter_subscription,
            'tax_exempt' => $this->tax_exempt,
            'tax_exempt_certificate' => $this->tax_exempt_certificate,
            
            // Categories & Tags
            'customer_categories' => $this->customer_categories,
            'tags' => $this->tags,
            
            // Notes
            'internal_notes' => $this->internal_notes,
            'sales_notes' => $this->sales_notes,
            
            // Dates
            'last_order_date' => $this->last_order_date?->format('Y-m-d'),
            'last_contact_date' => $this->last_contact_date?->format('Y-m-d'),
            'first_purchase_date' => $this->first_purchase_date?->format('Y-m-d'),
            'contract_start_date' => $this->contract_start_date?->format('Y-m-d'),
            'contract_end_date' => $this->contract_end_date?->format('Y-m-d'),
            'contract_type' => $this->contract_type,

            // Audit Information
            'created_by' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'name' => $this->createdBy->name,
                ];
            }),
            'updated_by' => $this->whenLoaded('updatedBy', function () {
                return [
                    'id' => $this->updatedBy->id,
                    'name' => $this->updatedBy->name,
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

            // Computed Properties
            'can_place_orders' => $this->canPlaceOrders(),
            'is_active' => $this->isActive(),
            'has_available_credit' => $this->hasAvailableCredit(),
            'credit_utilization_percentage' => $this->credit_limit > 0 ? 
                round(($this->current_balance / $this->credit_limit) * 100, 2) : 0,
            
            // Related Data
            'contact_logs_count' => $this->whenLoaded('contactLogs', fn() => $this->contactLogs->count()),
            'recent_contact_logs' => $this->whenLoaded('contactLogs', function () {
                return $this->contactLogs->take(3)->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'contact_type' => $log->contact_type,
                        'subject' => $log->subject,
                        'contact_date' => $log->contact_date->format('Y-m-d'),
                        'outcome' => $log->outcome,
                    ];
                });
            }),
        ];
    }

    private function getStatusBadgeColor(): string
    {
        return match($this->status) {
            'active' => 'green',
            'inactive' => 'gray',
            'suspended' => 'red',
            'prospect' => 'blue',
            default => 'gray'
        };
    }

    private function getDisplayName(): string
    {
        if ($this->customer_type === 'individual') {
            return trim($this->first_name . ' ' . $this->last_name);
        }
        
        return $this->trade_name ?: $this->company_name;
    }

    private function getFullName(): string
    {
        return $this->getDisplayName();
    }

    private function getBillingAddress(): string
    {
        $address = $this->billing_address_line_1;
        if ($this->billing_address_line_2) {
            $address .= ', ' . $this->billing_address_line_2;
        }
        $address .= ', ' . $this->billing_city;
        if ($this->billing_state_province) {
            $address .= ', ' . $this->billing_state_province;
        }
        if ($this->billing_postal_code) {
            $address .= ' ' . $this->billing_postal_code;
        }
        $address .= ', ' . $this->billing_country;
        
        return $address;
    }

    private function getShippingAddress(): string
    {
        if ($this->same_as_billing) {
            return $this->getBillingAddress();
        }

        $address = $this->shipping_address_line_1;
        if ($this->shipping_address_line_2) {
            $address .= ', ' . $this->shipping_address_line_2;
        }
        $address .= ', ' . $this->shipping_city;
        if ($this->shipping_state_province) {
            $address .= ', ' . $this->shipping_state_province;
        }
        if ($this->shipping_postal_code) {
            $address .= ' ' . $this->shipping_postal_code;
        }
        $address .= ', ' . $this->shipping_country;
        
        return $address;
    }

    private function getCreditStatusColor(): string
    {
        return match($this->credit_status) {
            'good' => 'green',
            'watch' => 'yellow',
            'hold' => 'red',
            'collections' => 'red',
            default => 'gray'
        };
    }

    private function canPlaceOrders(): bool
    {
        return in_array($this->status, ['active']) && $this->credit_status !== 'hold';
    }

    private function isActive(): bool
    {
        return $this->status === 'active';
    }

    private function hasAvailableCredit(): bool
    {
        return $this->available_credit > 0;
    }
}
