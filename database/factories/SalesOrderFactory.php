<?php

namespace Database\Factories;

use App\Models\SalesOrder;
use App\Models\User;
use App\Models\Warehouse;
use Database\Factories\Traits\HasCustomerData;
use Database\Factories\Traits\HasSalesOrderStates;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SalesOrder>
 */
class SalesOrderFactory extends Factory
{
    use HasCustomerData, HasSalesOrderStates;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 300, 25000);
        $taxRate = $this->faker->randomFloat(4, 0.05, 0.12); // 5% to 12%
        $taxAmount = $subtotal * $taxRate;
        $shippingCost = $this->faker->randomFloat(2, 25, 200);
        $discountAmount = $this->faker->optional(0.25)->randomFloat(2, 0, $subtotal * 0.15);

        return array_merge($this->generateCustomerData(), [
            'so_number' => $this->generateSoNumber(),
            'status' => $this->faker->randomElement([
                'draft',
                'pending_approval',
                'approved',
                'confirmed',
            ]),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high', 'urgent']),
            'warehouse_id' => Warehouse::inRandomOrder()->first()?->id ?? Warehouse::factory(),
            'created_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            
            // Financial data
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'shipping_cost' => $shippingCost,
            'discount_amount' => $discountAmount ?? 0,
            'total_amount' => $subtotal + $taxAmount + $shippingCost - ($discountAmount ?? 0),
            
            // Dates
            'requested_delivery_date' => $this->faker->dateTimeBetween('+3 days', '+6 weeks'),
            'promised_delivery_date' => $this->faker->optional(0.8)->dateTimeBetween('+3 days', '+6 weeks'),
            
            // Shipping
            'shipping_method' => $this->faker->randomElement(['Standard', 'Express', 'Overnight', 'Ground']),
            'carrier' => $this->faker->optional(0.6)->randomElement(['FedEx', 'UPS', 'DHL', 'USPS']),
            
            // Payment
            'payment_status' => $this->faker->randomElement(['pending', 'partial', 'paid']),
            'payment_terms' => $this->faker->randomElement(['Net 30', 'Net 15', 'Cash on Delivery', 'Prepaid']),
            'currency' => 'USD',
            
            // Notes
            'notes' => $this->faker->optional(0.4)->sentence(),
            'customer_notes' => $this->faker->optional(0.3)->sentence(),
            'terms_and_conditions' => $this->faker->optional(0.5)->paragraph(),
            
            // Status-specific fields (will be overridden by state methods)
            'approved_by' => null,
            'fulfilled_by' => null,
            'shipped_by' => null,
            'approved_at' => null,
            'confirmed_at' => null,
            'fulfilled_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Generate a unique SO number
     */
    private function generateSoNumber(): string
    {
        return 'SO-' . date('Y') . date('m') . '-' . str_pad($this->faker->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT);
    }
}
