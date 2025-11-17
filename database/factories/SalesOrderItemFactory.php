<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\SalesOrder;
use Database\Factories\Traits\HasSalesOrderItemStates;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SalesOrderItem>
 */
class SalesOrderItemFactory extends Factory
{
    use HasSalesOrderItemStates;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        $quantityOrdered = $this->faker->numberBetween(1, 50);
        $unitPrice = $this->faker->randomFloat(2, 10.00, 2000.00);
        $lineTotal = $quantityOrdered * $unitPrice;
        
        // Get inventory for the product if available
        $inventory = Inventory::where('product_id', $product->id)
                             ->whereHas('warehouse')
                             ->inRandomOrder()
                             ->first();

        return [
            'sales_order_id' => SalesOrder::factory(),
            'product_id' => $product->id,
            'inventory_id' => $inventory?->id,
            'product_sku' => $product->sku,
            'product_name' => $product->name,
            'product_description' => $this->faker->optional(0.3)->sentence(),
            
            'quantity_ordered' => $quantityOrdered,
            'quantity_fulfilled' => 0,
            'quantity_shipped' => 0,
            'quantity_pending' => $quantityOrdered,
            'quantity_backordered' => 0,
            'quantity_returned' => 0,
            
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal,
            'discount_percentage' => 0,
            'discount_amount' => 0,
            'final_line_total' => $lineTotal,
            
            'item_status' => 'pending',
            
            'requested_delivery_date' => $this->faker->optional(0.7)->dateTimeBetween('+3 days', '+6 weeks'),
            'promised_delivery_date' => $this->faker->optional(0.6)->dateTimeBetween('+3 days', '+6 weeks'),
            
            // Allocation
            'requires_allocation' => $this->faker->boolean(85), // 85% require allocation
            'allocated_quantity' => 0,
            'allocation_expires_at' => null,
            
            // Timestamps
            'allocated_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
            
            // Notes
            'notes' => $this->faker->optional(0.2)->sentence(),
            'customer_notes' => $this->faker->optional(0.15)->sentence(),
            'fulfillment_notes' => null,
            'return_reason' => null,
            
            // Metadata
            'metadata' => $this->faker->optional(0.1)->randomElement([
                ['special_handling' => true],
                ['fragile' => true],
                ['rush_order' => true],
            ]),
        ];
    }

    /**
     * Create item for a specific sales order
     */
    public function forSalesOrder(SalesOrder $salesOrder): static
    {
        return $this->state(fn () => [
            'sales_order_id' => $salesOrder->id,
            'requested_delivery_date' => $salesOrder->requested_delivery_date,
            'promised_delivery_date' => $salesOrder->promised_delivery_date,
        ]);
    }

    /**
     * Create item for a specific product
     */
    public function forProduct(Product $product): static
    {
        $inventory = Inventory::where('product_id', $product->id)
                             ->whereHas('warehouse')
                             ->inRandomOrder()
                             ->first();

        return $this->state(fn () => [
            'product_id' => $product->id,
            'inventory_id' => $inventory?->id,
            'product_sku' => $product->sku,
            'product_name' => $product->name,
        ]);
    }
}
