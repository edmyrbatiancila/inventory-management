<?php

namespace Database\Factories;

use App\Models\Supplier;
use App\Models\User;
use Database\Factories\Traits\HasSupplierStates;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    use HasSupplierStates;

    protected $model = Supplier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $companyTypes = ['Corp', 'Ltd', 'LLC', 'Inc', 'Co'];
        $companyName = $this->faker->company() . ' ' . $this->faker->randomElement($companyTypes);
        $tradeName = $this->faker->optional(0.3)->companySuffix();

        return [
            'supplier_code' => $this->generateSupplierCode(),
            'company_name' => $companyName,
            'trade_name' => $tradeName,
            'supplier_type' => $this->faker->randomElement(['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider']),
            'status' => $this->faker->randomElement(['active', 'inactive', 'pending_approval']),
            
            // Contact Information
            'contact_person' => $this->faker->name(),
            'contact_title' => $this->faker->randomElement(['Manager', 'Director', 'CEO', 'CFO', 'Sales Rep', 'Account Manager']),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'mobile' => $this->faker->optional(0.7)->phoneNumber(),
            'fax' => $this->faker->optional(0.3)->phoneNumber(),
            'website' => $this->faker->optional(0.6)->url(),
            
            // Address Information
            'address_line_1' => $this->faker->streetAddress(),
            'address_line_2' => $this->faker->optional(0.3)->secondaryAddress(),
            'city' => $this->faker->city(),
            'state_province' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),

            // Business Information
            'tax_id' => $this->faker->optional(0.8)->numerify('##-#######'),
            'registration_number' => $this->faker->optional(0.7)->numerify('REG-#######'),
            'business_description' => $this->faker->optional(0.6)->paragraph(2),
            'certifications' => $this->faker->optional(0.4)->randomElements(['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'CE Marking'], rand(1, 2)),
            'established_year' => $this->faker->optional(0.8)->numberBetween(1980, 2020),
            
            // Financial Information
            'payment_terms' => $this->faker->randomElement(['cod', 'net_15', 'net_30', 'net_45', 'net_60']),
            'currency' => $this->faker->randomElement(['USD', 'EUR', 'GBP', 'CAD']),
            'credit_limit' => $this->faker->randomFloat(2, 5000, 100000),
            'current_balance' => $this->faker->randomFloat(2, 0, 25000),
            'payment_method' => $this->faker->randomElement(['bank_transfer', 'check', 'credit_card']),
            'bank_name' => $this->faker->optional(0.7)->company() . ' Bank',
            'bank_account_number' => $this->faker->optional(0.7)->numerify('####-####-####'),
            'bank_routing_number' => $this->faker->optional(0.7)->numerify('#########'),
            
            // Performance Metrics
            'overall_rating' => $this->faker->randomFloat(2, 3.0, 5.0),
            'quality_rating' => $this->faker->randomFloat(2, 3.0, 5.0),
            'delivery_rating' => $this->faker->randomFloat(2, 3.0, 5.0),
            'service_rating' => $this->faker->randomFloat(2, 3.0, 5.0),
            'total_orders' => $this->faker->numberBetween(0, 150),
            'total_order_value' => $this->faker->randomFloat(2, 0, 500000),
            'average_order_value' => $this->faker->randomFloat(2, 1000, 25000),
            'on_time_delivery_percentage' => $this->faker->numberBetween(70, 100),
            'quality_issues_count' => $this->faker->numberBetween(0, 10),

            // Lead Times
            'standard_lead_time' => $this->faker->numberBetween(7, 45),
            'rush_order_lead_time' => $this->faker->numberBetween(1, 14),
            'minimum_order_value' => $this->faker->randomFloat(2, 500, 10000),
            
            // Compliance
            'tax_exempt' => $this->faker->boolean(0.1),
            'required_documents' => $this->faker->optional(0.5)->randomElements(['Insurance Certificate', 'Tax Certificate', 'Quality Certificate'], rand(1, 2)),
            'insurance_expiry' => $this->faker->boolean(0.7) ? $this->faker->dateTimeBetween('now', '+2 years') : null,
            'shipping_methods' => $this->faker->randomElements(['Standard', 'Express', 'Overnight', 'Freight'], rand(1, 3)),
            
            // Categories & Tags
            'product_categories' => $this->faker->randomElements(['Electronics', 'Automotive', 'Industrial', 'Consumer Goods', 'Raw Materials'], rand(1, 3)),
            'tags' => $this->faker->optional(0.6)->randomElements(['Reliable', 'Cost-Effective', 'Premium', 'Local', 'International'], rand(1, 2)),
            
            // Internal Notes
            'internal_notes' => $this->faker->optional(0.4)->paragraph(1),
            'special_instructions' => $this->faker->optional(0.3)->sentence(),
            
            // Relationships
            'created_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'updated_by' => $this->faker->optional(0.7)->randomElement(User::pluck('id')->toArray()),
            'last_order_date' => $this->faker->optional(0.8)->dateTimeBetween('-6 months', 'now'),
            'last_contact_date' => $this->faker->optional(0.6)->dateTimeBetween('-1 month', 'now'),
            
            // Contract Information
            'contract_start_date' => $this->faker->boolean(0.5) ? $this->faker->dateTimeBetween('-2 years', 'now') : null,
            'contract_end_date' => $this->faker->boolean(0.5) ? $this->faker->dateTimeBetween('now', '+2 years') : null,
            'contract_type' => $this->faker->optional(0.5)->randomElement(['one_time', 'short_term', 'long_term', 'preferred_vendor']),
        ];
    }

    private function generateSupplierCode(): string
    {
        return 'SUP-' . date('Y') . '-' . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
    }
}
