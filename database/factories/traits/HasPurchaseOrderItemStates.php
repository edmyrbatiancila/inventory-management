<?php

namespace Database\Factories\Traits;

use App\Models\PurchaseOrderItem;

trait HasPurchaseOrderItemStates
{
    /**
     * Generate data for pending item
     */
    public function pending(): static
    {
        return $this->state(fn () => [
            'item_status' => PurchaseOrderItem::STATUS_PENDING,
            'quantity_received' => 0,
            'quantity_rejected' => 0,
            'last_received_at' => null,
            'receiving_notes' => null,
        ]);
    }

    /**
     * Generate data for partially received item
     */
    public function partiallyReceived(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? $this->faker->numberBetween(10, 100);
            $quantityReceived = $this->faker->numberBetween(1, $quantityOrdered - 1);
            
            return [
                'item_status' => PurchaseOrderItem::STATUS_PARTIALLY_RECEIVED,
                'quantity_received' => $quantityReceived,
                'quantity_rejected' => 0,
                'last_received_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            ];
        });
    }

    /**
     * Generate data for fully received item
     */
    public function fullyReceived(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? $this->faker->numberBetween(10, 100);
            
            return [
                'item_status' => PurchaseOrderItem::STATUS_FULLY_RECEIVED,
                'quantity_received' => $quantityOrdered,
                'quantity_rejected' => 0,
                'last_received_at' => $this->faker->dateTimeBetween('-2 weeks', '-1 day'),
            ];
        });
    }

    /**
     * Generate data for item with quality issues
     */
    public function withQualityIssues(): static
    {
        return $this->state(function (array $attributes) {
            $quantityOrdered = $attributes['quantity_ordered'] ?? $this->faker->numberBetween(10, 100);
            $quantityReceived = $this->faker->numberBetween(1, $quantityOrdered);
            $quantityRejected = $this->faker->numberBetween(1, min(5, $quantityReceived));
            
            return [
                'quantity_received' => $quantityReceived,
                'quantity_rejected' => $quantityRejected,
                'rejection_reason' => $this->faker->randomElement([
                    'Damaged packaging detected',
                    'Product quality below standards',
                    'Incorrect specifications',
                    'Missing components',
                    'Expired products received'
                ]),
                'last_received_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            ];
        });
    }

    /**
     * Generate data for backordered item
     */
    public function backordered(): static
    {
        return $this->state(fn () => [
            'item_status' => PurchaseOrderItem::STATUS_BACKORDERED,
            'quantity_received' => 0,
            'notes' => 'Item currently on backorder with supplier',
        ]);
    }

    /**
     * Generate data for discounted item
     */
    public function withDiscount(?float $discountPercentage = null): static
    {
        $discount = $discountPercentage ?? $this->faker->randomFloat(4, 0.05, 0.15); // 5% to 15% as decimal
        
        return $this->state(function (array $attributes) use ($discount) {
            $unitCost = $attributes['unit_cost'] ?? $this->faker->randomFloat(2, 10, 1000);
            $quantityOrdered = $attributes['quantity_ordered'] ?? $this->faker->numberBetween(1, 100);
            $lineTotal = $unitCost * $quantityOrdered;
            $discountAmount = $lineTotal * ($discount / 100);
            
            return [
                'discount_percentage' => $discount,
                'discount_amount' => $discountAmount,
                'final_line_total' => $lineTotal - $discountAmount,
            ];
        });
    }
}