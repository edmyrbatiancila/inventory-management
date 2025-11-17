<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SalesOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating Sales Orders...');
        
        // Create sales orders with different statuses
        $this->createSalesOrdersByStatus();
        
        $this->command->info('Sales Orders seeding completed!');
    }

    /**
     * Create sales orders with various statuses
     */
    private function createSalesOrdersByStatus(): void
    {
        $statusDistribution = [
            'draft' => 3,
            'pendingApproval' => 2,
            'approved' => 3,
            'confirmed' => 4,
            'partiallyFulfilled' => 3,
            'fullyFulfilled' => 4,
            'shipped' => 5,
            'delivered' => 6,
        ];

        foreach ($statusDistribution as $status => $count) {
            $this->command->info("Creating {$count} {$status} sales orders...");
            
            for ($i = 0; $i < $count; $i++) {
                $salesOrder = SalesOrder::factory()->{$status}()->create();
                
                // Add items to each sales order
                $itemsCount = rand(2, 6);
                $products = Product::inRandomOrder()->limit($itemsCount)->get();
                
                foreach ($products as $product) {
                    $item = SalesOrderItem::factory()
                        ->forSalesOrder($salesOrder)
                        ->forProduct($product)
                        ->{$this->getItemStatusForOrderStatus($status)}()
                        ->create();
                    
                    // 30% chance of having discount
                    if (rand(1, 100) <= 30) {
                        $discountPercentage = rand(5, 15) / 100; // 5% to 15% as decimal (0.05-0.15)
                        $item->update([
                            'discount_percentage' => $discountPercentage,
                            'discount_amount' => $item->line_total * $discountPercentage,
                        ]);
                        $item->calculateTotals();
                    }
                }
                
                // Update sales order totals
                $salesOrder->calculateTotals();
            }
        }

        // Create some high priority orders
        $this->command->info('Creating urgent and high priority orders...');
        
        SalesOrder::factory(2)->urgent()->confirmed()->create()->each(function ($so) {
            SalesOrderItem::factory(rand(1, 3))
                ->forSalesOrder($so)
                ->confirmed()
                ->create();
            $so->calculateTotals();
        });
        
        SalesOrder::factory(3)->highPriority()->approved()->create()->each(function ($so) {
            SalesOrderItem::factory(rand(2, 4))
                ->forSalesOrder($so)
                ->confirmed()
                ->create();
            $so->calculateTotals();
        });
    }

    /**
     * Map sales order status to appropriate item status
     */
    private function getItemStatusForOrderStatus(string $orderStatus): string
    {
        return match($orderStatus) {
            'draft', 'pendingApproval' => 'pending',
            'approved', 'confirmed' => 'confirmed',
            'partiallyFulfilled' => rand(1, 2) === 1 ? 'partiallyFulfilled' : 'confirmed',
            'fullyFulfilled' => 'fullyFulfilled',
            'shipped' => 'shipped',
            'delivered' => 'delivered',
            default => 'pending'
        };
    }
}
