<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\StockAdjustment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockAdjustment>
 */
class StockAdjustmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {   
        $adjustmentType = $this->faker->randomElement(['increase', 'decrease']);
        $quantityAdjusted = $this->faker->numberBetween(1, 100);
        $quantityBefore = $this->faker->numberBetween(50, 500);
        
        // Calculate quantity_after based on adjustment type
        $quantityAfter = $adjustmentType === 'increase' 
            ? $quantityBefore + $quantityAdjusted
            : max(0, $quantityBefore - $quantityAdjusted);

        $reasons = [
            'damage', 'theft', 'found', 'expired', 'returned',
            'transfer_in', 'transfer_out', 'correction', 'recount', 'other'
        ];


        return [
            'inventory_id' => Inventory::factory(),
            'adjustment_type' => $adjustmentType,
            'quantity_adjusted' => $quantityAdjusted,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'reason' => $this->faker->randomElement($reasons),
            'notes' => $this->faker->optional(0.7)->sentence(),
            'reference_number' => StockAdjustment::generateReferenceNumber(),
            'adjusted_by' => User::factory(),
            'adjusted_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }

    /**
     * Create a stock increase adjustment
     */
    public function increase(): static
    {
        return $this->state(function (array $attributes) {
            $quantityBefore = $this->faker->numberBetween(50, 500);
            $quantityAdjusted = $this->faker->numberBetween(10, 100);
            
            return [
                'adjustment_type' => 'increase',
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityBefore + $quantityAdjusted,
                'reason' => $this->faker->randomElement(['found', 'returned', 'transfer_in', 'correction']),
            ];
        });
    }

    /**
     * Create a stock decrease adjustment
     */
    public function decrease(): static
    {
        return $this->state(function (array $attributes) {
            $quantityBefore = $this->faker->numberBetween(50, 500);
            $quantityAdjusted = $this->faker->numberBetween(1, min(50, $quantityBefore));
            
            return [
                'adjustment_type' => 'decrease',
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityBefore - $quantityAdjusted,
                'reason' => $this->faker->randomElement(['damage', 'theft', 'expired', 'transfer_out']),
            ];
        });
    }

    /**
     * Create adjustments for damaged goods
     */
    public function damaged(): static
    {
        return $this->state(function (array $attributes) {
            $quantityBefore = $this->faker->numberBetween(20, 200);
            $quantityAdjusted = $this->faker->numberBetween(1, min(20, $quantityBefore));
            
            return [
                'adjustment_type' => 'decrease',
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityBefore - $quantityAdjusted,
                'reason' => 'damage',
                'notes' => $this->faker->randomElement([
                    'Items damaged during transport',
                    'Water damage in storage area',
                    'Products expired due to storage conditions',
                    'Packaging defects found during inspection'
                ]),
            ];
        });
    }

    /**
     * Create adjustments for found inventory
     */
    public function found(): static
    {
        return $this->state(function (array $attributes) {
            $quantityBefore = $this->faker->numberBetween(10, 100);
            $quantityAdjusted = $this->faker->numberBetween(1, 30);
            
            return [
                'adjustment_type' => 'increase',
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityBefore + $quantityAdjusted,
                'reason' => 'found',
                'notes' => $this->faker->randomElement([
                    'Items found during physical count',
                    'Previously misplaced inventory located',
                    'Items discovered in different warehouse section',
                    'Stock found after reorganization'
                ]),
            ];
        });
    }

    /**
     * Create recent adjustments (within last 30 days)
     */
    public function recent(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'adjusted_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            ];
        });
    }
}
