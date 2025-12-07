<?php

namespace App\Http\Resources;

use App\Constants\SupplierConstants;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
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
            'supplier_code' => $this->supplier_code,
            'company_name' => $this->company_name,
            'trade_name' => $this->trade_name,
            'display_name' => $this->trade_name ?: $this->company_name,
            
            'supplier_type' => $this->supplier_type,
            'supplier_type_label' => SupplierConstants::SUPPLIER_TYPES[$this->supplier_type] ?? '',
            'status' => $this->status,
            'status_label' => SupplierConstants::STATUSES[$this->status] ?? '',
            'status_badge_color' => $this->getStatusBadgeColor(),
            
            'contact_info' => [
                'person' => $this->contact_person,
                'title' => $this->contact_title,
                'email' => $this->email,
                'phone' => $this->phone,
                'mobile' => $this->mobile,
                'fax' => $this->fax,
                'website' => $this->website,
            ],

            'address' => [
                'line_1' => $this->address_line_1,
                'line_2' => $this->address_line_2,
                'city' => $this->city,
                'state' => $this->state_province,
                'postal_code' => $this->postal_code,
                'country' => $this->country,
                'full_address' => $this->getFullAddress(),
            ],
            
            'business_info' => [
                'tax_id' => $this->tax_id,
                'registration_number' => $this->registration_number,
                'description' => $this->business_description,
                'established_year' => $this->established_year,
                'certifications' => $this->certifications,
            ],
            
            'financial_info' => [
                'payment_terms' => $this->payment_terms,
                'payment_terms_label' => SupplierConstants::PAYMENT_TERMS[$this->payment_terms] ?? '',
                'currency' => $this->currency,
                'credit_limit' => $this->credit_limit,
                'current_balance' => $this->current_balance,
                'available_credit' => max(0, ($this->credit_limit ?? 0) - ($this->current_balance ?? 0)),
                'payment_method' => $this->payment_method,
            ],

            'performance_metrics' => [
                'overall_rating' => round($this->overall_rating ?? 0, 2),
                'quality_rating' => round($this->quality_rating ?? 0, 2),
                'delivery_rating' => round($this->delivery_rating ?? 0, 2),
                'service_rating' => round($this->service_rating ?? 0, 2),
                'total_orders' => $this->total_orders ?? 0,
                'total_order_value' => $this->total_order_value ?? 0,
                'average_order_value' => $this->average_order_value ?? 0,
                'on_time_delivery_percentage' => $this->on_time_delivery_percentage ?? 0,
                'quality_issues_count' => $this->quality_issues_count ?? 0,
                'performance_score' => $this->getPerformanceScore(),
            ],
            
            'operational_info' => [
                'standard_lead_time' => $this->standard_lead_time,
                'rush_order_lead_time' => $this->rush_order_lead_time,
                'minimum_order_value' => $this->minimum_order_value,
                'shipping_methods' => $this->shipping_methods,
                'product_categories' => $this->product_categories,
            ],

            'compliance' => [
                'tax_exempt' => $this->tax_exempt,
                'required_documents' => $this->required_documents,
                'insurance_expiry' => $this->insurance_expiry,
            ],
            
            'contract_info' => [
                'type' => $this->contract_type,
                'type_label' => SupplierConstants::CONTRACT_TYPES[$this->contract_type] ?? '',
                'start_date' => $this->contract_start_date,
                'end_date' => $this->contract_end_date,
                'is_active' => $this->isContractActive(),
            ],
            
            'meta' => [
                'tags' => $this->tags,
                'internal_notes' => $this->internal_notes,
                'special_instructions' => $this->special_instructions,
                'last_order_date' => $this->last_order_date,
                'last_contact_date' => $this->last_contact_date,
            ],

            'relationships' => [
                'contact_logs_count' => $this->whenLoaded('contactLogs', function () {
                    return $this->contactLogs->count();
                }),
                'recent_contact_logs' => ContactLogResource::collection($this->whenLoaded('contactLogs', function () {
                    return $this->contactLogs->sortByDesc('contact_date')->take(5);
                })),
                'created_by' => $this->whenLoaded('createdBy', function () {
                    return [
                        'id' => $this->createdBy->id,
                        'name' => $this->createdBy->name,
                    ];
                }),
            ],

            'permissions' => [
                'can_edit' => auth()->check() && auth()->user()->isAdmin(),
                'can_delete' => auth()->check() && auth()->user()->isAdmin() && !$this->hasActiveOrders(),
                'can_create_order' => $this->canReceiveOrders(),
            ],
            
            'timestamps' => [
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
                'created_at_human' => $this->created_at->diffForHumans(),
                'updated_at_human' => $this->updated_at->diffForHumans(),
            ],
        ];
    }

    private function getStatusBadgeColor(): string
    {
        return match($this->status) {
            'active' => 'success',
            'pending_approval' => 'warning',
            'inactive' => 'secondary',
            'blacklisted' => 'danger',
            default => 'secondary',
        };
    }

    private function getFullAddress(): string
    {
        $address = $this->address_line_1;
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        $address .= ', ' . $this->city;
        if ($this->state_province) {
            $address .= ', ' . $this->state_province;
        }
        if ($this->postal_code) {
            $address .= ' ' . $this->postal_code;
        }
        $address .= ', ' . $this->country;
        
        return $address;
    }

    private function getPerformanceScore(): float
    {
        $scores = array_filter([
            $this->overall_rating,
            $this->quality_rating,
            $this->delivery_rating,
            $this->service_rating,
        ]);
        
        return empty($scores) ? 0 : round(array_sum($scores) / count($scores), 2);
    }

    private function isContractActive(): bool
    {
        if (!$this->contract_start_date || !$this->contract_end_date) {
            return false;
        }
        
        $now = now();
        return $now >= $this->contract_start_date && $now <= $this->contract_end_date;
    }

    private function canReceiveOrders(): bool
    {
        return in_array($this->status, ['active', 'pending_approval']);
    }

    private function hasActiveOrders(): bool
    {
        // This would need to be loaded or queried
        return false; // Placeholder
    }
}
