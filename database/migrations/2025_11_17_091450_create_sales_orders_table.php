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
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();

            // Sales Order Identification
            $table->string('so_number')->unique(); // SO-2025-001
            $table->string('customer_reference')->nullable(); // Customer's own reference number/PO
            
            // Customer Information
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('customer_address')->nullable();
            $table->string('customer_contact_person')->nullable();

            // Sales Order Details
            $table->enum('status', [
                'draft', 'pending_approval', 'approved', 'confirmed', 
                'partially_fulfilled', 'fully_fulfilled', 'shipped', 'delivered', 'cancelled', 'closed'
            ])->default('draft');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            // Warehouse & User Information
            $table->foreignId('warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('fulfilled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('shipped_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Financial Information
            $table->decimal('subtotal', 12, 4)->default(0); // Sum of all line items
            $table->decimal('tax_rate', 5, 4)->default(0); // Tax percentage (0.0000 - 1.0000)
            $table->decimal('tax_amount', 12, 4)->default(0); // Calculated tax amount
            $table->decimal('shipping_cost', 10, 4)->default(0); // Shipping/delivery cost
            $table->decimal('discount_amount', 10, 4)->default(0); // Total discount
            $table->decimal('total_amount', 12, 4)->default(0); // Final total amount

            // Dates
            $table->date('requested_delivery_date')->nullable();
            $table->date('promised_delivery_date')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('confirmed_at')->nullable(); // When confirmed with customer
            $table->timestamp('fulfilled_at')->nullable(); // When fully fulfilled/picked
            $table->timestamp('shipped_at')->nullable(); // When shipped
            $table->timestamp('delivered_at')->nullable(); // When delivered
            $table->timestamp('cancelled_at')->nullable();

            // Shipping Information
            $table->text('shipping_address')->nullable();
            $table->string('shipping_method')->nullable(); // Standard, Express, etc.
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable(); // FedEx, UPS, etc.
            
            // Additional Information
            $table->text('notes')->nullable(); // Internal notes
            $table->text('customer_notes')->nullable(); // Customer instructions
            $table->text('terms_and_conditions')->nullable(); // SO terms
            $table->text('cancellation_reason')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable(); // Additional flexible data
            $table->boolean('is_recurring')->default(false); // For recurring orders
            $table->string('currency', 3)->default('USD'); // Currency code
            $table->string('payment_terms')->nullable(); // Net 30, COD, etc.
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'overdue', 'cancelled'])->default('pending');

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['status', 'created_at']);
            $table->index(['warehouse_id', 'created_at']);
            $table->index(['created_by', 'created_at']);
            $table->index(['requested_delivery_date']);
            $table->index(['promised_delivery_date']);
            $table->index(['customer_name', 'created_at']);
            $table->index('so_number');
            $table->index(['payment_status', 'created_at']);
            $table->index('tracking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};
