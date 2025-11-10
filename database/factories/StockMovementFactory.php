<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $movementTypes = [
            'adjustment_increase', 
            'adjustment_decrease',
            'transfer_in', 
            'transfer_out',
            'purchase_receive', 
            'sale_fulfill',
            'return_customer', 
            'return_supplier',
            'damage_write_off', 
            'expiry_write_off'
        ];

        $movementType = $this->faker->randomElement($movementTypes);
        
        // Determine if it's an increase or decrease
        $isIncrease = in_array($movementType, [
            'adjustment_increase', 'transfer_in', 'purchase_receive', 'return_customer'
        ]);

        $quantityBefore = $this->faker->numberBetween(0, 1000);
        $quantityMoved = $isIncrease 
            ? $this->faker->numberBetween(1, 100)
            : -$this->faker->numberBetween(1, min(100, $quantityBefore));
        
        $quantityAfter = $quantityBefore + $quantityMoved;

        $unitCost = $this->faker->randomFloat(2, 1, 500);
        $totalValue = abs($quantityMoved) * $unitCost;

        $status = $this->faker->randomElement(['pending', 'approved', 'applied']);

        return [
            'product_id' => Product::factory(),
            'warehouse_id' => Warehouse::factory(),
            'user_id' => User::factory(),
            'reference_number' => $this->generateReferenceNumber(),
            'movement_type' => $movementType,
            'quantity_before' => $quantityBefore,
            'quantity_moved' => $quantityMoved,
            'quantity_after' => $quantityAfter,
            'unit_cost' => $unitCost,
            'total_value' => $totalValue,
            'reason' => $this->getReasonForMovementType($movementType),
            'notes' => $this->faker->optional(0.7)->sentence(),
            'metadata' => $this->getMetadataForMovementType($movementType),
            'related_document_type' => $this->getRelatedDocumentType($movementType),
            'related_document_id' => $this->faker->optional(0.8)->numberBetween(1, 100),
            'status' => $status,
            'approved_by' => $status !== 'pending' ? User::factory() : null,
            'approved_at' => $status !== 'pending' ? $this->faker->dateTimeBetween('-30 days', 'now') : null,
            'created_at' => $this->faker->dateTimeBetween('-60 days', 'now'),
        ];
    }

    /**
     * Generate a unique reference number
     */
    private function generateReferenceNumber(): string
    {
        $prefix = 'SM';
        $date = $this->faker->dateTimeBetween('-60 days', 'now')->format('Ymd');
        $sequence = $this->faker->unique()->numberBetween(1, 9999);
        
        return $prefix . $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get appropriate reason based on movement type
     */
    private function getReasonForMovementType(string $movementType): string
    {
        $reasons = [
            'adjustment_increase' => [
                'Stock count correction', 
                'Found additional inventory', 
                'Supplier credit adjustment',
                'Return from customer'
            ],
            'adjustment_decrease' => [
                'Stock count correction', 
                'Damaged goods write-off', 
                'Expired products removal',
                'Theft or loss'
            ],
            'transfer_in' => [
                'Inter-warehouse transfer', 
                'Consolidation from branch',
                'Seasonal stock movement'
            ],
            'transfer_out' => [
                'Inter-warehouse transfer', 
                'Distribution to branch',
                'Seasonal stock movement'
            ],
            'purchase_receive' => [
                'Purchase order receipt', 
                'Supplier delivery',
                'Bulk order received'
            ],
            'sale_fulfill' => [
                'Customer order fulfillment', 
                'Online order shipment',
                'Retail sale'
            ],
            'return_customer' => [
                'Customer return - defective', 
                'Customer return - unwanted',
                'Exchange process'
            ],
            'return_supplier' => [
                'Return to supplier - defective', 
                'Return to supplier - overstock',
                'Warranty return'
            ],
            'damage_write_off' => [
                'Physical damage', 
                'Water damage',
                'Transportation damage'
            ],
            'expiry_write_off' => [
                'Expired products', 
                'Near expiry disposal',
                'Quality control failure'
            ],
        ];

        return $this->faker->randomElement($reasons[$movementType] ?? ['General movement']);
    }

    /**
     * Get metadata based on movement type
     */
    private function getMetadataForMovementType(string $movementType): ?array
    {
        $baseMetadata = [
            'source' => 'manual',
            'batch_id' => $this->faker->optional(0.6)->uuid(),
        ];

        switch ($movementType) {
            case 'transfer_in':
            case 'transfer_out':
                return array_merge($baseMetadata, [
                    'transfer_id' => $this->faker->numberBetween(1, 100),
                    'source_warehouse' => $this->faker->company(),
                ]);
                
            case 'purchase_receive':
                return array_merge($baseMetadata, [
                    'purchase_order_id' => $this->faker->numberBetween(1, 100),
                    'supplier_name' => $this->faker->company(),
                ]);
                
            case 'sale_fulfill':
                return array_merge($baseMetadata, [
                    'sale_order_id' => $this->faker->numberBetween(1, 100),
                    'customer_name' => $this->faker->name(),
                ]);
                
            default:
                return $baseMetadata;
        }
    }

    /**
     * Get related document type based on movement type
     */
    private function getRelatedDocumentType(string $movementType): ?string
    {
        $documentTypes = [
            'adjustment_increase' => 'stock_adjustment',
            'adjustment_decrease' => 'stock_adjustment',
            'transfer_in' => 'stock_transfer',
            'transfer_out' => 'stock_transfer',
            'purchase_receive' => 'purchase_order',
            'sale_fulfill' => 'sale_order',
            'return_customer' => 'customer_return',
            'return_supplier' => 'supplier_return',
            'damage_write_off' => 'damage_report',
            'expiry_write_off' => 'quality_control',
        ];

        return $documentTypes[$movementType] ?? null;
    }

    /**
     * Create movement with specific type
     */
    public function increase(): static
    {
        return $this->state(function (array $attributes) {
            $movementType = $this->faker->randomElement([
                'adjustment_increase', 'transfer_in', 'purchase_receive', 'return_customer'
            ]);
            
            $quantityBefore = $this->faker->numberBetween(0, 500);
            $quantityMoved = $this->faker->numberBetween(1, 100);
            
            return [
                'movement_type' => $movementType,
                'quantity_moved' => $quantityMoved,
                'quantity_after' => $quantityBefore + $quantityMoved,
            ];
        });
    }

    /**
     * Create movement with specific type
     */
    public function decrease(): static
    {
        return $this->state(function (array $attributes) {
            $movementType = $this->faker->randomElement([
                'adjustment_decrease', 'transfer_out', 'sale_fulfill', 'damage_write_off'
            ]);
            
            $quantityBefore = $this->faker->numberBetween(50, 500);
            $quantityMoved = -$this->faker->numberBetween(1, min(100, $quantityBefore));
            
            return [
                'movement_type' => $movementType,
                'quantity_before' => $quantityBefore,
                'quantity_moved' => $quantityMoved,
                'quantity_after' => $quantityBefore + $quantityMoved,
            ];
        });
    }

    /**
     * Create applied movement
     */
    public function applied(): static
    {
        return $this->state([
            'status' => 'applied',
            'approved_by' => User::factory(),
            'approved_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Create pending movement
     */
    public function pending(): static
    {
        return $this->state([
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }
}
