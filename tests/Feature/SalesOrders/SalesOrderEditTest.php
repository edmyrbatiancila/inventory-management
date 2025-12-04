<?php

namespace Tests\Feature\SalesOrders;

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class SalesOrderEditTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Warehouse $warehouse;
    protected Product $product;
    protected SalesOrder $salesOrder;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user
        $this->user = User::factory()->create([
            'type' => 'admin',
            'email' => 'admin@test.com'
        ]);

        // Create test warehouse
        $this->warehouse = Warehouse::factory()->create([
            'name' => 'Test Warehouse',
            'code' => 'TW001'
        ]);

        // Create test product
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'price' => 100.00
        ]);

        // Create test sales order
        $this->salesOrder = SalesOrder::factory()->create([
            'status' => 'draft',
            'warehouse_id' => $this->warehouse->id,
            'created_by' => $this->user->id,
            'customer_name' => 'Test Customer',
            'subtotal' => 1000.00,
            'tax_rate' => 0.22, // 22% stored as decimal
            'tax_amount' => 220.00,
            'shipping_cost' => 50.00,
            'discount_amount' => 30.00,
            'total_amount' => 1240.00,
        ]);

        // Create test sales order item
        SalesOrderItem::factory()->create([
            'sales_order_id' => $this->salesOrder->id,
            'product_id' => $this->product->id,
            'quantity_ordered' => 10,
            'unit_price' => 100.00,
            'line_total' => 1000.00
        ]);

        // Authenticate user
        $this->actingAs($this->user);
    }

    /** @test */
    public function user_can_view_sales_order_edit_page()
    {
        $response = $this->get(route('admin.sales-orders.edit', $this->salesOrder->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('admin/sales-orders/Edit')
                ->has('sales_order')
                ->where('sales_order.id', $this->salesOrder->id)
                ->where('sales_order.tax_rate', '0.2200') // Should be decimal
                ->has('warehouses')
                ->has('products')
        );
    }

    /** @test */
    public function user_can_update_sales_order_with_valid_data()
    {
        $updateData = [
            'customer_name' => 'Updated Customer Name',
            'customer_email' => 'updated@example.com',
            'customer_phone' => '1234567890',
            'customer_address' => 'Updated Address',
            'tax_rate' => '25', // Percentage value (will be converted to 0.25)
            'shipping_cost' => '75.50',
            'discount_amount' => '40.00',
            'notes' => 'Updated notes',
            'items' => [
                [
                    'id' => $this->salesOrder->items->first()->id,
                    'product_id' => $this->product->id,
                    'quantity_ordered' => 15,
                    'unit_price' => 120.00,
                    'line_total' => 1800.00,
                    'notes' => 'Updated item notes'
                ]
            ]
        ];

        $response = $this->put(
            route('admin.sales-orders.update', $this->salesOrder->id),
            $updateData
        );

        $response->assertRedirect();
        $response->assertSessionDoesntHaveErrors();

        // Assert database was updated
        $this->salesOrder->refresh();
        $this->assertEquals('Updated Customer Name', $this->salesOrder->customer_name);
        $this->assertEquals('updated@example.com', $this->salesOrder->customer_email);
        $this->assertEquals('1234567890', $this->salesOrder->customer_phone);
        $this->assertEquals('Updated Address', $this->salesOrder->customer_address);
        $this->assertEquals(0.25, $this->salesOrder->tax_rate); // Should be stored as decimal
        $this->assertEquals(75.50, $this->salesOrder->shipping_cost);
        $this->assertEquals(40.00, $this->salesOrder->discount_amount);
        $this->assertEquals('Updated notes', $this->salesOrder->notes);

        // Assert item was updated
        $item = $this->salesOrder->items->first();
        $this->assertEquals(15, $item->quantity_ordered);
        $this->assertEquals(120.00, $item->unit_price);
        $this->assertEquals('Updated item notes', $item->notes);
    }

    /** @test */
    public function tax_rate_validation_accepts_percentage_values()
    {
        $testCases = [
            ['tax_rate' => '0', 'expected_decimal' => 0.0],
            ['tax_rate' => '5.5', 'expected_decimal' => 0.055],
            ['tax_rate' => '22', 'expected_decimal' => 0.22],
            ['tax_rate' => '100', 'expected_decimal' => 1.0],
        ];

        foreach ($testCases as $testCase) {
            $response = $this->put(
                route('admin.sales-orders.update', $this->salesOrder->id),
                [
                    'customer_name' => $this->salesOrder->customer_name,
                    'warehouse_id' => $this->salesOrder->warehouse_id,
                    'tax_rate' => $testCase['tax_rate'],
                ]
            );

            $response->assertSessionDoesntHaveErrors(['tax_rate']);

            $this->salesOrder->refresh();
            $this->assertEquals(
                $testCase['expected_decimal'], 
                (float) $this->salesOrder->tax_rate,
                "Tax rate {$testCase['tax_rate']}% should convert to decimal {$testCase['expected_decimal']}"
            );
        }
    }

    /** @test */
    public function tax_rate_validation_rejects_invalid_values()
    {
        $invalidValues = ['-1', '101', '150', '-5.5'];

        foreach ($invalidValues as $invalidValue) {
            $response = $this->put(
                route('admin.sales-orders.update', $this->salesOrder->id),
                [
                    'customer_name' => $this->salesOrder->customer_name,
                    'warehouse_id' => $this->salesOrder->warehouse_id,
                    'tax_rate' => $invalidValue,
                ]
            );

            $response->assertSessionHasErrors(['tax_rate']);
        }
    }

    /** @test */
    public function user_cannot_update_non_editable_fields_for_confirmed_orders()
    {
        // Update sales order to confirmed status
        $this->salesOrder->update(['status' => 'confirmed']);

        $response = $this->put(
            route('admin.sales-orders.update', $this->salesOrder->id),
            [
                'customer_name' => 'Should Not Update',
                'tax_rate' => '30',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity_ordered' => 20,
                        'unit_price' => 150.00,
                    ]
                ]
            ]
        );

        $response->assertSessionHasErrors(['customer_name', 'tax_rate', 'items']);

        // Assert values weren't changed
        $this->salesOrder->refresh();
        $this->assertEquals('Test Customer', $this->salesOrder->customer_name);
        $this->assertEquals(0.22, $this->salesOrder->tax_rate);
    }

    /** @test */
    public function user_cannot_update_sales_order_without_permission()
    {
        // Create a regular user without admin privileges
        $regularUser = User::factory()->create(['type' => 'user']);
        $this->actingAs($regularUser);

        $response = $this->put(
            route('admin.sales-orders.update', $this->salesOrder->id),
            ['customer_name' => 'Should Not Update']
        );

        $response->assertForbidden();
    }

    /** @test */
    public function empty_tax_rate_is_handled_correctly()
    {
        $response = $this->put(
            route('admin.sales-orders.update', $this->salesOrder->id),
            [
                'customer_name' => $this->salesOrder->customer_name,
                'warehouse_id' => $this->salesOrder->warehouse_id,
                'tax_rate' => '', // Empty string
            ]
        );

        $response->assertSessionDoesntHaveErrors();

        $this->salesOrder->refresh();
        $this->assertNull($this->salesOrder->tax_rate);
    }

    /** @test */
    public function sales_order_totals_are_recalculated_after_update()
    {
        // Update with new values
        $updateData = [
            'customer_name' => $this->salesOrder->customer_name,
            'warehouse_id' => $this->salesOrder->warehouse_id,
            'tax_rate' => '15', // 15%
            'shipping_cost' => '25.00',
            'discount_amount' => '50.00',
            'items' => [
                [
                    'id' => $this->salesOrder->items->first()->id,
                    'product_id' => $this->product->id,
                    'quantity_ordered' => 5,
                    'unit_price' => 200.00,
                    'line_total' => 1000.00,
                ]
            ]
        ];

        $response = $this->put(
            route('admin.sales-orders.update', $this->salesOrder->id),
            $updateData
        );

        $response->assertSessionDoesntHaveErrors();

        $this->salesOrder->refresh();
        
        // Verify totals are recalculated
        $expectedSubtotal = 1000.00; // 5 × 200.00
        $expectedTaxAmount = $expectedSubtotal * 0.15; // 15%
        $expectedTotal = $expectedSubtotal + $expectedTaxAmount + 25.00 - 50.00;

        $this->assertEquals($expectedSubtotal, $this->salesOrder->subtotal);
        $this->assertEquals($expectedTaxAmount, $this->salesOrder->tax_amount);
        $this->assertEquals($expectedTotal, $this->salesOrder->total_amount);
    }
}