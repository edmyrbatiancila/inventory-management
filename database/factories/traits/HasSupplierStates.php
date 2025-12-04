<?php

namespace Database\Factories\Traits;

trait HasSupplierStates
{
    /**
     * Generate active supplier
     */
    public function active(): static
    {
        return $this->state([
            'status' => 'active',
            'overall_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            'quality_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            'delivery_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            'service_rating' => $this->faker->randomFloat(2, 4.0, 5.0),
            'total_orders' => $this->faker->numberBetween(10, 150),
            'on_time_delivery_percentage' => $this->faker->numberBetween(85, 100),
            'quality_issues_count' => $this->faker->numberBetween(0, 3),
        ]);
    }

    /**
     * Generate pending approval supplier
     */
    public function pendingApproval(): static
    {
        return $this->state([
            'status' => 'pending_approval',
            'overall_rating' => 0.00,
            'quality_rating' => 0.00,
            'delivery_rating' => 0.00,
            'service_rating' => 0.00,
            'total_orders' => 0,
            'total_order_value' => 0,
            'average_order_value' => 0,
            'last_order_date' => null,
        ]);
    }

    /**
     * Generate preferred vendor
     */
    public function preferredVendor(): static
    {
        return $this->state([
            'status' => 'active',
            'contract_type' => 'preferred_vendor',
            'overall_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'quality_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'delivery_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'service_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'total_orders' => $this->faker->numberBetween(50, 200),
            'on_time_delivery_percentage' => $this->faker->numberBetween(95, 100),
            'credit_limit' => $this->faker->randomFloat(2, 50000, 200000),
        ]);
    }

    /**
     * Generate manufacturer supplier
     */
    public function manufacturer(): static
    {
        return $this->state([
            'supplier_type' => 'manufacturer',
            'minimum_order_value' => $this->faker->randomFloat(2, 5000, 25000),
            'standard_lead_time' => $this->faker->numberBetween(14, 45),
            'rush_order_lead_time' => $this->faker->numberBetween(7, 21),
        ]);
    }

    /**
     * Generate distributor supplier
     */
    public function distributor(): static
    {
        return $this->state([
            'supplier_type' => 'distributor',
            'minimum_order_value' => $this->faker->randomFloat(2, 1000, 10000),
            'standard_lead_time' => $this->faker->numberBetween(7, 21),
            'rush_order_lead_time' => $this->faker->numberBetween(1, 7),
        ]);
    }

    /**
     * Generate high-rated supplier
     */
    public function highRated(): static
    {
        return $this->state([
            'overall_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'quality_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'delivery_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'service_rating' => $this->faker->randomFloat(2, 4.5, 5.0),
            'on_time_delivery_percentage' => $this->faker->numberBetween(95, 100),
            'quality_issues_count' => $this->faker->numberBetween(0, 1),
        ]);
    }
}