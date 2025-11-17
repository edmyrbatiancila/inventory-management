<?php

namespace Database\Factories\Traits;

trait HasSalesOrderItemStates
{
    /**
     * Generate data for pending item
     */
    public function pending(): static
    {
        return $this->state(fn () => [
            'item_status' => 'pending',
            'allocated_quantity' => 0,
            'quantity_fulfilled' => 0,
            'quantity_shipped' => 0,
            'allocated_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for confirmed item
     */
    public function confirmed(): static
    {
        return $this->state(fn () => [
            'item_status' => 'confirmed',
            'allocated_quantity' => 0,
            'quantity_fulfilled' => 0,
            'quantity_shipped' => 0,
            'allocated_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate data for allocated item
     */
    public function allocated(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? 10;
            $allocatedQuantity = $this->faker->numberBetween(1, $quantityOrdered);
            
            return [
                'item_status' => 'allocated',
                'allocated_quantity' => $allocatedQuantity,
                'quantity_fulfilled' => 0,
                'quantity_shipped' => 0,
                'allocated_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
                'allocation_expires_at' => $this->faker->dateTimeBetween('+1 day', '+1 week'),
                'fulfilled_at' => null,
                'shipped_at' => null,
                'delivered_at' => null,
            ];
        });
    }

    /**
     * Generate data for partially fulfilled item
     */
    public function partiallyFulfilled(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? 10;
            $quantityFulfilled = $this->faker->numberBetween(1, $quantityOrdered - 1);
            
            return [
                'item_status' => 'partially_fulfilled',
                'allocated_quantity' => $quantityOrdered,
                'quantity_fulfilled' => $quantityFulfilled,
                'quantity_shipped' => 0,
                'allocated_at' => $this->faker->dateTimeBetween('-2 weeks', '-1 week'),
                'fulfilled_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
                'shipped_at' => null,
                'delivered_at' => null,
            ];
        });
    }

    /**
     * Generate data for fully fulfilled item
     */
    public function fullyFulfilled(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? 10;
            
            return [
                'item_status' => 'fully_fulfilled',
                'allocated_quantity' => $quantityOrdered,
                'quantity_fulfilled' => $quantityOrdered,
                'quantity_shipped' => 0,
                'allocated_at' => $this->faker->dateTimeBetween('-2 weeks', '-1 week'),
                'fulfilled_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
                'fulfillment_notes' => $this->faker->optional(0.3)->sentence(),
                'shipped_at' => null,
                'delivered_at' => null,
            ];
        });
    }

    /**
     * Generate data for shipped item
     */
    public function shipped(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? 10;
            
            return [
                'item_status' => 'shipped',
                'allocated_quantity' => $quantityOrdered,
                'quantity_fulfilled' => $quantityOrdered,
                'quantity_shipped' => $quantityOrdered,
                'allocated_at' => $this->faker->dateTimeBetween('-3 weeks', '-2 weeks'),
                'fulfilled_at' => $this->faker->dateTimeBetween('-2 weeks', '-1 week'),
                'shipped_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
                'fulfillment_notes' => $this->faker->optional(0.4)->sentence(),
                'delivered_at' => null,
            ];
        });
    }

    /**
     * Generate data for delivered item
     */
    public function delivered(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? 10;
            
            return [
                'item_status' => 'delivered',
                'allocated_quantity' => $quantityOrdered,
                'quantity_fulfilled' => $quantityOrdered,
                'quantity_shipped' => $quantityOrdered,
                'allocated_at' => $this->faker->dateTimeBetween('-4 weeks', '-3 weeks'),
                'fulfilled_at' => $this->faker->dateTimeBetween('-3 weeks', '-2 weeks'),
                'shipped_at' => $this->faker->dateTimeBetween('-2 weeks', '-1 week'),
                'delivered_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
                'fulfillment_notes' => $this->faker->optional(0.4)->sentence(),
            ];
        });
    }

    /**
     * Generate data for backordered item
     */
    public function backordered(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? 10;
            $backorderedQuantity = $this->faker->numberBetween(1, $quantityOrdered);
            
            return [
                'item_status' => 'backordered',
                'quantity_backordered' => $backorderedQuantity,
                'allocated_quantity' => 0,
                'quantity_fulfilled' => 0,
                'quantity_shipped' => 0,
                'allocated_at' => null,
                'fulfilled_at' => null,
                'shipped_at' => null,
                'delivered_at' => null,
            ];
        });
    }

    /**
     * Generate data for item with discount
     */
    public function withDiscount(): static
    {
        return $this->state(function (array $attributes) {
            $lineTotal = $attributes['line_total'] ?? 100;
            $discountPercentage = $this->faker->randomFloat(4, 0.05, 0.15); // 5% to 15% as decimal
            $discountAmount = $lineTotal * $discountPercentage;
            
            return [
                'discount_percentage' => $discountPercentage,
                'discount_amount' => $discountAmount,
                'final_line_total' => $lineTotal - $discountAmount,
            ];
        });
    }
}