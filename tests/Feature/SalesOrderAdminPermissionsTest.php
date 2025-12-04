<?php

use App\Models\SalesOrder;
use App\Models\User;
use App\Models\Warehouse;

beforeEach(function () {
    $this->warehouse = Warehouse::factory()->create();
});

it('allows admin users to edit sales orders created by others', function () {
    // Create a regular user and their sales order
    $regularUser = User::factory()->create(['type' => 'user']);
    $salesOrder = SalesOrder::factory()->create([
        'status' => 'draft',
        'warehouse_id' => $this->warehouse->id,
        'created_by' => $regularUser->id,
        'customer_name' => 'Original Customer'
    ]);

    // Create an admin user
    $adminUser = User::factory()->create(['type' => 'admin']);
    $this->actingAs($adminUser);

    // Admin should be able to edit the sales order
    $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
        'customer_name' => 'Updated by Admin',
        'warehouse_id' => $this->warehouse->id,
    ]);

    $response->assertSessionDoesntHaveErrors();
    $response->assertRedirect();
    
    // Verify the data was updated
    $salesOrder->refresh();
    expect($salesOrder->customer_name)->toBe('Updated by Admin');
});

it('allows admin users to edit pending approval sales orders', function () {
    // Create a sales order in pending_approval status
    $regularUser = User::factory()->create(['type' => 'user']);
    $salesOrder = SalesOrder::factory()->create([
        'status' => 'pending_approval',
        'warehouse_id' => $this->warehouse->id,
        'created_by' => $regularUser->id,
        'customer_name' => 'Pending Order'
    ]);

    // Admin should be able to edit pending approval orders
    $adminUser = User::factory()->create(['type' => 'admin']);
    $this->actingAs($adminUser);

    $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
        'customer_name' => 'Admin Updated Pending Order',
        'warehouse_id' => $this->warehouse->id,
    ]);

    $response->assertSessionDoesntHaveErrors();
    
    $salesOrder->refresh();
    expect($salesOrder->customer_name)->toBe('Admin Updated Pending Order');
});

it('prevents admin users from editing confirmed sales orders', function () {
    // Create a confirmed sales order
    $regularUser = User::factory()->create(['type' => 'user']);
    $salesOrder = SalesOrder::factory()->create([
        'status' => 'confirmed',
        'warehouse_id' => $this->warehouse->id,
        'created_by' => $regularUser->id,
    ]);

    $adminUser = User::factory()->create(['type' => 'admin']);
    $this->actingAs($adminUser);

    // Even admins shouldn't edit confirmed orders
    $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
        'customer_name' => 'Should Not Update',
        'warehouse_id' => $this->warehouse->id,
    ]);

    $response->assertForbidden();
});

it('allows regular users to edit only their own draft sales orders', function () {
    // Create two regular users
    $user1 = User::factory()->create(['type' => 'user']);
    $user2 = User::factory()->create(['type' => 'user']);
    
    // User1 creates a sales order
    $salesOrder = SalesOrder::factory()->create([
        'status' => 'draft',
        'warehouse_id' => $this->warehouse->id,
        'created_by' => $user1->id,
    ]);

    // User2 tries to edit User1's sales order
    $this->actingAs($user2);
    
    $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
        'customer_name' => 'Should Not Update',
        'warehouse_id' => $this->warehouse->id,
    ]);

    $response->assertForbidden();
});

it('supports legacy admin email pattern', function () {
    // Create a user with the legacy admin email pattern
    $legacyAdmin = User::factory()->create([
        'email' => 'admin@gmail.com',
        'type' => 'user' // Even with user type, should still be admin due to email
    ]);

    $regularUser = User::factory()->create(['type' => 'user']);
    $salesOrder = SalesOrder::factory()->create([
        'status' => 'draft',
        'warehouse_id' => $this->warehouse->id,
        'created_by' => $regularUser->id,
    ]);

    $this->actingAs($legacyAdmin);

    // Legacy admin should be able to edit the sales order
    $response = $this->put(route('admin.sales-orders.update', $salesOrder->id), [
        'customer_name' => 'Updated by Legacy Admin',
        'warehouse_id' => $this->warehouse->id,
    ]);

    $response->assertSessionDoesntHaveErrors();
    
    $salesOrder->refresh();
    expect($salesOrder->customer_name)->toBe('Updated by Legacy Admin');
});

it('correctly identifies admin users using isAdmin helper method', function () {
    // Test type-based admin
    $typeAdmin = User::factory()->create(['type' => 'admin']);
    expect($typeAdmin->isAdmin())->toBeTrue();

    // Test email-based admin (legacy)
    $emailAdmin = User::factory()->create([
        'email' => 'admin@gmail.com',
        'type' => 'user'
    ]);
    expect($emailAdmin->isAdmin())->toBeTrue();

    // Test regular user
    $regularUser = User::factory()->create(['type' => 'user']);
    expect($regularUser->isAdmin())->toBeFalse();
});