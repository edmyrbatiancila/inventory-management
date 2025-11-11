<?php

namespace Database\Factories\Traits;

use App\Models\PurchaseOrder;
use Carbon\Carbon;

trait HasPurchaseOrderStates
{
    /**
     * Generate data for draft purchase order
     */
    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => PurchaseOrder::STATUS_DRAFT,
            'approved_by' => null,
            'received_by' => null,
            'approved_at' => null,
            'expected_delivery_date' => $this->faker->dateTimeBetween('+1 week', '+2 months'),
            'received_at' => null,
        ]);
    }

    /**
     * Generate data for pending approval purchase order
     */
    public function pendingApproval(): static
    {
        return $this->state(fn () => [
            'status' => PurchaseOrder::STATUS_PENDING_APPROVAL,
            'approved_by' => null,
            'received_by' => null,
            'approved_at' => null,
            'expected_delivery_date' => $this->faker->dateTimeBetween('+5 days', '+6 weeks'),
            'received_at' => null,
        ]);
    }

    /**
     * Generate data for approved purchase order
     */
    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => PurchaseOrder::STATUS_APPROVED,
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'expected_delivery_date' => $this->faker->dateTimeBetween('+3 days', '+4 weeks'),
            'received_by' => null,
            'received_at' => null,
        ]);
    }

    /**
     * Generate data for sent to supplier purchase order
     */
    public function sentToSupplier(): static
    {
        return $this->state(fn () => [
            'status' => PurchaseOrder::STATUS_SENT_TO_SUPPLIER,
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-2 weeks', '-3 days'),
            'sent_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'expected_delivery_date' => $this->faker->dateTimeBetween('+1 day', '+3 weeks'),
            'received_by' => null,
            'received_at' => null,
        ]);
    }

    /**
     * Generate data for partially received purchase order
     */
    public function partiallyReceived(): static
    {
        return $this->state(fn () => [
            'status' => PurchaseOrder::STATUS_PARTIALLY_RECEIVED,
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'received_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-3 weeks', '-1 week'),
            'sent_at' => $this->faker->dateTimeBetween('-2 weeks', '-5 days'),
            'received_at' => $this->faker->dateTimeBetween('-5 days', 'now'),
            'expected_delivery_date' => $this->faker->dateTimeBetween('-1 week', '+1 week'),
        ]);
    }

    /**
     * Generate data for fully received purchase order
     */
    public function fullyReceived(): static
    {
        return $this->state(fn () => [
            'status' => PurchaseOrder::STATUS_FULLY_RECEIVED,
            'approved_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'received_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'approved_at' => $this->faker->dateTimeBetween('-4 weeks', '-2 weeks'),
            'sent_at' => $this->faker->dateTimeBetween('-3 weeks', '-10 days'),
            'received_at' => $this->faker->dateTimeBetween('-10 days', '-1 day'),
            'expected_delivery_date' => $this->faker->dateTimeBetween('-2 weeks', '-1 day'),
        ]);
    }

    /**
     * Generate data with high priority
     */
    public function urgent(): static
    {
        return $this->state(fn () => [
            'priority' => PurchaseOrder::PRIORITY_URGENT,
            'expected_delivery_date' => $this->faker->dateTimeBetween('now', '+1 week'),
        ]);
    }

    /**
     * Generate data with high priority
     */
    public function highPriority(): static
    {
        return $this->state(fn () => [
            'priority' => PurchaseOrder::PRIORITY_HIGH,
            'expected_delivery_date' => $this->faker->dateTimeBetween('+1 day', '+2 weeks'),
        ]);
    }
}