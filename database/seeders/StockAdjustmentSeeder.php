<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\StockAdjustment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StockAdjustmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if we have the required data
        if (Inventory::count() === 0) {
            $this->command->error('No inventories found. Please run InventorySeeder first.');
            return;
        }

        if (User::count() === 0) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        $this->command->info('Creating stock adjustments...');

        // Get existing inventories and users
        $inventories = Inventory::with(['product', 'warehouse'])->get();
        $users = User::all();

        // Create various types of adjustments
        $this->createDamageAdjustments($inventories, $users);
        $this->createFoundInventoryAdjustments($inventories, $users);
        $this->createTransferAdjustments($inventories, $users);
        $this->createCorrectionAdjustments($inventories, $users);
        $this->createRecentAdjustments($inventories, $users);
        $this->createRandomAdjustments($inventories, $users);

        $this->command->info('Stock adjustments created successfully!');
    }

    /**
     * Create damage-related adjustments
     */
    private function createDamageAdjustments($inventories, $users): void
    {
        $this->command->info('Creating damage adjustments...');

        $damageReasons = ['damage', 'expired', 'theft'];
        
        foreach ($damageReasons as $reason) {
            $selectedInventories = $inventories->random(rand(3, 8));
            
            foreach ($selectedInventories as $inventory) {
                $user = $users->random();
                $quantityBefore = $inventory->quantity_on_hand;
                $maxAdjustment = min(20, $quantityBefore);
                
                if ($maxAdjustment > 0) {
                    $quantityAdjusted = rand(1, $maxAdjustment);
                    
                    StockAdjustment::create([
                        'inventory_id' => $inventory->id,
                        'adjustment_type' => 'decrease',
                        'quantity_adjusted' => $quantityAdjusted,
                        'quantity_before' => $quantityBefore,
                        'quantity_after' => $quantityBefore - $quantityAdjusted,
                        'reason' => $reason,
                        'notes' => $this->getDamageNote($reason),
                        'reference_number' => StockAdjustment::generateReferenceNumber(),
                        'adjusted_by' => $user->id,
                        'adjusted_at' => fake()->dateTimeBetween('-3 months', '-1 week'),
                    ]);
                }
            }
        }
    }

    /**
     * Create found inventory adjustments
     */
    private function createFoundInventoryAdjustments($inventories, $users): void
    {
        $this->command->info('Creating found inventory adjustments...');

        $selectedInventories = $inventories->random(rand(5, 12));
        
        foreach ($selectedInventories as $inventory) {
            $user = $users->random();
            $quantityBefore = $inventory->quantity_on_hand;
            $quantityAdjusted = rand(1, 25);
            
            StockAdjustment::create([
                'inventory_id' => $inventory->id,
                'adjustment_type' => 'increase',
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityBefore + $quantityAdjusted,
                'reason' => 'found',
                'notes' => fake()->randomElement([
                    'Items found during monthly physical count',
                    'Previously misplaced inventory located in different section',
                    'Stock discovered after warehouse reorganization',
                    'Items found during routine inspection'
                ]),
                'reference_number' => StockAdjustment::generateReferenceNumber(),
                'adjusted_by' => $user->id,
                'adjusted_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
            ]);
        }
    }

    /**
     * Create transfer adjustments
     */
    private function createTransferAdjustments($inventories, $users): void
    {
        $this->command->info('Creating transfer adjustments...');

        $transferReasons = ['transfer_in', 'transfer_out'];
        
        foreach ($transferReasons as $reason) {
            $selectedInventories = $inventories->random(rand(4, 10));
            
            foreach ($selectedInventories as $inventory) {
                $user = $users->random();
                $quantityBefore = $inventory->quantity_on_hand;
                
                if ($reason === 'transfer_in') {
                    $quantityAdjusted = rand(5, 50);
                    $quantityAfter = $quantityBefore + $quantityAdjusted;
                    $adjustmentType = 'increase';
                } else {
                    $maxTransfer = min(30, $quantityBefore);
                    if ($maxTransfer <= 0) continue;
                    
                    $quantityAdjusted = rand(1, $maxTransfer);
                    $quantityAfter = $quantityBefore - $quantityAdjusted;
                    $adjustmentType = 'decrease';
                }
                
                StockAdjustment::create([
                    'inventory_id' => $inventory->id,
                    'adjustment_type' => $adjustmentType,
                    'quantity_adjusted' => $quantityAdjusted,
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'reason' => $reason,
                    'notes' => $reason === 'transfer_in' 
                        ? 'Stock transferred from another warehouse'
                        : 'Stock transferred to another location',
                    'reference_number' => StockAdjustment::generateReferenceNumber(),
                    'adjusted_by' => $user->id,
                    'adjusted_at' => fake()->dateTimeBetween('-1 month', '-3 days'),
                ]);
            }
        }
    }

    /**
     * Create correction adjustments
     */
    private function createCorrectionAdjustments($inventories, $users): void
    {
        $this->command->info('Creating correction adjustments...');

        $selectedInventories = $inventories->random(rand(6, 15));
        
        foreach ($selectedInventories as $inventory) {
            $user = $users->random();
            $quantityBefore = $inventory->quantity_on_hand;
            
            // Random correction (could be increase or decrease)
            $adjustmentType = fake()->randomElement(['increase', 'decrease']);
            
            if ($adjustmentType === 'increase') {
                $quantityAdjusted = rand(1, 20);
                $quantityAfter = $quantityBefore + $quantityAdjusted;
            } else {
                $maxCorrection = min(15, $quantityBefore);
                if ($maxCorrection <= 0) continue;
                
                $quantityAdjusted = rand(1, $maxCorrection);
                $quantityAfter = $quantityBefore - $quantityAdjusted;
            }
            
            StockAdjustment::create([
                'inventory_id' => $inventory->id,
                'adjustment_type' => $adjustmentType,
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reason' => fake()->randomElement(['correction', 'recount']),
                'notes' => fake()->randomElement([
                    'System count correction after audit',
                    'Physical count discrepancy resolved',
                    'Data entry error correction',
                    'Inventory recount adjustment'
                ]),
                'reference_number' => StockAdjustment::generateReferenceNumber(),
                'adjusted_by' => $user->id,
                'adjusted_at' => fake()->dateTimeBetween('-6 weeks', '-1 day'),
            ]);
        }
    }

    /**
     * Create recent adjustments (last 2 weeks)
     */
    private function createRecentAdjustments($inventories, $users): void
    {
        $this->command->info('Creating recent adjustments...');

        $selectedInventories = $inventories->random(rand(8, 20));
        
        foreach ($selectedInventories as $inventory) {
            $user = $users->random();
            $quantityBefore = $inventory->quantity_on_hand;
            
            $reasons = ['returned', 'correction', 'found', 'damage'];
            $reason = fake()->randomElement($reasons);
            
            $adjustmentType = in_array($reason, ['returned', 'found', 'correction']) 
                ? fake()->randomElement(['increase', 'decrease'])
                : 'decrease';
            
            if ($adjustmentType === 'increase') {
                $quantityAdjusted = rand(1, 30);
                $quantityAfter = $quantityBefore + $quantityAdjusted;
            } else {
                $maxAdjustment = min(25, $quantityBefore);
                if ($maxAdjustment <= 0) continue;
                
                $quantityAdjusted = rand(1, $maxAdjustment);
                $quantityAfter = $quantityBefore - $quantityAdjusted;
            }
            
            StockAdjustment::create([
                'inventory_id' => $inventory->id,
                'adjustment_type' => $adjustmentType,
                'quantity_adjusted' => $quantityAdjusted,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reason' => $reason,
                'notes' => $this->getRecentNote($reason, $adjustmentType),
                'reference_number' => StockAdjustment::generateReferenceNumber(),
                'adjusted_by' => $user->id,
                'adjusted_at' => fake()->dateTimeBetween('-2 weeks', 'now'),
            ]);
        }
    }

    /**
     * Create random adjustments for variety
     */
    private function createRandomAdjustments($inventories, $users): void
    {
        $this->command->info('Creating random adjustments...');

        // Create 20-40 random adjustments using the factory
        StockAdjustment::factory()
            ->count(rand(20, 40))
            ->create([
                'inventory_id' => function () use ($inventories) {
                    return $inventories->random()->id;
                },
                'adjusted_by' => function () use ($users) {
                    return $users->random()->id;
                },
            ]);
    }

    /**
     * Get appropriate damage note
     */
    private function getDamageNote(string $reason): string
    {
        $notes = [
            'damage' => [
                'Items damaged during transport',
                'Water damage in storage area',
                'Packaging defects found during inspection',
                'Products damaged during handling'
            ],
            'expired' => [
                'Products expired due to storage conditions',
                'Items past expiration date removed',
                'Expired inventory identified during audit',
                'Products removed due to quality concerns'
            ],
            'theft' => [
                'Items reported missing during count',
                'Security incident - items unaccounted for',
                'Inventory shrinkage identified',
                'Missing items after security review'
            ]
        ];

        return fake()->randomElement($notes[$reason] ?? ['Adjustment made']);
    }

    /**
     * Get appropriate recent note
     */
    private function getRecentNote(string $reason, string $type): string
    {
        $notes = [
            'returned' => $type === 'increase' 
                ? 'Customer returns processed' 
                : 'Returns sent back to supplier',
            'correction' => 'System correction after review',
            'found' => 'Items located during routine check',
            'damage' => 'Items removed due to damage'
        ];

        return $notes[$reason] ?? 'Recent adjustment';
    }
}
