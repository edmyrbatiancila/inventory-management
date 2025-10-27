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
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();

            // Core Transfer Fields
            $table->foreignId('from_warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('to_warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity_transferred');

            // Transfer Status & Workflow
            $table->enum('transfer_status', ['pending', 'approved', 'in_transit', 'completed', 'cancelled'])->default('pending');
            $table->string('reference_number')->unique();

            // User Tracking
            $table->foreignId('initiated_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('completed_by')->nullable()->constrained('users')->onDelete('set null');

            // Additional Information
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Timestamps
            $table->timestamp('initiated_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();


            $table->timestamps();
            $table->softDeletes();

            // Indexes for Performance
            $table->index(['transfer_status', 'created_at']);
            $table->index(['from_warehouse_id', 'created_at']);
            $table->index(['to_warehouse_id', 'created_at']);
            $table->index(['product_id', 'created_at']);
            $table->index('reference_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_transfers');
    }
};
