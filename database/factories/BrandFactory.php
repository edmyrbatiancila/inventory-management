<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Brand>
 */
class BrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brandName = $this->faker->unique()->company();
        return [
            'name' => $brandName,
            'description' => $this->faker->sentence(),
            'slug' => $this->faker->unique()->slug(),
            'logo_url' => $this->faker->imageUrl(200, 200, 'business'),
            'website_url' => $this->faker->url(),
            'is_active' => $this->faker->boolean(80) // 80%
        ];
    }
}
