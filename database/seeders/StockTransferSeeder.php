<?php

namespace Database\Seeders;

use App\Models\Inventory;
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

        // Ensure we have inventory records
        if (Inventory::count() < 10) {
            $this->command->warn('Not enough inventory records found. Some transfers may fail.');
        }
    }

    private function createPendingTransfers(): void
    {
        $this->command->info('Creating pending transfers with real inventory...');

        // Get inventory records with efficient stock for transfers
        $availableInventory = Inventory::where('quantity_available', '>', 10)
            ->with(['product', 'warehouse'])
            ->get();

        if ($availableInventory->count() < 8) {
            $this->command->warn('Not enough inventory records with sufficient stock. Creating fewer pending transfers.');
        }

        $count = min(8, $availableInventory->count());
        $users = User::pluck('id')->toArray();
        $warehouses = Warehouse::where('is_active', true)->pluck('id')->toArray();

        for ($i = 0; $i < $count; $i++) {
            $sourceInventory = $availableInventory->random();
            
            // Find a different warehouse for destination
            $availableDestinations = array_diff($warehouses, [$sourceInventory->warehouse_id]);
            $toWarehouseId = collect($availableDestinations)->random();

            // Create transfer with realistic quantity
            $maxTransfer = min($sourceInventory->quantity_available, 50);
            $transferQuantity = fake()->numberBetween(1, $maxTransfer);

            StockTransfer::create([
                'from_warehouse_id' => $sourceInventory->warehouse_id,
                'to_warehouse_id' => $toWarehouseId,
                'product_id' => $sourceInventory->product_id,
                'quantity_transferred' => $transferQuantity,
                'transfer_status' => StockTransfer::STATUS_PENDING,
                'reference_number' => $this->generateReferenceNumber(),
                'initiated_by' => fake()->randomElement($users),
                'notes' => fake()->optional()->sentence(),
                'initiated_at' => fake()->dateTimeBetween('-5 days', 'now'),
            ]);
        }

        $this->command->info("Created {$count} pending stock transfers with real inventory");

    }

    private function createApprovedTransfers(): void
    {
        $this->command->info('Creating approved transfers with real inventory...');

        $availableInventory = Inventory::where('quantity_available', '>', 5)
            ->with(['product', 'warehouse'])
            ->get();

        $count = min(5, $availableInventory->count());
        $users = User::pluck('id')->toArray();
        $warehouses = Warehouse::where('is_active', true)->pluck('id')->toArray();

        for ($i = 0; $i < $count; $i++) {
            $sourceInventory = $availableInventory->random();
            
            $availableDestinations = array_diff($warehouses, [$sourceInventory->warehouse_id]);
            $toWarehouseId = collect($availableDestinations)->random();

            $maxTransfer = min($sourceInventory->quantity_available, 30);
            $transferQuantity = fake()->numberBetween(1, $maxTransfer);

            $initiatedAt = fake()->dateTimeBetween('-10 days', '-2 days');
            $approvedAt = fake()->dateTimeBetween($initiatedAt, '-1 day');

            StockTransfer::create([
                'from_warehouse_id' => $sourceInventory->warehouse_id,
                'to_warehouse_id' => $toWarehouseId,
                'product_id' => $sourceInventory->product_id,
                'quantity_transferred' => $transferQuantity,
                'transfer_status' => StockTransfer::STATUS_APPROVED,
                'reference_number' => $this->generateReferenceNumber(),
                'initiated_by' => fake()->randomElement($users),
                'approved_by' => fake()->randomElement($users),
                'notes' => fake()->optional()->sentence(),
                'initiated_at' => $initiatedAt,
                'approved_at' => $approvedAt,
            ]);
        }

        $this->command->info("Created {$count} approved stock transfers");
    }

    private function createCompletedTransfers(): void
    {
        $this->command->info('Creating completed transfers...');
        
        // For completed transfers, we can be less strict about current inventory
        // since the transfer already happened
        $availableInventory = Inventory::with(['product', 'warehouse'])->get();
        
        $count = min(15, $availableInventory->count());
        $users = User::pluck('id')->toArray();
        $warehouses = Warehouse::where('is_active', true)->pluck('id')->toArray();

        for ($i = 0; $i < $count; $i++) {
            $sourceInventory = $availableInventory->random();
            
            $availableDestinations = array_diff($warehouses, [$sourceInventory->warehouse_id]);
            $toWarehouseId = collect($availableDestinations)->random();

            $transferQuantity = fake()->numberBetween(1, 25);

            $initiatedAt = fake()->dateTimeBetween('-30 days', '-10 days');
            $approvedAt = fake()->dateTimeBetween($initiatedAt, '-8 days');
            $completedAt = fake()->dateTimeBetween($approvedAt, '-3 days');

            StockTransfer::create([
                'from_warehouse_id' => $sourceInventory->warehouse_id,
                'to_warehouse_id' => $toWarehouseId,
                'product_id' => $sourceInventory->product_id,
                'quantity_transferred' => $transferQuantity,
                'transfer_status' => StockTransfer::STATUS_COMPLETED,
                'reference_number' => $this->generateReferenceNumber(),
                'initiated_by' => fake()->randomElement($users),
                'approved_by' => fake()->randomElement($users),
                'completed_by' => fake()->randomElement($users),
                'notes' => fake()->optional()->sentence(),
                'initiated_at' => $initiatedAt,
                'approved_at' => $approvedAt,
                'completed_at' => $completedAt,
            ]);
        }

        $this->command->info("Created {$count} completed stock transfers");

    }

    private function createCancelledTransfers(): void
    {
        $this->command->info('Creating cancelled transfers...');
        
        $availableInventory = Inventory::with(['product', 'warehouse'])->get();
        
        $count = min(3, $availableInventory->count());
        $users = User::pluck('id')->toArray();
        $warehouses = Warehouse::where('is_active', true)->pluck('id')->toArray();

        for ($i = 0; $i < $count; $i++) {
            $sourceInventory = $availableInventory->random();
            
            $availableDestinations = array_diff($warehouses, [$sourceInventory->warehouse_id]);
            $toWarehouseId = collect($availableDestinations)->random();

            $transferQuantity = fake()->numberBetween(1, 20);

            $initiatedAt = fake()->dateTimeBetween('-15 days', '-5 days');
            $cancelledAt = fake()->dateTimeBetween($initiatedAt, 'now');

            StockTransfer::create([
                'from_warehouse_id' => $sourceInventory->warehouse_id,
                'to_warehouse_id' => $toWarehouseId,
                'product_id' => $sourceInventory->product_id,
                'quantity_transferred' => $transferQuantity,
                'transfer_status' => StockTransfer::STATUS_CANCELLED,
                'reference_number' => $this->generateReferenceNumber(),
                'initiated_by' => fake()->randomElement($users),
                'notes' => fake()->optional()->sentence(),
                'cancellation_reason' => fake()->randomElement([
                    'Inventory shortage discovered',
                    'Customer order cancelled',
                    'Product quality issue',
                    'Transport unavailable',
                    'Business priority changed'
                ]),
                'initiated_at' => $initiatedAt,
                'cancelled_at' => $cancelledAt,
            ]);
        }

        $this->command->info("Created {$count} cancelled stock transfers");
    }

    private function createRecentTransfers(): void
    {
        $this->command->info('Creating recent scenario-based transfers...');
        
        // Get some specific inventory for demo scenarios
        $highStockInventory = Inventory::where('quantity_available', '>', 50)
            ->with(['product', 'warehouse'])
            ->first();

        $mediumStockInventory = Inventory::where('quantity_available', '>', 20)
            ->where('quantity_available', '<=', 50)
            ->with(['product', 'warehouse'])
            ->first();

        $users = User::pluck('id')->toArray();
        $warehouses = Warehouse::where('is_active', true)->pluck('id')->toArray();

        // High-priority pending transfer
        if ($highStockInventory) {
            $availableDestinations = array_diff($warehouses, [$highStockInventory->warehouse_id]);
            $toWarehouseId = collect($availableDestinations)->random();

            StockTransfer::create([
                'from_warehouse_id' => $highStockInventory->warehouse_id,
                'to_warehouse_id' => $toWarehouseId,
                'product_id' => $highStockInventory->product_id,
                'quantity_transferred' => min(50, $highStockInventory->quantity_available),
                'transfer_status' => StockTransfer::STATUS_PENDING,
                'reference_number' => $this->generateReferenceNumber(),
                'notes' => 'Urgent transfer required for customer order',
                'initiated_by' => fake()->randomElement($users),
                'initiated_at' => now()->subHours(2),
            ]);
        }

        // Recent completion
        if ($mediumStockInventory) {
            $availableDestinations = array_diff($warehouses, [$mediumStockInventory->warehouse_id]);
            $toWarehouseId = collect($availableDestinations)->random();

            StockTransfer::create([
                'from_warehouse_id' => $mediumStockInventory->warehouse_id,
                'to_warehouse_id' => $toWarehouseId,
                'product_id' => $mediumStockInventory->product_id,
                'quantity_transferred' => min(25, $mediumStockInventory->quantity_available),
                'transfer_status' => StockTransfer::STATUS_COMPLETED,
                'reference_number' => $this->generateReferenceNumber(),
                'notes' => 'Emergency restocking completed',
                'initiated_by' => fake()->randomElement($users),
                'approved_by' => fake()->randomElement($users),
                'completed_by' => fake()->randomElement($users),
                'initiated_at' => now()->subDays(3),
                'approved_at' => now()->subDays(2),
                'completed_at' => now()->subHours(6),
            ]);
        }

        $this->command->info('Created additional scenario-based transfers');
    }

    private function generateReferenceNumber(): string
    {
        $date = now()->format('Ymd');
        $sequence = StockTransfer::whereDate('created_at', now())->count() + 1;
        return 'ST-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
