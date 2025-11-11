<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Warehouse;
use Database\Factories\Traits\HasPurchaseOrderStates;
use Database\Factories\Traits\HasSupplierData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    use HasSupplierData, HasPurchaseOrderStates;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 500, 50000);
        $taxRate = $this->faker->randomFloat(4, 0.05, 0.15); // 5% to 15%
        $taxAmount = $subtotal * $taxRate;
        $shippingCost = $this->faker->randomFloat(2, 50, 500);
        $discountAmount = $this->faker->optional(0.3)->randomFloat(2, 0, $subtotal * 0.1);

        return array_merge($this->generateSupplierData(), [
            'po_number' => $this->generatePoNumber(),
            'status' => $this->faker->randomElement([
                PurchaseOrder::STATUS_DRAFT,
                PurchaseOrder::STATUS_PENDING_APPROVAL,
                PurchaseOrder::STATUS_APPROVED,
                PurchaseOrder::STATUS_SENT_TO_SUPPLIER,
            ]),
            'priority' => $this->faker->randomElement(array_keys(PurchaseOrder::PRIORITIES)),
            'warehouse_id' => Warehouse::inRandomOrder()->first()?->id ?? Warehouse::factory(),
            'created_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            
            // Financial data
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_cost' => $shippingCost,
            'discount_amount' => $discountAmount ?? 0,
            'total_amount' => $subtotal + $taxAmount + $shippingCost - ($discountAmount ?? 0),
            
            // Dates
            'expected_delivery_date' => $this->faker->dateTimeBetween('+1 week', '+2 months'),
            'notes' => $this->faker->optional(0.6)->sentence(),
            
            // Status-specific fields (will be overridden by state methods)
            'approved_by' => null,
            'received_by' => null,
            'approved_at' => null,
            'sent_at' => null,
            'received_at' => null,
        ]);
    }

    /**
     * Generate a unique PO number
     */
    private function generatePoNumber(): string
    {
        return 'PO-' . date('Y') . '-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}
