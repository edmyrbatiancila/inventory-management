<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have categories and brands first
        if (Category::count() === 0) {
            $this->command->info('No categories found. Please run CategorySeeder first.');
            return;
        }

        if (Brand::count() === 0) {
            $this->command->info('No brands found. Please run BrandSeeder first.');
            return;
        }

        $this->command->info('Creating products...');

        // Create 30 regular products
        Product::factory()
            ->count(30)
            ->create();

        // Create 10 electronics products
        Product::factory()
            ->electronics()
            ->count(10)
            ->create();

        // Create 15 clothing products
        Product::factory()
            ->clothing()
            ->count(15)
            ->create();

        // Create some specific products for demo
        $this->createSpecificProducts();

        $this->command->info('Products created successfully!');
    }

    /**
     * Create specific products for demo purposes
     */
    private function createSpecificProducts(): void
    {
        // Get existing categories and brands
        $electronicsCategory = Category::where('name', 'like', '%Electronics%')->first() 
                            ?? Category::first();
        $clothingCategory = Category::where('name', 'like', '%Clothing%')->first() 
                          ?? Category::skip(1)->first() ?? Category::first();
        
        $brand1 = Brand::first();
        $brand2 = Brand::skip(1)->first() ?? Brand::first();

        // High-end laptop
        Product::factory()->create([
            'name' => 'MacBook Pro 16-inch',
            'description' => 'High-performance laptop with M2 Pro chip, perfect for professionals and creators.',
            'price' => 2499.00,
            'cost_price' => 1899.00,
            'category_id' => $electronicsCategory->id,
            'brand_id' => $brand1->id,
            'sku' => 'LAPTOP-MBP16-001',
            'min_stock_level' => 2,
            'max_stock_level' => 20,
            'specifications' => [
                'processor' => 'Apple M2 Pro',
                'memory' => '16GB RAM',
                'storage' => '512GB SSD',
                'display' => '16.2-inch Liquid Retina XDR',
                'weight' => '2.15kg',
                'warranty' => '1 year'
            ]
        ]);

        // Budget smartphone
        Product::factory()->create([
            'name' => 'Budget Smartphone X1',
            'description' => 'Affordable smartphone with essential features for everyday use.',
            'price' => 199.99,
            'cost_price' => 149.99,
            'category_id' => $electronicsCategory->id,
            'brand_id' => $brand2->id,
            'sku' => 'PHONE-BSX1-001',
            'min_stock_level' => 10,
            'max_stock_level' => 100,
            'specifications' => [
                'display' => '6.1-inch LCD',
                'storage' => '64GB',
                'camera' => '12MP main camera',
                'battery' => '3000mAh',
                'weight' => '180g'
            ]
        ]);

        // Premium t-shirt
        Product::factory()->create([
            'name' => 'Premium Cotton T-Shirt',
            'description' => 'Comfortable and stylish t-shirt made from 100% organic cotton.',
            'price' => 29.99,
            'cost_price' => 12.50,
            'category_id' => $clothingCategory->id,
            'brand_id' => $brand1->id,
            'sku' => 'SHIRT-PCT-001',
            'min_stock_level' => 20,
            'max_stock_level' => 200,
            'specifications' => [
                'material' => '100% Organic Cotton',
                'fit' => 'Regular',
                'care' => 'Machine wash cold',
                'sizes_available' => ['XS', 'S', 'M', 'L', 'XL', 'XXL']
            ]
        ]);

        // Out of stock product for testing
        Product::factory()->create([
            'name' => 'Limited Edition Watch',
            'description' => 'Exclusive timepiece with limited availability.',
            'price' => 599.99,
            'cost_price' => 350.00,
            'category_id' => $electronicsCategory->id,
            'brand_id' => $brand2->id,
            'sku' => 'WATCH-LE-001',
            'min_stock_level' => 1,
            'max_stock_level' => 5,
            'is_active' => false, // Temporarily inactive
            'specifications' => [
                'case_material' => 'Stainless Steel',
                'band_material' => 'Leather',
                'water_resistance' => '50m',
                'movement' => 'Automatic'
            ]
        ]);
    }
}
