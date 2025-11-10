<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Make sure we have users, products, and warehouses
        $this->ensureDataExists();

        // Seed stock movements
        $this->seedStockMovements();
    }

    /**
     * Ensure we have the necessary data to create stock movements
     */
    private function ensureDataExists(): void
    {
        // Create users if none exist
        if (User::count() === 0) {
            User::factory(5)->create();
        }

        // Create warehouses if none exist
        if (Warehouse::count() === 0) {
            Warehouse::factory(3)->create([
                'is_active' => true
            ]);
        }

        // Create products if none exist
        if (Product::count() === 0) {
            Product::factory(20)->create([
                'is_active' => true,
                'track_quantity' => true
            ]);
        }
    }

    /**
     * Seed various types of stock movements
     */
    private function seedStockMovements(): void
    {
        $products = Product::take(10)->get();
        $warehouses = Warehouse::take(3)->get();
        $users = User::take(5)->get();

        // Create a variety of stock movements
        foreach ($products as $product) {
            foreach ($warehouses as $warehouse) {
                // Create some historical movements for each product-warehouse combination
                $this->createMovementsForProductWarehouse($product, $warehouse, $users);
            }
        }

        // Create some additional random movements
        $this->createRandomMovements(50);

        // Create some recent pending movements
        $this->createPendingMovements(10);

        $this->command->info('Created ' . StockMovement::count() . ' stock movements');
    }

    /**
     * Create movements for a specific product-warehouse combination
     */
    private function createMovementsForProductWarehouse(Product $product, Warehouse $warehouse, $users): void
    {
        $currentQuantity = rand(100, 500); // Starting inventory

        // Initial stock receipt
        StockMovement::factory()->create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'user_id' => $users->random()->id,
            'movement_type' => 'purchase_receive',
            'quantity_before' => 0,
            'quantity_moved' => $currentQuantity,
            'quantity_after' => $currentQuantity,
            'status' => 'applied',
            'approved_by' => $users->random()->id,
            'approved_at' => now()->subDays(rand(30, 60)),
            'created_at' => now()->subDays(rand(30, 60)),
        ]);

        // Create 3-5 movements for each combination
        $movementCount = rand(3, 5);
        
        for ($i = 0; $i < $movementCount; $i++) {
            $movementTypes = [
                'sale_fulfill' => -rand(1, 20),      // Sales (decrease)
                'adjustment_increase' => rand(1, 15), // Adjustments (increase)
                'adjustment_decrease' => -rand(1, 10), // Adjustments (decrease)
                'transfer_in' => rand(1, 25),         // Transfer in (increase)
                'transfer_out' => -rand(1, 20),       // Transfer out (decrease)
                'return_customer' => rand(1, 5),      // Customer returns (increase)
            ];

            $movementType = array_rand($movementTypes);
            $quantityMoved = $movementTypes[$movementType];
            
            // Ensure we don't go below 0
            if ($quantityMoved < 0 && abs($quantityMoved) > $currentQuantity) {
                $quantityMoved = -max(1, floor($currentQuantity / 2));
            }

            $quantityBefore = $currentQuantity;
            $currentQuantity = $quantityBefore + $quantityMoved;

            StockMovement::factory()->create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'user_id' => $users->random()->id,
                'movement_type' => $movementType,
                'quantity_before' => $quantityBefore,
                'quantity_moved' => $quantityMoved,
                'quantity_after' => $currentQuantity,
                'status' => 'applied',
                'approved_by' => $users->random()->id,
                'approved_at' => now()->subDays(rand(1, 30)),
                'created_at' => now()->subDays(rand(1, 30)),
            ]);
        }
    }

    /**
     * Create random additional movements
     */
    private function createRandomMovements(int $count): void
    {
        $products = Product::all();
        $warehouses = Warehouse::all();
        $users = User::all();

        for ($i = 0; $i < $count; $i++) {
            StockMovement::factory()->create([
                'product_id' => $products->random()->id,
                'warehouse_id' => $warehouses->random()->id,
                'user_id' => $users->random()->id,
                'status' => 'applied',
                'approved_by' => $users->random()->id,
                'approved_at' => now()->subDays(rand(1, 45)),
                'created_at' => now()->subDays(rand(1, 45)),
            ]);
        }
    }

    /**
     * Create pending movements for testing approval workflow
     */
    private function createPendingMovements(int $count): void
    {
        $products = Product::all();
        $warehouses = Warehouse::all();
        $users = User::all();

        for ($i = 0; $i < $count; $i++) {
            $product = $products->random();
            $warehouse = $warehouses->random();
            
            // Get a reasonable starting quantity
            $quantityBefore = rand(50, 200);
            
            $movementType = collect([
                'adjustment_increase',
                'adjustment_decrease', 
                'damage_write_off',
                'return_customer'
            ])->random();

            $isIncrease = in_array($movementType, ['adjustment_increase', 'return_customer']);
            $quantityMoved = $isIncrease 
                ? rand(1, 20) 
                : -rand(1, min(20, floor($quantityBefore / 2)));

            StockMovement::factory()->create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'user_id' => $users->random()->id,
                'movement_type' => $movementType,
                'quantity_before' => $quantityBefore,
                'quantity_moved' => $quantityMoved,
                'quantity_after' => $quantityBefore + $quantityMoved,
                'status' => 'pending',
                'approved_by' => null,
                'approved_at' => null,
                'created_at' => now()->subDays(rand(0, 7)),
            ]);
        }
    }
}
