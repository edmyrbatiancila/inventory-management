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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();

            // Purchase Order Identification
            $table->string('po_number')->unique(); // PO-2024-001
            $table->string('supplier_reference')->nullable(); // Supplier's own reference number
            
            // Supplier Information
            $table->string('supplier_name');
            $table->string('supplier_email')->nullable();
            $table->string('supplier_phone')->nullable();
            $table->text('supplier_address')->nullable();
            $table->string('supplier_contact_person')->nullable();

            // Purchase Order Details
            $table->enum('status', [
                'draft', 'pending_approval', 'approved', 'sent_to_supplier', 
                'partially_received', 'fully_received', 'cancelled', 'closed'
            ])->default('draft');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            
            // Warehouse & User Information
            $table->foreignId('warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('received_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Financial Information
            $table->decimal('subtotal', 12, 4)->default(0); // Sum of all line items
            $table->decimal('tax_rate', 5, 4)->default(0); // Tax percentage (0.0000 - 1.0000)
            $table->decimal('tax_amount', 12, 4)->default(0); // Calculated tax amount
            $table->decimal('shipping_cost', 10, 4)->default(0); // Shipping/delivery cost
            $table->decimal('discount_amount', 10, 4)->default(0); // Total discount
            $table->decimal('total_amount', 12, 4)->default(0); // Final total amount

            // Dates
            $table->date('expected_delivery_date')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('sent_at')->nullable(); // When sent to supplier
            $table->timestamp('received_at')->nullable(); // When fully received
            $table->timestamp('cancelled_at')->nullable();
            
            // Additional Information
            $table->text('notes')->nullable(); // Internal notes
            $table->text('terms_and_conditions')->nullable(); // PO terms
            $table->text('cancellation_reason')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Additional flexible data
            $table->boolean('is_recurring')->default(false); // For recurring orders
            $table->string('currency', 3)->default('USD'); // Currency code
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['status', 'created_at']);
            $table->index(['warehouse_id', 'created_at']);
            $table->index(['created_by', 'created_at']);
            $table->index(['expected_delivery_date']);
            $table->index(['supplier_name', 'created_at']);
            $table->index('po_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
