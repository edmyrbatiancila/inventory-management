<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InventoryMovement>
 */
class InventoryMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get existing inventory record to base movement on
        $inventory = Inventory::with(['product', 'warehouse'])
            ->inRandomOrder()
            ->first();

        if (!$inventory) {
            // Fallback if no inventory exists
            $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
            $warehouse = Warehouse::where('is_active', true)->inRandomOrder()->first() ?? Warehouse::factory()->create();
        } else {
            $product = $inventory->product;
            $warehouse = $inventory->warehouse;
        }

        $movementType = $this->faker->randomElement(['stock_in', 'stock_out', 'adjustment_in', 'adjustment_out', 'transfer_in', 'transfer_out']);
        $quantity = $this->faker->numberBetween(1, 50);
        $quantityBefore = $inventory ? $inventory->quantity_on_hand : $this->faker->numberBetween(0, 100);

                // Calculate quantity after based on movement type
        $quantityAfter = match($movementType) {
            'stock_in', 'adjustment_in', 'transfer_in' => $quantityBefore + $quantity,
            'stock_out', 'adjustment_out', 'transfer_out' => max(0, $quantityBefore - $quantity),
            default => $quantityBefore
        };

        return [
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'type' => $movementType,
            'quantity' => $movementType === 'out' || $movementType === 'transfer' ? -$quantity : $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'reference_type' => $this->faker->optional(0.7)->randomElement([
                'purchase_order', 'sale', 'adjustment', 'transfer', 'return', 'damage'
            ]),
            'reference_id' => $this->faker->optional(0.5)->numberBetween(1000, 9999),
            'notes' => $this->faker->optional(0.6)->sentence(),
            'movement_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function stockIn()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'stock_in',
            'quantity' => $this->faker->numberBetween(10, 100),
            'reference_type' => $this->faker->randomElement(['purchase_order', 'return', 'adjustment']),
            'notes' => 'Stock received - ' . $this->faker->sentence(3),
        ]);
    }

    public function stockOut()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'stock_out',
            'quantity' => -$this->faker->numberBetween(1, 20),
            'reference_type' => $this->faker->randomElement(['sale', 'damage', 'theft']),
            'notes' => 'Stock removed - ' . $this->faker->sentence(3),
        ]);
    }

    public function adjustment()
    {
        $isIncrease = $this->faker->boolean();
        return $this->state(fn (array $attributes) => [
            'type' => $isIncrease ? 'adjustment_in' : 'adjustment_out',
            'quantity' => $isIncrease ? 
                $this->faker->numberBetween(1, 10) : 
                -$this->faker->numberBetween(1, 10),
            'reference_type' => 'adjustment',
            'notes' => 'Inventory adjustment - ' . $this->faker->randomElement([
                'Cycle count correction',
                'Damaged goods removal',
                'Found missing items',
                'System correction'
            ]),
        ]);
    }

    public function transfer()
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'transfer_out',
            'quantity' => -$this->faker->numberBetween(5, 25),
            'reference_type' => 'transfer',
            'notes' => 'Stock transfer to ' . $this->faker->randomElement([
                'Main Distribution Center',
                'Regional Hub',
                'Retail Store'
            ]),
        ]);
    }

    public function recentMovement()
    {
        return $this->state(fn (array $attributes) => [
            'movement_date' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function oldMovement()
    {
        return $this->state(fn (array $attributes) => [
            'movement_date' => $this->faker->dateTimeBetween('-90 days', '-30 days'),
        ]);
    }
}
