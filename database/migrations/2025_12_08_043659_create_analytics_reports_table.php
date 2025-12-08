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
        Schema::create('analytics_reports', function (Blueprint $table) {
            $table->id();
            
            // Report Identification
            $table->string('report_code')->unique(); // REP-2025-001
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'inventory_summary', 
                'stock_movement', 
                'purchase_analytics', 
                'sales_analytics',
                'warehouse_performance',
                'financial_summary',
                'operational_kpis',
                'custom_report'
            ]);
            
            // Report Configuration
            $table->enum('frequency', ['real_time', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand'])
                ->default('on_demand');
            $table->json('filters')->nullable(); // Dynamic filters like date range, warehouse_ids, etc.
            $table->json('metrics')->nullable(); // Specific metrics to include
            $table->json('visualization_config')->nullable(); // Chart types, colors, layout
            
            // Report Data & Results
            $table->json('data')->nullable(); // Generated report data
            $table->json('summary_stats')->nullable(); // Key summary statistics
            $table->decimal('total_value', 15, 2)->nullable(); // Total financial value if applicable
            $table->integer('total_items')->nullable(); // Total item count if applicable
            
            // Report Status & Scheduling
            $table->enum('status', ['draft', 'scheduled', 'generating', 'completed', 'failed', 'archived'])
                ->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('generation_time_seconds')->nullable();
            
            // File Storage & Export
            $table->string('file_path')->nullable(); // Path to exported file (PDF, Excel)
            $table->string('file_type')->nullable(); // pdf, xlsx, csv
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->string('download_token')->nullable(); // Secure download token
            
            // Access & Permissions
            $table->enum('visibility', ['private', 'shared', 'public'])->default('private');
            $table->json('shared_with_users')->nullable(); // User IDs who can access
            $table->json('shared_with_roles')->nullable(); // Roles that can access
            
            // Automation & Alerts
            $table->boolean('auto_generate')->default(false);
            $table->boolean('email_on_completion')->default(false);
            $table->json('email_recipients')->nullable();
            $table->json('alert_conditions')->nullable(); // Conditions to trigger alerts
            
            // Metadata
            $table->json('tags')->nullable(); // For categorization and search
            $table->integer('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->text('notes')->nullable();
            
            // User Relationships
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['type', 'status']);
            $table->index(['created_by', 'status']);
            $table->index(['frequency', 'scheduled_at']);
            $table->index('generated_at');
            $table->fullText(['title', 'description', 'notes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_reports');
    }
};
