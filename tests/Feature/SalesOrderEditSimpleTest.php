<?php

namespace Tests\Feature;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesOrderEditSimpleTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tax_rate_validation_fix_works()
    {
        // Create test data
        $user = User::factory()->create(['type' => 'admin']);
        $warehouse = Warehouse::factory()->create();
        $product = Product::factory()->create(['price' => 100.00]);
        
        $salesOrder = SalesOrder::factory()->create([
            'status' => 'draft',
            'warehouse_id' => $warehouse->id,
            'created_by' => $user->id,
            'customer_name' => 'Test Customer',
            'tax_rate' => 0.22, // 22% stored as decimal
        ]);

        SalesOrderItem::factory()->create([
            'sales_order_id' => $salesOrder->id,
            'product_id' => $product->id,
            'quantity_ordered' => 10,
            'unit_price' => 100.00,
            'line_total' => 1000.00
        ]);

        $this->actingAs($user);

        // Test the problematic case: tax_rate = 22 (percentage)
        $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
            'customer_name' => 'Updated Customer',
            'warehouse_id' => $warehouse->id,
            'tax_rate' => '22', // This was failing before the fix
        ]);

        $response->assertSessionDoesntHaveErrors(['tax_rate']);
        
        // Verify the tax_rate was converted to decimal
        $salesOrder->refresh();
        $this->assertEquals(0.22, (float) $salesOrder->tax_rate);
    }

    /** @test */
    public function tax_rate_edge_cases_work()
    {
        $user = User::factory()->create(['type' => 'admin']);
        $warehouse = Warehouse::factory()->create();
        
        $salesOrder = SalesOrder::factory()->create([
            'status' => 'draft',
            'warehouse_id' => $warehouse->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        // Test 0%
        $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $warehouse->id,
            'tax_rate' => '0',
        ]);
        $response->assertSessionDoesntHaveErrors(['tax_rate']);

        // Test 100%
        $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $warehouse->id,
            'tax_rate' => '100',
        ]);
        $response->assertSessionDoesntHaveErrors(['tax_rate']);

        // Test decimal percentage
        $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $warehouse->id,
            'tax_rate' => '10.5',
        ]);
        $response->assertSessionDoesntHaveErrors(['tax_rate']);

        $salesOrder->refresh();
        $this->assertEquals(0.105, (float) $salesOrder->tax_rate);
    }

    /** @test */
    public function invalid_tax_rates_are_rejected()
    {
        $user = User::factory()->create(['type' => 'admin']);
        $warehouse = Warehouse::factory()->create();
        
        $salesOrder = SalesOrder::factory()->create([
            'status' => 'draft',
            'warehouse_id' => $warehouse->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        // Test negative value
        $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $warehouse->id,
            'tax_rate' => '-1',
        ]);
        $response->assertSessionHasErrors(['tax_rate']);

        // Test over 100%
        $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $warehouse->id,
            'tax_rate' => '101',
        ]);
        $response->assertSessionHasErrors(['tax_rate']);
    }
}