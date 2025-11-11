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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // Item Details
            $table->string('product_sku'); // Snapshot of SKU at time of order
            $table->string('product_name'); // Snapshot of product name at time of order
            $table->text('product_description')->nullable(); // Additional description
            
            // Quantities
            $table->integer('quantity_ordered'); // Originally ordered quantity
            $table->integer('quantity_received')->default(0); // Actually received quantity
            $table->integer('quantity_pending'); // Pending to receive (calculated)

             // Pricing
            $table->decimal('unit_cost', 10, 4); // Cost per unit at time of order
            $table->decimal('line_total', 12, 4); // quantity_ordered * unit_cost
            $table->decimal('discount_percentage', 5, 4)->default(0); // Item-level discount
            $table->decimal('discount_amount', 10, 4)->default(0); // Item-level discount amount
            $table->decimal('final_line_total', 12, 4); // After discount
            
            // Status & Tracking
            $table->enum('item_status', [
                'pending', 'partially_received', 'fully_received', 'cancelled', 'backordered'
            ])->default('pending');
            
            // Receiving Information
            $table->date('expected_delivery_date')->nullable();
            $table->timestamp('last_received_at')->nullable();
            $table->text('receiving_notes')->nullable();
            
            // Quality Control
            $table->integer('quantity_rejected')->default(0); // Rejected during receiving
            $table->text('rejection_reason')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Flexible additional data
            $table->text('notes')->nullable(); // Item-specific notes

            $table->timestamps();

            // Indexes for performance
            $table->index(['purchase_order_id', 'product_id']);
            $table->index(['product_id', 'created_at']);
            $table->index(['item_status', 'created_at']);
            $table->index(['expected_delivery_date']);
            $table->index('product_sku');
            
            // Note: Database constraints should be handled at the application level
            // Laravel's Blueprint doesn't support check() constraints directly
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
