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
        // Add a temporary varchar column to hold new enum values
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->string('type_temp', 20)->nullable()->after('type');
        });

        // Update data in the temporary column
        DB::statement("UPDATE inventory_movements SET type_temp = 'stock_in' WHERE type = 'in'");
        DB::statement("UPDATE inventory_movements SET type_temp = 'stock_out' WHERE type = 'out'");
        DB::statement("UPDATE inventory_movements SET type_temp = 'adjustment_in' WHERE type = 'adjustment' AND quantity > 0");
        DB::statement("UPDATE inventory_movements SET type_temp = 'adjustment_out' WHERE type = 'adjustment' AND quantity < 0");
        DB::statement("UPDATE inventory_movements SET type_temp = 'transfer_out' WHERE type = 'transfer'");
        
        // Handle any records with null or unexpected values
        DB::statement("UPDATE inventory_movements SET type_temp = 'adjustment_in' WHERE type_temp IS NULL AND quantity >= 0");
        DB::statement("UPDATE inventory_movements SET type_temp = 'adjustment_out' WHERE type_temp IS NULL AND quantity < 0");

        // Drop the old enum column
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        // Add the new enum column with expanded values
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->enum('type', [
                'stock_in',
                'stock_out', 
                'adjustment_in',
                'adjustment_out',
                'transfer_in',
                'transfer_out',
                'increase',  // For InventoryService compatibility
                'decrease'   // For InventoryService compatibility
            ])->after('warehouse_id');
        });

        // Copy data from temporary column to new enum column
        DB::statement("UPDATE inventory_movements SET type = type_temp");

        // Drop the temporary column
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('type_temp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add a temporary varchar column to hold old enum values
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->string('type_temp', 20)->nullable()->after('type');
        });

        // Convert new enum values back to old ones in temporary column
        DB::statement("UPDATE inventory_movements SET type_temp = 'in' WHERE type = 'stock_in'");
        DB::statement("UPDATE inventory_movements SET type_temp = 'out' WHERE type = 'stock_out'");
        DB::statement("UPDATE inventory_movements SET type_temp = 'adjustment' WHERE type IN ('adjustment_in', 'adjustment_out')");
        DB::statement("UPDATE inventory_movements SET type_temp = 'transfer' WHERE type IN ('transfer_in', 'transfer_out')");
        // Convert InventoryService types to closest equivalent
        DB::statement("UPDATE inventory_movements SET type_temp = 'in' WHERE type = 'increase'");
        DB::statement("UPDATE inventory_movements SET type_temp = 'out' WHERE type = 'decrease'");

        // Drop the new enum column
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        // Recreate the old enum column
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->enum('type', ['in', 'out', 'adjustment', 'transfer'])->after('warehouse_id');
        });

        // Copy data from temporary column to old enum column
        DB::statement("UPDATE inventory_movements SET type = type_temp");

        // Drop the temporary column
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('type_temp');
        });
    }
};
