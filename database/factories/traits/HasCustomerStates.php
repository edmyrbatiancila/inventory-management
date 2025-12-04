<?php

namespace Database\Factories\Traits;

trait HasCustomerStates
{
    /**
     * Generate VIP customer
     */
    public function vip(): static
    {
        return $this->state([
            'customer_priority' => 'vip',
            'status' => 'active',
            'credit_status' => 'good',
            'price_tier' => 'platinum',
            'credit_limit' => $this->faker->randomFloat(2, 50000, 200000),
            'total_orders' => $this->faker->numberBetween(50, 200),
            'total_order_value' => $this->faker->randomFloat(2, 100000, 500000),
            'customer_satisfaction_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'default_discount_percentage' => $this->faker->randomFloat(2, 10, 25),
            'volume_discount_eligible' => true,
            'seasonal_discount_eligible' => true,
        ]);
    }

    /**
     * Generate individual customer
     */
    public function individual(): static
    {
        return $this->state([
            'customer_type' => 'individual',
            'company_name' => null,
            'trade_name' => null,
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'business_description' => null,
            'industry_sectors' => null,
            'established_year' => null,
            'company_size' => null,
            'tax_id' => null,
            'registration_number' => null,
            'credit_limit' => $this->faker->randomFloat(2, 1000, 10000),
        ]);
    }

    /**
     * Generate business customer
     */
    public function business(): static
    {
        return $this->state([
            'customer_type' => 'business',
            'company_name' => $this->faker->company(),
            'first_name' => null,
            'last_name' => null,
            'business_description' => $this->faker->paragraph(1),
            'industry_sectors' => $this->faker->randomElements(['Retail', 'Manufacturing', 'Technology'], rand(1, 2)),
            'established_year' => $this->faker->numberBetween(1990, 2020),
            'company_size' => $this->faker->randomElement(['small', 'medium', 'large']),
            'tax_id' => $this->faker->numerify('##-#######'),
        ]);
    }

    /**
     * Generate high-value customer
     */
    public function highValue(): static
    {
        return $this->state([
            'customer_priority' => 'high',
            'price_tier' => $this->faker->randomElement(['gold', 'platinum']),
            'credit_limit' => $this->faker->randomFloat(2, 25000, 100000),
            'total_order_value' => $this->faker->randomFloat(2, 50000, 250000),
            'average_order_value' => $this->faker->randomFloat(2, 5000, 25000),
            'customer_satisfaction_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            'default_discount_percentage' => $this->faker->randomFloat(2, 5, 15),
        ]);
    }

    /**
     * Generate prospect customer
     */
    public function prospect(): static
    {
        return $this->state([
            'status' => 'prospect',
            'total_orders' => 0,
            'total_order_value' => 0,
            'average_order_value' => 0,
            'lifetime_value' => 0,
            'last_order_date' => null,
            'first_purchase_date' => null,
        ]);
    }

    /**
     * Generate suspended customer
     */
    public function suspended(): static
    {
        return $this->state([
            'status' => 'suspended',
            'credit_status' => $this->faker->randomElement(['hold', 'collections']),
            'payment_delay_days_average' => $this->faker->numberBetween(30, 90),
            'complaint_count' => $this->faker->numberBetween(3, 10),
        ]);
    }
}