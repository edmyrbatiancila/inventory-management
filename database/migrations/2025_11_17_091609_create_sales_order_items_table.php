<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales_order_items', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('sales_order_id')->constrained('sales_orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('inventory_id')->nullable()->constrained('inventories')->onDelete('set null');
            
            // Item Details
            $table->string('product_sku'); // Snapshot of SKU at time of order
            $table->string('product_name'); // Snapshot of product name at time of order
            $table->text('product_description')->nullable(); // Additional description
            
            // Quantities
            $table->integer('quantity_ordered'); // Originally ordered quantity
            $table->integer('quantity_fulfilled')->default(0); // Actually fulfilled/picked quantity
            $table->integer('quantity_shipped')->default(0); // Shipped quantity
            $table->integer('quantity_pending'); // Pending to fulfill (calculated)
            $table->integer('quantity_backordered')->default(0); // Backordered quantity

            // Pricing
            $table->decimal('unit_price', 10, 4); // Selling price per unit at time of order
            $table->decimal('line_total', 12, 4); // quantity_ordered * unit_price
            $table->decimal('discount_percentage', 5, 4)->default(0); // Item-level discount
            $table->decimal('discount_amount', 10, 4)->default(0); // Item-level discount amount
            $table->decimal('final_line_total', 12, 4); // After discount
            
            // Status & Tracking
            $table->enum('item_status', [
                'pending', 'confirmed', 'allocated', 'partially_fulfilled', 'fully_fulfilled', 
                'shipped', 'delivered', 'cancelled', 'backordered'
            ])->default('pending');
            
            // Fulfillment Information
            $table->date('requested_delivery_date')->nullable();
            $table->date('promised_delivery_date')->nullable();
            $table->timestamp('allocated_at')->nullable(); // When inventory was reserved
            $table->timestamp('fulfilled_at')->nullable(); // When picked/fulfilled
            $table->timestamp('shipped_at')->nullable(); // When shipped
            $table->timestamp('delivered_at')->nullable(); // When delivered
            $table->text('fulfillment_notes')->nullable();
            
            // Inventory Management
            $table->boolean('requires_allocation')->default(true); // Whether inventory needs to be allocated
            $table->integer('allocated_quantity')->default(0); // Currently allocated inventory
            $table->timestamp('allocation_expires_at')->nullable(); // When allocation expires
            
            // Quality Control
            $table->integer('quantity_returned')->default(0); // Returned quantity
            $table->text('return_reason')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Flexible additional data
            $table->text('notes')->nullable(); // Item-specific notes
            $table->text('customer_notes')->nullable(); // Customer-specific item instructions

            $table->timestamps();

            // Indexes for performance
            $table->index(['sales_order_id', 'product_id']);
            $table->index(['product_id', 'created_at']);
            $table->index(['inventory_id', 'created_at']);
            $table->index(['item_status', 'created_at']);
            $table->index(['requested_delivery_date']);
            $table->index(['promised_delivery_date']);
            $table->index('product_sku');
            $table->index(['requires_allocation', 'allocated_quantity']);
            $table->index('allocation_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_order_items');
    }
};
