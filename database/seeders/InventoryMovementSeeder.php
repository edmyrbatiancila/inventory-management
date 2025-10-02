<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventoryMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check Dependencies
        if (Inventory::count() === 0) {
            $this->command->info('No inventory records found. Please run InventorySeeder first.');
            return;
        }

        $this->command->info('Creating inventory movement records...');

        // Create historical movements for existing inventory
        $this->createHistoricalMovements();

        // Create recent movements
        $this->createRecentMovements();

        // Create specific demo movements
        $this->createDemoMovements();

        $this->command->info('Inventory movements created successfully!');
    }

    private function createHistoricalMovements(): void
    {
        $this->command->info('Creating historical inventory movements...');

        // Get all inventory records
        $inventories = Inventory::with(['product', 'warehouse'])->get();

        foreach ($inventories as $inventory) {
            // Create 3-8 historical movements per inventory record
            $movementCount = fake()->numberBetween(3, 8);

            // Start with initial stock in
            $currentStock = 0;
            $movementDate = Carbon::now()->subDays(60);

            // Initial stock receipt
            $initialQuantity = fake()->numberBetween(50, 200);
            $this->createMovement($inventory, 'in', $initialQuantity, $currentStock, $movementDate);
            $currentStock += $initialQuantity;

            // Create subsequent movements
            for ($i = 1; $i < $movementCount; $i++) {
                $movementDate = $movementDate->addDays(fake()->numberBetween(1, 10));
                
                $movementType = fake()->randomElement(['in', 'out', 'adjustment']);
                $quantity = $this->getQuantityForMovement($movementType, $currentStock);
                
                $this->createMovement($inventory, $movementType, $quantity, $currentStock, $movementDate);
                
                $currentStock += $quantity;
                $currentStock = max(0, $currentStock); // Never go below 0
            }

            // Update final inventory to match movement history
            $inventory->update([
                'quantity_on_hand' => $currentStock,
                'quantity_available' => max(0, $currentStock - $inventory->quantity_reserved)
            ]);
        }
    }

    private function createRecentMovements(): void
    {
        $this->command->info('Creating recent movements...');

        // Recent stock in movements (15 records)
        InventoryMovement::factory()->stockIn()->recentMovement()->count(15)->create();

        // Recent stock out movements (10 records)
        InventoryMovement::factory()->stockOut()->recentMovement()->count(10)->create();

        // Recent adjustments (5 records)
        InventoryMovement::factory()->adjustment()->recentMovement()->count(5)->create();

        // Recent transfers (8 records)
        InventoryMovement::factory()->transfer()->recentMovement()->count(8)->create();
    }

    private function createDemoMovements(): void
    {
        $this->command->info('Creating demo movements...');

        // Get specific products and warehouses for demo
        $macbook = Product::where('sku', 'LAPTOP-MBP16-001')->first();
        $mainDC = Warehouse::where('code', 'MAIN-DC')->first();
        $eastHub = Warehouse::where('code', 'EAST-HUB')->first();

        if ($macbook && $mainDC && $eastHub) {
            // MacBook movement history
            $movements = [
                [
                    'type' => 'in',
                    'quantity' => 30,
                    'reference_type' => 'purchase_order',
                    'reference_id' => 12345,
                    'notes' => 'Initial MacBook Pro stock received from supplier',
                    'movement_date' => Carbon::now()->subDays(45),
                ],
                [
                    'type' => 'out',
                    'quantity' => -5,
                    'reference_type' => 'sale',
                    'reference_id' => 67890,
                    'notes' => 'MacBook Pro sold to enterprise customer',
                    'movement_date' => Carbon::now()->subDays(30),
                ],
                [
                    'type' => 'transfer',
                    'quantity' => -3,
                    'reference_type' => 'transfer',
                    'reference_id' => 11111,
                    'notes' => 'Transfer to East Coast Hub for regional distribution',
                    'movement_date' => Carbon::now()->subDays(15),
                ],
                [
                    'type' => 'adjustment',
                    'quantity' => 3,
                    'reference_type' => 'adjustment',
                    'notes' => 'Found missing units during cycle count',
                    'movement_date' => Carbon::now()->subDays(7),
                ]
            ];

            $currentStock = 0;
            foreach ($movements as $movement) {
                $quantityBefore = $currentStock;
                $currentStock += $movement['quantity'];
                $quantityAfter = max(0, $currentStock);

                InventoryMovement::create([
                    'product_id' => $macbook->id,
                    'warehouse_id' => $mainDC->id,
                    'type' => $movement['type'],
                    'quantity' => $movement['quantity'],
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'reference_type' => $movement['reference_type'],
                    'reference_id' => $movement['reference_id'] ?? null,
                    'notes' => $movement['notes'],
                    'movement_date' => $movement['movement_date'],
                ]);
            }
        }

        // Create some problematic movements for testing
        $this->createProblematicMovements();
    }

    private function createProblematicMovements(): void
    {
        // Large outbound movement (potential issue)
        InventoryMovement::factory()->create([
            'type' => 'out',
            'quantity' => -150,
            'reference_type' => 'damage',
            'notes' => 'Major shipment damaged in transit',
            'movement_date' => Carbon::now()->subDays(3),
        ]);

        // Frequent small adjustments (potential issue)
        for ($i = 0; $i < 5; $i++) {
            InventoryMovement::factory()->adjustment()->create([
                'quantity' => fake()->numberBetween(-3, 3),
                'notes' => 'Daily count adjustment - investigate discrepancies',
                'movement_date' => Carbon::now()->subDays($i + 1),
            ]);
        }
    }

    private function createMovement($inventory, $type, $quantity, $quantityBefore, $movementDate) 
    {
        $quantityAfter = max(0, $quantityBefore + $quantity);

        InventoryMovement::create([
            'product_id' => $inventory->product_id,
            'warehouse_id' => $inventory->warehouse_id,
            'type' => $type,
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'reference_type' => $this->getReferenceType($type),
            'reference_id' => fake()->optional(0.6)->numberBetween(1000, 9999),
            'notes' => $this->getNotesForMovement($type),
            'movement_date' => $movementDate,
        ]);
    }

    private function getQuantityForMovement($type, $currentStock): int
    {
        return match($type) {
            'in' => fake()->numberBetween(10, 50),
            'out' => -fake()->numberBetween(1, min($currentStock, 20)),
            'adjustment' => fake()->numberBetween(-5, 5),
            default => 0
        };
    }

    private function getReferenceType($type): string
    {
        return match($type) {
            'in' => fake()->randomElement(['purchase_order', 'return', 'transfer']),
            'out' => fake()->randomElement(['sale', 'damage', 'transfer']),
            'adjustment' => 'adjustment',
            default => 'other'
        };
    }

    private function getNotesForMovement($type): string
    {
        $notes = match($type) {
            'in' => fake()->randomElement([
                'Stock received from supplier',
                'Customer return processed',
                'Transfer from another location',
                'Initial inventory setup'
            ]),
            'out' => fake()->randomElement([
                'Product sold to customer',
                'Damaged goods removed',
                'Transfer to another location',
                'Promotional giveaway'
            ]),
            'adjustment' => fake()->randomElement([
                'Cycle count adjustment',
                'System correction',
                'Found missing inventory',
                'Damaged goods write-off'
            ]),
            default => 'Inventory movement'
        };

        return $notes . ' - ' . fake()->sentence(3);
    }
}
