<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PurchaseOrderSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have required data
        $this->ensureRequiredData();

        // Create various purchase order scenarios
        $this->createDraftOrders();
        $this->createPendingApprovalOrders();
        $this->createApprovedOrders();
        $this->createInProgressOrders();
        $this->createCompletedOrders();
        $this->createUrgentOrders();
    }

    /**
     * Ensure we have the required data
     */
    private function ensureRequiredData(): void
    {
        if (User::count() === 0) {
            User::factory(5)->create();
        }

        if (Warehouse::count() === 0) {
            Warehouse::factory(3)->create();
        }

        if (Product::count() < 20) {
            Product::factory(30)->create();
        }
    }

    /**
     * Create draft purchase orders
     */
    private function createDraftOrders(): void
    {
        PurchaseOrder::factory()
            ->count(3)
            ->draft()
            ->has(PurchaseOrderItem::factory()->count(rand(2, 5))->pending(), 'items')
            ->create();
    }

    /**
     * Create pending approval orders
     */
    private function createPendingApprovalOrders(): void
    {
        PurchaseOrder::factory()
            ->count(2)
            ->pendingApproval()
            ->has(PurchaseOrderItem::factory()->count(rand(1, 4))->pending(), 'items')
            ->create();
    }

    /**
     * Create approved orders
     */
    private function createApprovedOrders(): void
    {
        PurchaseOrder::factory()
            ->count(4)
            ->approved()
            ->has(PurchaseOrderItem::factory()->count(rand(3, 6))->pending(), 'items')
            ->create();
    }

    /**
     * Create in-progress orders (sent to supplier, partially received)
     */
    private function createInProgressOrders(): void
    {
        // Sent to supplier
        PurchaseOrder::factory()
            ->count(3)
            ->sentToSupplier()
            ->has(PurchaseOrderItem::factory()->count(rand(2, 5))->pending(), 'items')
            ->create();

        // Partially received with mixed item states
        PurchaseOrder::factory()
            ->count(2)
            ->partiallyReceived()
            ->create()
            ->each(function ($po) {
                // Mix of received and pending items
                PurchaseOrderItem::factory()
                    ->count(rand(2, 4))
                    ->for($po)
                    ->fullyReceived()
                    ->create();

                PurchaseOrderItem::factory()
                    ->count(rand(1, 3))
                    ->for($po)
                    ->partiallyReceived()
                    ->create();

                PurchaseOrderItem::factory()
                    ->count(rand(1, 2))
                    ->for($po)
                    ->pending()
                    ->create();

                // Update PO totals
                $po->refresh();
                $po->updateTotals();
            });
    }

    /**
     * Create completed orders
     */
    private function createCompletedOrders(): void
    {
        // Fully received orders
        PurchaseOrder::factory()
            ->count(5)
            ->fullyReceived()
            ->create()
            ->each(function ($po) {
                PurchaseOrderItem::factory()
                    ->count(rand(2, 6))
                    ->for($po)
                    ->fullyReceived()
                    ->create();

                // Some items with discounts
                if (rand(1, 100) <= 30) {
                    PurchaseOrderItem::factory()
                        ->count(rand(1, 2))
                        ->for($po)
                        ->fullyReceived()
                        ->withDiscount()
                        ->create();
                }

                $po->refresh();
                $po->updateTotals();
            });

        // Orders with quality issues
        PurchaseOrder::factory()
            ->count(2)
            ->fullyReceived()
            ->create()
            ->each(function ($po) {
                // Mix of good and problematic items
                PurchaseOrderItem::factory()
                    ->count(rand(2, 4))
                    ->for($po)
                    ->fullyReceived()
                    ->create();

                PurchaseOrderItem::factory()
                    ->count(rand(1, 2))
                    ->for($po)
                    ->withQualityIssues()
                    ->create();

                $po->refresh();
                $po->updateTotals();
            });
    }

    /**
     * Create urgent priority orders
     */
    private function createUrgentOrders(): void
    {
        // Urgent draft orders
        PurchaseOrder::factory()
            ->count(1)
            ->draft()
            ->urgent()
            ->has(PurchaseOrderItem::factory()->count(rand(1, 3))->pending(), 'items')
            ->create();

        // High priority approved orders
        PurchaseOrder::factory()
            ->count(2)
            ->approved()
            ->highPriority()
            ->has(PurchaseOrderItem::factory()->count(rand(2, 4))->pending(), 'items')
            ->create();
    }
}
