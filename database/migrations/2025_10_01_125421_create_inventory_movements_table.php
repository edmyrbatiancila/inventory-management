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
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment', 'transfer']);
            $table->integer('quantity'); // Positive for in, negative for out
            $table->integer('quantity_before'); // Stock before movement
            $table->integer('quantity_after'); // Stock after movement
            $table->string('reference_type')->nullable(); // 'purchase_order', 'sale', 'adjustment'
            $table->unsignedBigInteger('reference_id')->nullable(); // ID of related record
            $table->text('notes')->nullable();
            $table->timestamp('movement_date');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
