<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Database\Factories\Traits\HasCustomerStates;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    use HasCustomerStates;

    protected $model = Customer::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $customerType = $this->faker->randomElement(['individual', 'business', 'government', 'non_profit']);
        $isIndividual = $customerType === 'individual';
        
        $billingCountry = $this->faker->country();
        $sameAsBilling = $this->faker->boolean(0.7);

        return [
            'customer_code' => $this->generateCustomerCode(),
            'customer_type' => $customerType,
            'company_name' => $isIndividual ? null : $this->faker->company(),
            'trade_name' => $isIndividual ? null : $this->faker->optional(0.3)->companySuffix(),
            'first_name' => $isIndividual ? $this->faker->firstName() : null,
            'last_name' => $isIndividual ? $this->faker->lastName() : null,
            'status' => $this->faker->randomElement(['active', 'inactive', 'prospect']),
            
            // Contact Information
            'contact_person' => $this->faker->name(),
            'contact_title' => $this->faker->randomElement(['Manager', 'Director', 'Owner', 'CFO', 'Purchasing Manager']),
            'email' => $this->faker->unique()->email(),
            'phone' => $this->faker->phoneNumber(),
            'mobile' => $this->faker->optional(0.8)->phoneNumber(),
            'fax' => $this->faker->optional(0.2)->phoneNumber(),
            'website' => $this->faker->optional(0.4)->url(),
            
            // Billing Address
            'billing_address_line_1' => $this->faker->streetAddress(),
            'billing_address_line_2' => $this->faker->optional(0.3)->secondaryAddress(),
            'billing_city' => $this->faker->city(),
            'billing_state_province' => $this->faker->state(),
            'billing_postal_code' => $this->faker->postcode(),
            'billing_country' => $billingCountry,

            // Shipping Address
            'same_as_billing' => $sameAsBilling,
            'shipping_address_line_1' => $sameAsBilling ? null : $this->faker->streetAddress(),
            'shipping_address_line_2' => $sameAsBilling ? null : $this->faker->optional(0.3)->secondaryAddress(),
            'shipping_city' => $sameAsBilling ? null : $this->faker->city(),
            'shipping_state_province' => $sameAsBilling ? null : $this->faker->state(),
            'shipping_postal_code' => $sameAsBilling ? null : $this->faker->postcode(),
            'shipping_country' => $sameAsBilling ? null : $this->faker->country(),
            
            // Business Information
            'tax_id' => $isIndividual ? null : $this->faker->optional(0.8)->numerify('##-#######'),
            'registration_number' => $isIndividual ? null : $this->faker->optional(0.7)->numerify('REG-#######'),
            'business_description' => $isIndividual ? null : $this->faker->optional(0.5)->paragraph(1),
            'industry_sectors' => $isIndividual ? null : $this->faker->randomElements(['Retail', 'Manufacturing', 'Healthcare', 'Technology', 'Finance'], rand(1, 2)),
            'established_year' => $isIndividual ? null : $this->faker->optional(0.7)->numberBetween(1990, 2020),
            'company_size' => $isIndividual ? null : $this->faker->randomElement(['startup', 'small', 'medium', 'large']),
            
            // Financial Information
            'payment_terms' => $this->faker->randomElement(['cod', 'net_15', 'net_30', 'net_45']),
            'currency' => 'USD',
            'credit_limit' => $this->faker->randomFloat(2, 1000, 50000),
            'current_balance' => $this->faker->randomFloat(2, 0, 15000),
            'available_credit' => function (array $attributes) {
                return max(0, $attributes['credit_limit'] - $attributes['current_balance']);
            },
            'credit_status' => $this->faker->randomElement(['good', 'watch', 'hold']),
            'payment_method' => $this->faker->randomElement(['bank_transfer', 'check', 'credit_card', 'invoice']),

            // Performance & Analytics
            'customer_satisfaction_rating' => $this->faker->randomFloat(2, 3.5, 5.0),
            'total_orders' => $this->faker->numberBetween(0, 100),
            'total_order_value' => $this->faker->randomFloat(2, 0, 250000),
            'average_order_value' => $this->faker->randomFloat(2, 500, 15000),
            'lifetime_value' => function (array $attributes) {
                return $attributes['total_order_value'];
            },
            'payment_delay_days_average' => $this->faker->numberBetween(0, 15),
            'return_rate_percentage' => $this->faker->numberBetween(0, 10),
            'complaint_count' => $this->faker->numberBetween(0, 5),
            
            // Sales Information
            'assigned_sales_rep' => $this->faker->optional(0.8)->randomElement(User::pluck('id')->toArray()),
            'customer_priority' => $this->faker->randomElement(['low', 'normal', 'high', 'vip']),
            'lead_source' => $this->faker->randomElement(['website', 'referral', 'cold_call', 'trade_show', 'advertisement']),
            'special_requirements' => $this->faker->optional(0.3)->paragraph(1),
            'preferred_delivery_methods' => $this->faker->randomElements(['Standard', 'Express', 'Overnight'], rand(1, 2)),
            
            // Pricing & Discounts
            'price_tier' => $this->faker->randomElement(['standard', 'bronze', 'silver', 'gold']),
            'default_discount_percentage' => $this->faker->randomFloat(2, 0, 15),
            'volume_discount_eligible' => $this->faker->boolean(0.3),
            'seasonal_discount_eligible' => $this->faker->boolean(0.4),
            
            // Communication Preferences
            'communication_preferences' => $this->faker->randomElements(['email', 'phone', 'sms'], rand(1, 2)),
            'marketing_preferences' => $this->faker->optional(0.6)->randomElements(['newsletter', 'promotions', 'product_updates'], rand(1, 2)),
            'newsletter_subscription' => $this->faker->boolean(0.4),
            
            // Categories & Tags
            'customer_categories' => $this->faker->randomElements(['Retail', 'Wholesale', 'Enterprise', 'SMB'], rand(1, 2)),
            'tags' => $this->faker->optional(0.5)->randomElements(['High-Value', 'Loyal', 'New', 'Seasonal'], rand(1, 2)),

             // Internal Information
            'internal_notes' => $this->faker->optional(0.4)->paragraph(1),
            'sales_notes' => $this->faker->optional(0.3)->sentence(),
            'tax_exempt' => $this->faker->boolean(0.1),
            'tax_exempt_certificate' => $this->faker->boolean(0.1) ? $this->faker->numerify('CERT-######') : null,
            
            // Relationships & Tracking
            'created_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'updated_by' => $this->faker->optional(0.6)->randomElement(User::pluck('id')->toArray()),
            'last_order_date' => $this->faker->optional(0.7)->dateTimeBetween('-6 months', 'now'),
            'last_contact_date' => $this->faker->optional(0.5)->dateTimeBetween('-1 month', 'now'),
            'first_purchase_date' => $this->faker->optional(0.6)->dateTimeBetween('-2 years', '-1 month'),
            
            // Contract Information
            'contract_start_date' => $this->faker->boolean(0.3) ? $this->faker->dateTimeBetween('-1 year', 'now') : null,
            'contract_end_date' => $this->faker->boolean(0.3) ? $this->faker->dateTimeBetween('now', '+1 year') : null,
            'contract_type' => $this->faker->optional(0.3)->randomElement(['one_time', 'short_term', 'long_term']),
        ];
    }

    private function generateCustomerCode(): string
    {
        return 'CUS-' . date('Y') . '-' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
    }
}
