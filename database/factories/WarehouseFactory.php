<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Warehouse>
 */
class WarehouseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Distribution Center', 'Warehouse', 'Storage Facility', 'Fulfillment Center']) . ' - ' . $this->faker->city(),
            'code' => $this->faker->unique()->bothify('WH###'),
            'phone' => $this->faker->optional(0.7)->phoneNumber(),
            'email' => $this->faker->optional(0.6)->email(),
            'is_active' => $this->faker->boolean(90),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
        ];
    }

    public function distributionCenter()
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Distribution Center - ' . $this->faker->city(),
            'code' => $this->faker->unique()->bothify('DC###'),
        ]);
    }

    public function regionalHub()
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Regional Hub - ' . $this->faker->city(),
            'code' => $this->faker->unique()->bothify('RH###'),
        ]);
    }

    public function retailStore()
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->company() . ' Store',
            'code' => $this->faker->unique()->bothify('ST###'),
        ]);
    }
}
