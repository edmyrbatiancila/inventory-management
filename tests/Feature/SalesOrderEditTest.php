<?php

use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Product;

beforeEach(function () {
    $this->user = User::factory()->create(['type' => 'admin']);
    $this->warehouse = Warehouse::factory()->create();
    $this->product = Product::factory()->create(['price' => 100.00]);
    
    $this->salesOrder = SalesOrder::factory()->create([
        'status' => 'draft',
        'warehouse_id' => $this->warehouse->id,
        'created_by' => $this->user->id,
        'customer_name' => 'Test Customer',
        'tax_rate' => 0.22, // 22% stored as decimal
    ]);

    SalesOrderItem::factory()->create([
        'sales_order_id' => $this->salesOrder->id,
        'product_id' => $this->product->id,
        'quantity_ordered' => 10,
        'unit_price' => 100.00,
        'line_total' => 1000.00
    ]);

    $this->actingAs($this->user);
});

it('can update sales order with tax rate as percentage', function () {
    // Test the problematic case: tax_rate = 22 (percentage)
    $response = $this->put(route('admin.sales-orders.update', $this->salesOrder->id), [
        'customer_name' => 'Updated Customer',
        'warehouse_id' => $this->warehouse->id,
        'tax_rate' => '22', // This was failing before the fix
    ]);

    $response->assertSessionDoesntHaveErrors(['tax_rate']);
    
    // Verify the tax_rate was converted to decimal
    $this->salesOrder->refresh();
    expect((float) $this->salesOrder->tax_rate)->toBe(0.22);
});

it('accepts valid tax rate percentage values', function () {
    $testCases = [
        ['input' => '0', 'expected' => 0.0],
        ['input' => '5.5', 'expected' => 0.055],
        ['input' => '22', 'expected' => 0.22],
        ['input' => '100', 'expected' => 1.0],
    ];

    foreach ($testCases as $testCase) {
        $response = $this->put(route('admin.sales-orders.update', $this->salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $this->warehouse->id,
            'tax_rate' => $testCase['input'],
        ]);

        $response->assertSessionDoesntHaveErrors(['tax_rate']);

        $this->salesOrder->refresh();
        expect((float) $this->salesOrder->tax_rate)
            ->toBe($testCase['expected'], "Tax rate {$testCase['input']}% should convert to decimal {$testCase['expected']}");
    }
});

it('rejects invalid tax rate values', function () {
    $invalidValues = ['-1', '101', '150', '-5.5'];

    foreach ($invalidValues as $invalidValue) {
        $response = $this->put(route('admin.sales-orders.update', $this->salesOrder->id), [
            'customer_name' => 'Test Customer',
            'warehouse_id' => $this->warehouse->id,
            'tax_rate' => $invalidValue,
        ]);

        $response->assertSessionHasErrors(['tax_rate']);
    }
});

it('allows empty tax rate', function () {
    $response = $this->put(route('admin.sales-orders.update', $this->salesOrder->id), [
        'customer_name' => 'Test Customer',
        'warehouse_id' => $this->warehouse->id,
        'tax_rate' => '', // Empty string should be allowed
    ]);

    $response->assertSessionDoesntHaveErrors(['tax_rate']);

    $this->salesOrder->refresh();
    expect($this->salesOrder->tax_rate)->toBeNull();
});

it('prevents editing financial fields for confirmed orders', function () {
    $this->salesOrder->update(['status' => 'confirmed']);

    $response = $this->put(route('admin.sales-orders.update', $this->salesOrder->id), [
        'customer_name' => 'Should Not Update',
        'tax_rate' => '30',
    ]);

    $response->assertSessionHasErrors(['customer_name', 'tax_rate']);

    // Assert values weren't changed
    $this->salesOrder->refresh();
    expect($this->salesOrder->customer_name)->toBe('Test Customer');
    expect((float) $this->salesOrder->tax_rate)->toBe(0.22);
});

it('can update sales order with valid data', function () {
    $updateData = [
        'customer_name' => 'Updated Customer Name',
        'customer_email' => 'updated@example.com',
        'customer_phone' => '1234567890',
        'customer_address' => 'Updated Address',
        'tax_rate' => '25', // 25%
        'shipping_cost' => '75.50',
        'discount_amount' => '40.00',
        'notes' => 'Updated notes',
    ];

    $response = $this->put(route('admin.sales-orders.update', $this->salesOrder->id), $updateData);

    $response->assertRedirect();
    $response->assertSessionDoesntHaveErrors();

    // Assert database was updated
    $this->salesOrder->refresh();
    expect($this->salesOrder->customer_name)->toBe('Updated Customer Name');
    expect($this->salesOrder->customer_email)->toBe('updated@example.com');
    expect($this->salesOrder->customer_phone)->toBe('1234567890');
    expect($this->salesOrder->customer_address)->toBe('Updated Address');
    expect((float) $this->salesOrder->tax_rate)->toBe(0.25); // Should be stored as decimal
    expect((float) $this->salesOrder->shipping_cost)->toBe(75.50);
    expect((float) $this->salesOrder->discount_amount)->toBe(40.00);
    expect($this->salesOrder->notes)->toBe('Updated notes');
});