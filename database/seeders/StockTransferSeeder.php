<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StockTransferSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have required data
        $this->ensureRequiredData();

        // Create various transfer scenarios
        $this->createPendingTransfers();
        $this->createApprovedTransfers();
        $this->createCompletedTransfers();
        $this->createCancelledTransfers();
        $this->createRecentTransfers();
    }

    private function ensureRequiredData(): void
    {
        // Ensure we have at least 2 warehouses
        if (Warehouse::count() < 2) {
            Warehouse::factory(3)->create();
        }

        // Ensure we have products
        if (Product::count() < 5) {
            Product::factory(10)->create();
        }

        // Ensure we have users
        if (User::count() < 3) {
            User::factory(5)->create();
        }
    }

    private function createPendingTransfers(): void
    {
        // Create 8 pending transfers
        StockTransfer::factory()
            ->pending()
            ->count(8)
            ->create();

        $this->command->info('Created 8 pending stock transfers');
    }

    private function createApprovedTransfers(): void
    {
        // Create 5 approved transfers
        StockTransfer::factory()
            ->approved()
            ->count(5)
            ->create();

        $this->command->info('Created 5 approved stock transfers');
    }

    private function createCompletedTransfers(): void
    {
        // Create 15 completed transfers
        StockTransfer::factory()
            ->completed()
            ->count(15)
            ->create();

        $this->command->info('Created 15 completed stock transfers');
    }

    private function createCancelledTransfers(): void
    {
        // Create 3 cancelled transfers
        StockTransfer::factory()
            ->cancelled()
            ->count(3)
            ->create();

        $this->command->info('Created 3 cancelled stock transfers');
    }

    private function createRecentTransfers(): void
    {
        // Create some transfers with specific scenarios
        $warehouses = Warehouse::pluck('id')->toArray();
        $products = Product::pluck('id')->toArray();
        $users = User::pluck('id')->toArray();

        // High-priority pending transfer
        StockTransfer::factory()->create([
            'from_warehouse_id' => $warehouses[0],
            'to_warehouse_id' => $warehouses[1],
            'product_id' => $products[0],
            'quantity_transferred' => 50,
            'transfer_status' => StockTransfer::STATUS_PENDING,
            'notes' => 'Urgent transfer required for customer order',
            'initiated_by' => $users[0],
            'initiated_at' => now()->subHours(2),
        ]);

        // Recent completion
        StockTransfer::factory()->create([
            'from_warehouse_id' => $warehouses[1],
            'to_warehouse_id' => $warehouses[0],
            'product_id' => $products[1],
            'quantity_transferred' => 25,
            'transfer_status' => StockTransfer::STATUS_COMPLETED,
            'notes' => 'Emergency restocking completed',
            'initiated_by' => $users[1],
            'approved_by' => $users[0],
            'completed_by' => $users[2],
            'initiated_at' => now()->subDays(3),
            'approved_at' => now()->subDays(2),
            'completed_at' => now()->subHours(6),
        ]);

        $this->command->info('Created additional scenario-based transfers');
    }
}
