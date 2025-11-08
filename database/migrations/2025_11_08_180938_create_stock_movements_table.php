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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who performed the movement

            // Movement Details
            $table->string('reference_number')->unique();
            $table->enum('movement_type', [
                'adjustment_increase', 'adjustment_decrease', 
                'transfer_in', 'transfer_out',
                'purchase_receive', 'sale_fulfill',
                'return_customer', 'return_supplier',
                'damage_write_off', 'expiry_write_off'
            ]);
            $table->integer('quantity_before'); // Stock before movement
            $table->integer('quantity_moved'); // Positive or negative quantity
            $table->integer('quantity_after'); // Stock after movement

            // Cost and Value Tracking
            $table->decimal('unit_cost', 10, 4)->nullable(); // Cost per unit at time of movement
            $table->decimal('total_value', 12, 4)->nullable(); // Total value of movement
            
            // Movement Context
            $table->string('reason')->nullable(); // Reason for movement
            $table->text('notes')->nullable(); // Additional notes
            $table->json('metadata')->nullable(); // Additional context (adjustment_id, transfer_id, etc.)
            
            // Related Document References
            $table->string('related_document_type')->nullable(); // 'adjustment', 'transfer', 'purchase_order', 'sale_order'
            $table->unsignedBigInteger('related_document_id')->nullable(); // ID of related document
            
            // Status and Approval
            $table->enum('status', ['pending', 'approved', 'rejected', 'applied'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['product_id', 'warehouse_id']);
            $table->index(['movement_type', 'created_at']);
            $table->index(['related_document_type', 'related_document_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
