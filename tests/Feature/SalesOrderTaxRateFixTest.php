<?php

use App\Models\SalesOrder;
use App\Models\User;
use App\Models\Warehouse;

it('fixes the tax rate validation error when editing sales order', function () {
    // Create test data matching the user's reported scenario
    $user = User::factory()->create(['type' => 'admin']);
    $warehouse = Warehouse::factory()->create([
        'name' => 'Regional Hub - Shanahanborough',
        'code' => 'RH679'
    ]);
    
    $salesOrder = SalesOrder::factory()->create([
        'so_number' => 'SO-202511-860',
        'status' => 'draft',
        'warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
        'customer_name' => 'Inamaw Corp',
        'customer_email' => 'inamawCorp@gmail.com',
        'customer_phone' => '123456788',
        'customer_address' => 'Inamaw Mana St.',
        'customer_contact_person' => 'Mr. Inamaw',
        'tax_rate' => 0.22, // 22% stored as decimal (this was the problematic value)
        'subtotal' => 1995.50,
        'tax_amount' => 439.01,
        'shipping_cost' => 33.00,
        'discount_amount' => 45.00,
        'total_amount' => 2422.51,
    ]);

    $this->actingAs($user);

    // Attempt to update with the same tax rate value that was causing the error
    $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
        'customer_name' => 'Inamaw Corp Updated',
        'customer_email' => 'inamawCorp@gmail.com',
        'warehouse_id' => $warehouse->id,
        'tax_rate' => '22', // This should now work (22% as percentage input)
        'shipping_cost' => '33.00',
        'discount_amount' => '45.00',
        'notes' => 'Updated notes'
    ]);

    // This should NOT have validation errors anymore
    $response->assertSessionDoesntHaveErrors();
    $response->assertRedirect();
    
    // Verify the data was actually updated
    $salesOrder->refresh();
    expect($salesOrder->customer_name)->toBe('Inamaw Corp Updated');
    expect((float) $salesOrder->tax_rate)->toBe(0.22); // Should remain as decimal in DB
});

it('handles the exact error scenario from the user report', function () {
    // Replicate the exact scenario from the error report
    $user = User::factory()->create([
        'id' => 1,
        'name' => 'admin',
        'email' => 'admin@gmail.com',
        'type' => 'admin'
    ]);
    
    $warehouse = Warehouse::factory()->create(['id' => 6]);
    
    $salesOrder = SalesOrder::factory()->create([
        'id' => 36,
        'so_number' => 'SO-202511-860',
        'status' => 'draft',
        'warehouse_id' => 6,
        'created_by' => 1,
        'customer_name' => 'Inamaw Corp',
        'tax_rate' => 0.22, // This is the value causing the error
        'subtotal' => 1995.5002,
        'tax_amount' => 439.01,
        'shipping_cost' => 33.00,
        'discount_amount' => 45.00,
        'total_amount' => 2422.5102,
    ]);

    $this->actingAs($user);

    // This exact request was failing with "Tax rate must be between 0% and 100%"
    $response = $this->put(route('admin.sales-orders.update', 36), [
        'customer_name' => 'Inamaw Corp',
        'warehouse_id' => 6,
        'tax_rate' => '22.00', // The frontend sends this as percentage
    ]);

    // Should NOT have the "Tax rate must be between 0% and 100%" error
    $response->assertSessionDoesntHaveErrors(['tax_rate']);
    
    // Verify we get a successful response
    expect($response->status())->toBe(302); // Redirect after successful update
});