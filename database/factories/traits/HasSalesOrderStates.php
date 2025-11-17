<?php

namespace Database\Factories\Traits;

use App\Models\SalesOrder;

trait HasSalesOrderStates
{
    /**
     * Generate data for draft sales order
     */
    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => 'draft',
            'approved_by' => null,
            'fulfilled_by' => null,
            'shipped_by' => null,
            'approved_at' => null,
            'confirmed_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
            'requested_delivery_date' => $this->faker->dateTimeBetween('+1 week', '+2 months'),
        ]);
    }

    /**
     * Generate data for pending approval sales order
     */
    public function pendingApproval(): static
    {
        return $this->state(fn () => [
            'status' => 'pending_approval',
            'approved_by' => null,
            'fulfilled_by' => null,
            'shipped_by' => null,
            'approved_at' => null,
            'confirmed_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
            'requested_delivery_date' => $this->faker->dateTimeBetween('+5 days', '+6 weeks'),
        ]);
    }

    /**
     * Generate data for approved sales order
     */
    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => 'approved',
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'requested_delivery_date' => $this->faker->dateTimeBetween('+3 days', '+4 weeks'),
            'promised_delivery_date' => $this->faker->dateTimeBetween('+3 days', '+4 weeks'),
            'fulfilled_by' => null,
            'shipped_by' => null,
            'confirmed_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for confirmed sales order
     */
    public function confirmed(): static
    {
        return $this->state(fn () => [
            'status' => 'confirmed',
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-2 weeks', '-3 days'),
            'confirmed_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'requested_delivery_date' => $this->faker->dateTimeBetween('+1 day', '+3 weeks'),
            'promised_delivery_date' => $this->faker->dateTimeBetween('+1 day', '+3 weeks'),
            'fulfilled_by' => null,
            'shipped_by' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for partially fulfilled sales order
     */
    public function partiallyFulfilled(): static
    {
        return $this->state(fn () => [
            'status' => 'partially_fulfilled',
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'fulfilled_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-3 weeks', '-1 week'),
            'confirmed_at' => $this->faker->dateTimeBetween('-2 weeks', '-5 days'),
            'fulfilled_at' => $this->faker->dateTimeBetween('-5 days', 'now'),
            'requested_delivery_date' => $this->faker->dateTimeBetween('-1 week', '+1 week'),
            'promised_delivery_date' => $this->faker->dateTimeBetween('-1 week', '+1 week'),
            'shipped_by' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for fully fulfilled sales order
     */
    public function fullyFulfilled(): static
    {
        return $this->state(fn () => [
            'status' => 'fully_fulfilled',
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'fulfilled_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-4 weeks', '-2 weeks'),
            'confirmed_at' => $this->faker->dateTimeBetween('-3 weeks', '-10 days'),
            'fulfilled_at' => $this->faker->dateTimeBetween('-10 days', '-1 day'),
            'requested_delivery_date' => $this->faker->dateTimeBetween('-2 weeks', '-1 day'),
            'promised_delivery_date' => $this->faker->dateTimeBetween('-2 weeks', '-1 day'),
            'shipped_by' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for shipped sales order
     */
    public function shipped(): static
    {
        return $this->state(fn () => [
            'status' => 'shipped',
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'fulfilled_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'shipped_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-5 weeks', '-3 weeks'),
            'confirmed_at' => $this->faker->dateTimeBetween('-4 weeks', '-2 weeks'),
            'fulfilled_at' => $this->faker->dateTimeBetween('-2 weeks', '-5 days'),
            'shipped_at' => $this->faker->dateTimeBetween('-5 days', '-1 day'),
            'requested_delivery_date' => $this->faker->dateTimeBetween('-3 weeks', '-5 days'),
            'promised_delivery_date' => $this->faker->dateTimeBetween('-3 weeks', '-5 days'),
            'tracking_number' => $this->faker->regexify('[A-Z]{2}[0-9]{12}'),
            'carrier' => $this->faker->randomElement(['FedEx', 'UPS', 'DHL', 'USPS']),
            'shipping_method' => $this->faker->randomElement(['Standard', 'Express', 'Overnight', 'Ground']),
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for delivered sales order
     */
    public function delivered(): static
    {
        return $this->state(fn () => [
            'status' => 'delivered',
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'fulfilled_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'shipped_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-6 weeks', '-4 weeks'),
            'confirmed_at' => $this->faker->dateTimeBetween('-5 weeks', '-3 weeks'),
            'fulfilled_at' => $this->faker->dateTimeBetween('-3 weeks', '-1 week'),
            'shipped_at' => $this->faker->dateTimeBetween('-1 week', '-3 days'),
            'delivered_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
            'requested_delivery_date' => $this->faker->dateTimeBetween('-4 weeks', '-1 week'),
            'promised_delivery_date' => $this->faker->dateTimeBetween('-4 weeks', '-1 week'),
            'tracking_number' => $this->faker->regexify('[A-Z]{2}[0-9]{12}'),
            'carrier' => $this->faker->randomElement(['FedEx', 'UPS', 'DHL', 'USPS']),
            'shipping_method' => $this->faker->randomElement(['Standard', 'Express', 'Overnight', 'Ground']),
        ]);
    }

    /**
     * Generate data with urgent priority
     */
    public function urgent(): static
    {
        return $this->state(fn () => [
            'priority' => 'urgent',
            'requested_delivery_date' => $this->faker->dateTimeBetween('now', '+1 week'),
            'shipping_method' => 'Express',
        ]);
    }

    /**
     * Generate data with high priority
     */
    public function highPriority(): static
    {
        return $this->state(fn () => [
            'priority' => 'high',
            'requested_delivery_date' => $this->faker->dateTimeBetween('+1 day', '+2 weeks'),
            'shipping_method' => 'Standard',
        ]);
    }

    /**
     * Generate data with paid payment status
     */
    public function paid(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'paid',
            'payment_terms' => $this->faker->randomElement(['Net 30', 'Net 15', 'Cash on Delivery', 'Prepaid']),
        ]);
    }

    /**
     * Generate data with overdue payment status
     */
    public function overdue(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'overdue',
            'payment_terms' => 'Net 30',
        ]);
    }
}