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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            // Foreign keys
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');

            // Product Details
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('sku')->unique(); // Stock Keeping Unit
            $table->string('barcode')->nullable()->unique();
            $table->decimal('price', 10, 2); // Selling price
            $table->decimal('cost_price', 10, 2)->nullable(); // Cost/purchase price
            $table->integer('min_stock_level')->default(0); // Reorder point
            $table->integer('max_stock_level')->nullable(); // Maximum stock
            $table->json('images')->nullable(); // Multiple Product Images
            $table->json('specifications')->nullable(); // Product specs (size, weight, etc.)
            $table->boolean('is_active')->default(true);
            $table->boolean('track_quantity')->default(true); // Some products might not need quantity tracking
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
