<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Database\Factories\Traits\HasPurchaseOrderItemStates;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    use HasPurchaseOrderItemStates;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        $quantityOrdered = $this->faker->numberBetween(5, 100);
        $unitCost = $this->faker->randomFloat(2, 5.00, 1000.00);
        $lineTotal = $quantityOrdered * $unitCost;

        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'product_id' => $product->id,
            'product_sku' => $product->sku,
            'product_name' => $product->name,
            'product_description' => $this->faker->optional(0.4)->sentence(),
            
            'quantity_ordered' => $quantityOrdered,
            'quantity_received' => 0,
            'quantity_pending' => $quantityOrdered,
            'quantity_rejected' => 0,
            
            'unit_cost' => $unitCost,
            'line_total' => $lineTotal,
            'discount_percentage' => 0,
            'discount_amount' => 0,
            'final_line_total' => $lineTotal,
            
            'item_status' => PurchaseOrderItem::STATUS_PENDING,
            'notes' => $this->faker->optional(0.3)->sentence(),
        ];
    }
}
