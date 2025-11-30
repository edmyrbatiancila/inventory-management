<?php

use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\User;
use App\Models\Warehouse;

$warehouse = Warehouse::first();
$product = Product::first();  
$user = User::first();

if (!$warehouse || !$product || !$user) {
    echo "Missing required data. Please ensure you have warehouses, products and users in the database.\n";
    exit(1);
}

// Create a sales order
$salesOrder = SalesOrder::create([
    "so_number" => "SO-TEST-" . time(),
    "customer_name" => "Test Customer",
    "warehouse_id" => $warehouse->id,
    "created_by" => $user->id,
    "priority" => "normal",
    "payment_status" => "pending",
    "subtotal" => 500.00,
    "tax_rate" => 10.00,
    "tax_amount" => 50.00,
    "total_amount" => 550.00
]);

echo "Created SalesOrder: " . $salesOrder->id . "\n";

// Create a sales order item  
$item = SalesOrderItem::create([
    "sales_order_id" => $salesOrder->id,
    "product_id" => $product->id,
    "product_sku" => $product->sku,
    "product_name" => $product->name,
    "quantity_ordered" => 5,
    "unit_price" => 100.00
]);

echo "Created SalesOrderItem: " . $item->id . "\n";
echo "Item final_line_total: " . $item->final_line_total . "\n";
echo "Item quantity_pending: " . $item->quantity_pending . "\n";

// Test if totals are calculated correctly
$salesOrder->refresh();
echo "SalesOrder subtotal: " . $salesOrder->subtotal . "\n";
echo "SalesOrder total_amount: " . $salesOrder->total_amount . "\n";

echo "SUCCESS: All operations completed without errors!\n";


