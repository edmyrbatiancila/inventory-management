<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StockTransfer>
 */
class StockTransferFactory extends Factory
{
    protected $model = StockTransfer::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(StockTransfer::STATUSES);
        $initiatedAt = $this->faker->dateTimeBetween('-30 days', 'now');

        // Generate realistic reference number
        $referenceNumber = 'ST-' . strtoupper($this->faker->bothify('????-####'));

        // Get random warehouses (ensure they're different)
        $warehouses = Warehouse::pluck('id')->toArray();
        $fromWarehouseId = $this->faker->randomElement($warehouses);
        $toWarehouseId = $this->faker->randomElement(
            array_filter($warehouses, fn($id) => $id !== $fromWarehouseId)
        );

        return [
            'from_warehouse_id' => $fromWarehouseId,
            'to_warehouse_id' => $toWarehouseId,
            'product_id' => Product::factory(),
            'quantity_transferred' => $this->faker->numberBetween(1, 100),
            'transfer_status' => $status,
            'reference_number' => $referenceNumber,
            'initiated_by' => User::factory(),
            'approved_by' => $this->shouldHaveApprover($status) ? User::factory() : null,
            'completed_by' => $this->shouldHaveCompleter($status) ? User::factory() : null,
            'notes' => $this->faker->optional(0.6)->paragraph(),
            'cancellation_reason' => $status === StockTransfer::STATUS_CANCELLED ? 
                $this->faker->sentence() : null,
            'initiated_at' => $initiatedAt,
            'approved_at' => $this->getApprovedAt($status, $initiatedAt),
            'completed_at' => $this->getCompletedAt($status, $initiatedAt),
            'cancelled_at' => $status === StockTransfer::STATUS_CANCELLED ? 
                $this->faker->dateTimeBetween($initiatedAt, 'now') : null,
        ];
    }

    // State methods for different statuses
    public function pending(): self
    {
        return $this->state([
            'transfer_status' => StockTransfer::STATUS_PENDING,
            'approved_by' => null,
            'completed_by' => null,
            'approved_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);
    }

    public function approved(): self
    {
        $initiatedAt = $this->faker->dateTimeBetween('-15 days', '-5 days');
        $approvedAt = $this->faker->dateTimeBetween($initiatedAt, 'now');

        return $this->state([
            'transfer_status' => StockTransfer::STATUS_APPROVED,
            'initiated_at' => $initiatedAt,
            'approved_by' => User::factory(),
            'approved_at' => $approvedAt,
            'completed_by' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);
    }

    public function completed(): self
    {
        $initiatedAt = $this->faker->dateTimeBetween('-20 days', '-10 days');
        $approvedAt = $this->faker->dateTimeBetween($initiatedAt, '-8 days');
        $completedAt = $this->faker->dateTimeBetween($approvedAt, 'now');

        return $this->state([
            'transfer_status' => StockTransfer::STATUS_COMPLETED,
            'initiated_at' => $initiatedAt,
            'approved_by' => User::factory(),
            'completed_by' => User::factory(), 
            'approved_at' => $approvedAt,
            'completed_at' => $completedAt,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);
    }

    public function cancelled(): self
    {
        $initiatedAt = $this->faker->dateTimeBetween('-15 days', '-5 days');
        $cancelledAt = $this->faker->dateTimeBetween($initiatedAt, 'now');

        return $this->state([
            'transfer_status' => StockTransfer::STATUS_CANCELLED,
            'initiated_at' => $initiatedAt,
            'approved_by' => null,
            'completed_by' => null,
            'approved_at' => null,
            'completed_at' => null,
            'cancelled_at' => $cancelledAt,
            'cancellation_reason' => $this->faker->sentence(),
        ]);
    }

    // Helper methods
    private function shouldHaveApprover(string $status): bool
    {
        return in_array($status, [
            StockTransfer::STATUS_APPROVED,
            StockTransfer::STATUS_IN_TRANSIT,
            StockTransfer::STATUS_COMPLETED
        ]);
    }

    private function shouldHaveCompleter(string $status): bool
    {
        return $status === StockTransfer::STATUS_COMPLETED;
    }

    private function getApprovedAt(string $status, $initiatedAt)
    {
        if (!$this->shouldHaveApprover($status)) {
            return null;
        }

        return $this->faker->dateTimeBetween($initiatedAt, 'now');
    }

    private function getCompletedAt(string $status, $initiatedAt)
    {
        if (!$this->shouldHaveCompleter($status)) {
            return null;
        }

        $approvedAt = $this->getApprovedAt($status, $initiatedAt);
        return $this->faker->dateTimeBetween($approvedAt ?: $initiatedAt, 'now');
    }
}
