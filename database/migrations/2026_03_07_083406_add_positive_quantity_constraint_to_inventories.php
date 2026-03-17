<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            // Add check constraints to ensure quantities are not negative
            DB::statement('ALTER TABLE inventories ADD CONSTRAINT check_positive_quantity_available CHECK (quantity_available >= 0)');
            DB::statement('ALTER TABLE inventories ADD CONSTRAINT check_positive_quantity_on_hand CHECK (quantity_on_hand >= 0)');
            DB::statement('ALTER TABLE inventories ADD CONSTRAINT check_positive_quantity_reserved CHECK (quantity_reserved >= 0)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For MySQL, we need to use DROP CHECK instead of DROP CONSTRAINT
        DB::statement('ALTER TABLE inventories DROP CHECK check_positive_quantity_available');
        DB::statement('ALTER TABLE inventories DROP CHECK check_positive_quantity_on_hand');
        DB::statement('ALTER TABLE inventories DROP CHECK check_positive_quantity_reserved');
    }
};
