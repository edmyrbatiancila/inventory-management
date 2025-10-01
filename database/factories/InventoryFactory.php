<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inventory>
 */
class InventoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $quantityOnHand = $this->faker->numberBetween(0, 500);
        $quantityReserved = $this->faker->numberBetween(0, min($quantityOnHand, 50)); // Never more than on_hand

        return [
            'product_id' => Product::inRandomOrder()->first()?->id ?? Product::factory(),
            'warehouse_id' => Warehouse::where('is_active', true)->inRandomOrder()->first()?->id ?? Warehouse::factory(),
            'quantity_on_hand' => $quantityOnHand,
            'quantity_reserved' => $quantityReserved,
        ];
    }

    public function highStock()
    {
        return $this->state(fn (array $attributes) => [
            'quantity_on_hand' => $this->faker->numberBetween(200, 1000),
            'quantity_reserved' => $this->faker->numberBetween(0, 20),
        ]);
    }

    public function lowStock()
    {
        return $this->state(fn (array $attributes) => [
            'quantity_on_hand' => $this->faker->numberBetween(1, 10),
            'quantity_reserved' => $this->faker->numberBetween(0, 3),
        ]);
    }

    public function outOfStock()
    {
        return $this->state(fn (array $attributes) => [
            'quantity_on_hand' => 0,
            'quantity_reserved' => 0,
        ]);
    }

    public function highReservation()
    {
        $onHand = $this->faker->numberBetween(100, 300);
        return $this->state(fn (array $attributes) => [
            'quantity_on_hand' => $onHand,
            'quantity_reserved' => $this->faker->numberBetween(50, min($onHand, 150)),
        ]);
    }
}
