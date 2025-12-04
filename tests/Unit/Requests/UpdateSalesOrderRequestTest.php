<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\UpdateSalesOrderRequest;
use App\Models\SalesOrder;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdateSalesOrderRequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected SalesOrder $salesOrder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['type' => 'admin']);
        $warehouse = Warehouse::factory()->create();
        
        $this->salesOrder = SalesOrder::factory()->create([
            'status' => 'draft',
            'warehouse_id' => $warehouse->id,
            'created_by' => $this->user->id,
        ]);

        $this->actingAs($this->user);
    }

    /** @test */
    public function tax_rate_validation_accepts_valid_percentage_values()
    {
        $validValues = ['0', '5', '10.5', '22', '100'];

        foreach ($validValues as $taxRate) {
            $data = [
                'customer_name' => 'Test Customer',
                'warehouse_id' => $this->salesOrder->warehouse_id,
                'tax_rate' => $taxRate,
            ];

            $request = new UpdateSalesOrderRequest();
            $request->setRouteResolver(function () {
                return app('router')->current();
            });
            
            // Mock the route parameter
            app('router')->current()->parameters['salesOrder'] = $this->salesOrder;
            
            $validator = Validator::make($data, $request->rules());

            $this->assertFalse(
                $validator->fails(),
                "Tax rate '$taxRate' should be valid. Errors: " . json_encode($validator->errors()->toArray())
            );
        }
    }

    /** @test */
    public function tax_rate_validation_rejects_invalid_values()
    {
        $invalidValues = ['-1', '101', '150', '-10.5', 'abc', ''];

        foreach ($invalidValues as $taxRate) {
            $data = [
                'customer_name' => 'Test Customer',
                'warehouse_id' => $this->salesOrder->warehouse_id,
                'tax_rate' => $taxRate,
            ];

            $request = new UpdateSalesOrderRequest();
            $request->setRouteResolver(function () {
                return app('router')->current();
            });
            
            // Mock the route parameter
            app('router')->current()->parameters['salesOrder'] = $this->salesOrder;
            
            $validator = Validator::make($data, $request->rules());

            if ($taxRate !== '') { // Empty string is allowed (nullable)
                $this->assertTrue(
                    $validator->fails(),
                    "Tax rate '$taxRate' should be invalid"
                );
                
                if ($validator->fails()) {
                    $this->assertArrayHasKey('tax_rate', $validator->errors()->toArray());
                }
            }
        }
    }

    /** @test */
    public function validation_rules_change_based_on_sales_order_status()
    {
        // Test draft status - should allow changes
        $this->salesOrder->update(['status' => 'draft']);
        
        $data = [
            'customer_name' => 'Updated Customer',
            'tax_rate' => '15',
            'items' => [
                [
                    'product_id' => 1,
                    'quantity_ordered' => 5,
                    'unit_price' => 100,
                ]
            ]
        ];

        $request = new UpdateSalesOrderRequest();
        $request->setRouteResolver(function () {
            return app('router')->current();
        });
        
        app('router')->current()->parameters['salesOrder'] = $this->salesOrder;
        
        $validator = Validator::make($data, $request->rules());
        $this->assertFalse($validator->fails(), 'Draft orders should allow customer and financial changes');

        // Test confirmed status - should restrict changes
        $this->salesOrder->update(['status' => 'confirmed']);
        
        app('router')->current()->parameters['salesOrder'] = $this->salesOrder;
        
        $validator = Validator::make($data, $request->rules());
        $this->assertTrue($validator->fails(), 'Confirmed orders should restrict customer and financial changes');
        $this->assertArrayHasKey('customer_name', $validator->errors()->toArray());
        $this->assertArrayHasKey('tax_rate', $validator->errors()->toArray());
        $this->assertArrayHasKey('items', $validator->errors()->toArray());
    }

    /** @test */
    public function request_authorization_works_correctly()
    {
        $request = new UpdateSalesOrderRequest();
        $request->setUserResolver(function () {
            return $this->user;
        });
        $request->setRouteResolver(function () {
            return app('router')->current();
        });

        app('router')->current()->parameters['salesOrder'] = $this->salesOrder;

        $this->assertTrue($request->authorize());

        // Test with unauthorized user
        $unauthorizedUser = User::factory()->create(['type' => 'user']);
        $request->setUserResolver(function () use ($unauthorizedUser) {
            return $unauthorizedUser;
        });

        $this->assertFalse($request->authorize());
    }

    /** @test */
    public function validation_messages_are_properly_defined()
    {
        $request = new UpdateSalesOrderRequest();
        $messages = $request->messages();

        $this->assertArrayHasKey('tax_rate.between', $messages);
        $this->assertEquals('Tax rate must be between 0% and 100%.', $messages['tax_rate.between']);
        
        $this->assertArrayHasKey('customer_name.required', $messages);
        $this->assertArrayHasKey('warehouse_id.required', $messages);
    }

    /** @test */
    public function validation_attributes_are_properly_defined()
    {
        $request = new UpdateSalesOrderRequest();
        $attributes = $request->attributes();

        $this->assertArrayHasKey('so_number', $attributes);
        $this->assertEquals('sales order number', $attributes['so_number']);
        
        $this->assertArrayHasKey('customer_reference', $attributes);
        $this->assertEquals('customer reference', $attributes['customer_reference']);
    }
}