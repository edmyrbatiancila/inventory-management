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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained()->onDelete('cascade');
            $table->enum('adjustment_type', ['increase', 'decrease']);
            $table->integer('quantity_adjusted'); // Positive number (type determines +/-)
            $table->integer('quantity_before'); // Stock level before adjustment
            $table->integer('quantity_after'); // Stock level after adjustment
            $table->string('reason'); // Predefined reasons (damage, found, theft, etc.)
            $table->text('notes')->nullable(); // Additional notes
            $table->string('reference_number')->unique(); // Auto-generated reference
            $table->foreignId('adjusted_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('adjusted_at');
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['inventory_id', 'adjusted_at']);
            $table->index(['adjusted_by', 'adjusted_at']);
            $table->index('adjustment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
