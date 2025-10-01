<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = $this->faker->randomFloat(2, 10, 1000); // $10.00 to $1000.00
        $costPrice = $price * $this->faker->randomFloat(2, 0.3, 0.8); // Cost is 30-80% of selling price
        
        $productName = $this->faker->randomElement([
            'Wireless Mouse', 'Gaming Keyboard', 'USB Cable', 'Monitor Stand',
            'Desk Lamp', 'Coffee Mug', 'Water Bottle', 'Notebook', 'Pen Set',
            'Phone Case', 'Laptop Bag', 'Power Bank', 'Bluetooth Speaker',
            'T-Shirt', 'Jeans', 'Sneakers', 'Jacket', 'Hat'
        ]);

        return [
            'name' => $productName . ' ' . $this->faker->word(),
            'slug' => $this->faker->unique()->slug(3), // "wireless-mouse-pro"
            'description' => $this->faker->sentence(10),
            'sku' => $this->faker->unique()->bothify('??###-???-##'), // "AB123-XYZ-45"
            'barcode' => $this->faker->optional(0.7)->ean13(), // 70% chance of having barcode
            'price' => $price,
            'cost_price' => round($costPrice, 2), // Cost lower than price
            'category_id' => Category::inRandomOrder()->first()?->id ?? Category::factory(),
            'brand_id' => Brand::inRandomOrder()->first()?->id ?? Brand::factory(),
            'min_stock_level' => $this->faker->numberBetween(5, 20),
            'max_stock_level' => $this->faker->numberBetween(100, 500),
            'images' => $this->faker->randomElements([
                'products/product1.jpg', 'products/product2.jpg', 'products/product3.jpg',
                'products/product4.jpg', 'products/product5.jpg'
            ], $this->faker->numberBetween(1, 3)),
            'specifications' => [
                'weight' => $this->faker->randomFloat(2, 0.1, 5) . 'kg',
                'dimensions' => $this->faker->randomElement(['10x5x2cm', '15x10x3cm', '20x15x5cm']),
                'color' => $this->faker->colorName(),
                'material' => $this->faker->randomElement(['Plastic', 'Metal', 'Wood', 'Glass']),
                'country_of_origin' => $this->faker->country()
            ],
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'track_quantity' => $this->faker->boolean(95), // 95% chance of tracking quantity
        ];
    }

    public function electronics()
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement(['Smartphone', 'Laptop', 'Tablet', 'Headphones']),
            'specifications' => [
                'brand' => $this->faker->company(),
                'model' => $this->faker->bothify('Model-###'),
                'warranty' => $this->faker->randomElement(['1 year', '2 years', '3 years']),
            ],
        ]);
    }

    public function clothing()
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement(['T-Shirt', 'Jeans', 'Jacket', 'Sneakers']),
            'specifications' => [
                'size' => $this->faker->randomElement(['XS', 'S', 'M', 'L', 'XL']),
                'color' => $this->faker->colorName(),
                'material' => $this->faker->randomElement(['Cotton', 'Polyester', 'Denim', 'Leather']),
            ],
        ]);
    }
}
