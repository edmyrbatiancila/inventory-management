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
        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->id();
            
            // Widget Identification
            $table->string('widget_code')->unique(); // WID-2025-001
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'kpi_card',
                'line_chart',
                'bar_chart',
                'pie_chart',
                'area_chart',
                'gauge_chart',
                'heatmap',
                'data_table',
                'alert_list',
                'quick_actions',
                'custom_widget'
            ]);
            
            // Widget Configuration
            $table->enum('data_source', [
                'inventory_levels',
                'stock_movements',
                'purchase_orders',
                'sales_orders',
                'warehouse_metrics',
                'financial_metrics',
                'user_activity',
                'custom_query'
            ]);
            $table->json('query_config')->nullable(); // SQL query or API endpoint config
            $table->json('filters')->nullable(); // Default filters
            $table->json('chart_config')->nullable(); // Chart.js or other chart configuration
            
            // Data & Caching
            $table->json('cached_data')->nullable(); // Cached widget data
            $table->timestamp('data_cached_at')->nullable();
            $table->integer('cache_duration_minutes')->default(15); // How long to cache data
            $table->json('real_time_config')->nullable(); // Real-time update configuration
            
            // Layout & Display
            $table->enum('size', ['small', 'medium', 'large', 'extra_large'])->default('medium');
            $table->integer('grid_position_x')->default(0);
            $table->integer('grid_position_y')->default(0);
            $table->integer('grid_width')->default(4);
            $table->integer('grid_height')->default(3);
            $table->json('styling_config')->nullable(); // Colors, fonts, etc.
            
            // Dashboard Assignment
            $table->enum('dashboard_type', ['executive', 'operational', 'financial', 'warehouse', 'custom'])
                ->default('operational');
            $table->integer('display_order')->default(0);
            
            // Permissions & Visibility
            $table->enum('visibility', ['private', 'shared', 'public'])->default('shared');
            $table->json('visible_to_roles')->nullable(); // Roles that can see this widget
            $table->json('visible_to_users')->nullable(); // Specific users
            
            // Interactivity
            $table->boolean('is_interactive')->default(false);
            $table->boolean('allows_drill_down')->default(false);
            $table->json('drill_down_config')->nullable();
            $table->boolean('allows_export')->default(true);
            
            // Status & Performance
            $table->enum('status', ['active', 'inactive', 'maintenance', 'error'])->default('active');
            $table->integer('load_time_ms')->nullable(); // Last load time
            $table->timestamp('last_updated_at')->nullable();
            $table->text('error_message')->nullable();
            
            // Alert Configuration
            $table->boolean('has_alerts')->default(false);
            $table->json('alert_thresholds')->nullable(); // When to trigger alerts
            $table->json('alert_recipients')->nullable();
            
            // Usage Analytics
            $table->integer('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->integer('interaction_count')->default(0);
            
            // User Relationships
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['dashboard_type', 'status']);
            $table->index(['type', 'data_source']);
            $table->index(['display_order', 'status']);
            $table->index('last_updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_widgets');
    }
};
