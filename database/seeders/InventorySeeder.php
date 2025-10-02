<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check Dependencies
        if (Product::count() === 0) {
            $this->command->info('No products found. Please run ProductSeeder first.');
            return;
        }

        if (Warehouse::where('is_active', true)->count() === 0) {
            $this->command->info('No active warehouses found. Please run WarehouseSeeder first.');
            return;
        }

        $this->command->info('Creating inventory records...');

        // 60% Strategic Distribution
        $this->createStrategicInventory();

        // 40% Random Distribution  
        $this->createRandomInventory();

        // Specific demo scenarios
        $this->createDemoScenarios();

        $this->command->info('Inventory created successfully!');
    }

    private function createStrategicInventory(): void
    {
        $this->command->info('Creating strategic inventory...');

        // Get key warehouses
        $mainDC = Warehouse::where('code', 'MAIN-DC')->first();
        $eastHub = Warehouse::where('code', 'EAST-HUB')->first();
        $westStorage = Warehouse::where('code', 'WEST-SF')->first();

        // Get popular products (first 30 products)
        $popularProducts = Product::where('is_active', true)
            ->where('track_quantity', true)
            ->take(30)
            ->get();

        // Main DC gets high stock of popular products
        if ($mainDC) {
            foreach ($popularProducts->take(20) as $product) {
                Inventory::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $mainDC->id
                    ],
                    [
                        'quantity_on_hand' => fake()->numberBetween(200, 1000),
                        'quantity_reserved' => fake()->numberBetween(0, 20),
                    ]
                );
            }
        }

        // East Hub gets medium stock of popular products
        if ($eastHub) {
            foreach ($popularProducts->skip(5)->take(15) as $product) {
                Inventory::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $eastHub->id
                    ],
                    [
                        'quantity_on_hand' => fake()->numberBetween(50, 200),
                        'quantity_reserved' => fake()->numberBetween(0, 10),
                    ]
                );
            }
        }

        // West Storage gets varied stock
        if ($westStorage) {
            foreach ($popularProducts->skip(10)->take(10) as $product) {
                Inventory::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $westStorage->id
                    ],
                    [
                        'quantity_on_hand' => fake()->numberBetween(10, 150),
                        'quantity_reserved' => fake()->numberBetween(0, 5),
                    ]
                );
            }
        }

        // Distribute remaining products to random active warehouses
        $remainingProducts = Product::where('is_active', true)
            ->where('track_quantity', true)
            ->skip(30)
            ->take(20)
            ->get();

        $activeWarehouses = Warehouse::where('is_active', true)->get();

        foreach ($remainingProducts as $product) {
            // Each product goes to 1-3 random warehouses
            $warehouseCount = fake()->numberBetween(1, 3);
            $selectedWarehouses = $activeWarehouses->random($warehouseCount);

            foreach ($selectedWarehouses as $warehouse) {
                Inventory::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id
                    ],
                    [
                        'quantity_on_hand' => fake()->numberBetween(0, 500),
                        'quantity_reserved' => fake()->numberBetween(0, 50),
                    ]
                );
            }
        }
    }

    private function createRandomInventory(): void
    {
        $this->command->info('Creating random inventory distribution...');

        // Get available products and warehouses that don't already have inventory
        $activeProducts = Product::where('is_active', true)
            ->where('track_quantity', true)
            ->get();
        
        $activeWarehouses = Warehouse::where('is_active', true)->get();

        // Create various inventory scenarios using factory states with duplicate prevention
        
        // High stock items (20 records)
        $this->createInventoryWithoutDuplicates($activeProducts, $activeWarehouses, 'highStock', 20);

        // Low stock items (15 records)  
        $this->createInventoryWithoutDuplicates($activeProducts, $activeWarehouses, 'lowStock', 15);

        // Out of stock items (10 records)
        $this->createInventoryWithoutDuplicates($activeProducts, $activeWarehouses, 'outOfStock', 10);

        // High reservation items (10 records)
        $this->createInventoryWithoutDuplicates($activeProducts, $activeWarehouses, 'highReservation', 10);

        // Regular inventory (30 records)
        $this->createInventoryWithoutDuplicates($activeProducts, $activeWarehouses, 'default', 30);
    }

    private function createInventoryWithoutDuplicates($products, $warehouses, $factoryState, $count): void
    {
        $created = 0;
        $attempts = 0;
        $maxAttempts = $count * 3; // Allow some attempts to find unique combinations

        while ($created < $count && $attempts < $maxAttempts) {
            $attempts++;
            
            $product = $products->random();
            $warehouse = $warehouses->random();

            // Check if this combination already exists
            if (Inventory::where('product_id', $product->id)
                       ->where('warehouse_id', $warehouse->id)
                       ->exists()) {
                continue; // Skip this combination, it already exists
            }

            try {
                // Create inventory based on factory state
                if ($factoryState === 'default') {
                    Inventory::factory()->create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id
                    ]);
                } else {
                    Inventory::factory()->{$factoryState}()->create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id
                    ]);
                }
                $created++;
            } catch (\Exception $e) {
                // Skip if there's still a duplicate (race condition)
                continue;
            }
        }

        if ($created < $count) {
            $this->command->warn("Only created {$created} out of {$count} {$factoryState} inventory records (not enough unique combinations available)");
        }
    }

    private function createDemoScenarios(): void
    {
        $this->command->info('Creating demo scenarios...');

        // Get specific products for demo
        $macbook = Product::where('sku', 'LAPTOP-MBP16-001')->first();
        $smartphone = Product::where('sku', 'PHONE-BSX1-001')->first();
    
        // Get specific warehouses
        $mainDC = Warehouse::where('code', 'MAIN-DC')->first();
        $eastHub = Warehouse::where('code', 'EAST-HUB')->first();
        $oldWarehouse = Warehouse::where('code', 'OLD-WH')->first();

        // Demo Scenario 1: MacBook with high stock in Main DC
        if ($macbook && $mainDC) {
            Inventory::firstOrCreate(
                [
                    'product_id' => $macbook->id,
                    'warehouse_id' => $mainDC->id,
                ],
                [
                    'quantity_on_hand' => 25,
                    'quantity_reserved' => 3,
                ]
            );
        }

        // Demo Scenario 2: MacBook with low stock in East Hub
        if ($macbook && $eastHub) {
            Inventory::firstOrCreate(
                [
                    'product_id' => $macbook->id,
                    'warehouse_id' => $eastHub->id,
                ],
                [
                    'quantity_on_hand' => 2, // Below min_stock_level
                    'quantity_reserved' => 1,
                ]
            );
        }

        // Demo Scenario 3: Smartphone with high reservations
        if ($smartphone && $mainDC) {
            Inventory::firstOrCreate(
                [
                    'product_id' => $smartphone->id,
                    'warehouse_id' => $mainDC->id,
                ],
                [
                    'quantity_on_hand' => 100,
                    'quantity_reserved' => 75, // High reservation rate
                ]
            );
        }

        // Demo Scenario 4: Out of stock in old warehouse
        if ($smartphone && $oldWarehouse) {
            Inventory::firstOrCreate(
                [
                    'product_id' => $smartphone->id,
                    'warehouse_id' => $oldWarehouse->id,
                ],
                [
                    'quantity_on_hand' => 0,
                    'quantity_reserved' => 0,
                ]
            );
        }
    }
}
