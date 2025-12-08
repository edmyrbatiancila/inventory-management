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
        Schema::create('business_insights', function (Blueprint $table) {
            $table->id();
            
            // Insight Identification
            $table->string('insight_code')->unique(); // INS-2025-001
            $table->string('title');
            $table->text('description');
            $table->enum('type', [
                'anomaly_detection',
                'trend_analysis',
                'performance_alert',
                'optimization_suggestion',
                'risk_warning',
                'opportunity_identification',
                'threshold_breach',
                'predictive_insight',
                'seasonal_pattern',
                'correlation_discovery'
            ]);
            
            // Insight Content
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('category', [
                'inventory_management',
                'stock_levels',
                'warehouse_operations',
                'purchase_orders',
                'sales_performance',
                'financial_metrics',
                'operational_efficiency',
                'customer_behavior',
                'supplier_performance',
                'general_business'
            ]);
            
            // Data & Context
            $table->json('data_points')->nullable(); // Supporting data
            $table->json('metrics')->nullable(); // Key metrics involved
            $table->decimal('current_value', 15, 2)->nullable();
            $table->decimal('threshold_value', 15, 2)->nullable();
            $table->decimal('percentage_change', 8, 2)->nullable();
            $table->string('trend_direction')->nullable(); // up, down, stable
            
            // Recommendations & Actions
            $table->json('recommendations')->nullable(); // Suggested actions
            $table->json('action_items')->nullable(); // Specific tasks
            $table->decimal('potential_impact', 15, 2)->nullable(); // Financial impact
            $table->enum('urgency', ['low', 'medium', 'high', 'immediate'])->default('medium');
            $table->date('suggested_completion_date')->nullable();
            
            // Source & Detection
            $table->string('source_table')->nullable(); // Which table triggered this
            $table->string('source_record_id')->nullable(); // Specific record
            $table->string('detection_method')->nullable(); // How it was detected
            $table->timestamp('detected_at');
            
            // Status & Follow-up
            $table->enum('status', ['new', 'acknowledged', 'in_progress', 'resolved', 'dismissed', 'archived'])
                ->default('new');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            
            // Notification & Communication
            $table->boolean('is_notified')->default(false);
            $table->json('notified_users')->nullable();
            $table->timestamp('notification_sent_at')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'critical'])->default('normal');
            
            // Auto-actions & Automation
            $table->boolean('auto_actionable')->default(false);
            $table->json('auto_action_config')->nullable();
            $table->boolean('auto_action_executed')->default(false);
            $table->timestamp('auto_action_executed_at')->nullable();
            
            // Recurrence & Patterns
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern')->nullable();
            $table->timestamp('next_check_at')->nullable();
            $table->integer('occurrence_count')->default(1);
            
            // Analytics & Learning
            $table->decimal('confidence_score', 5, 2)->nullable(); // 0-100
            $table->boolean('user_feedback_positive')->nullable();
            $table->text('user_feedback_notes')->nullable();
            $table->json('related_insights')->nullable(); // IDs of related insights
            
            // User Relationships
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['type', 'status']);
            $table->index(['category', 'severity']);
            $table->index(['status', 'urgency']);
            $table->index(['detected_at', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->fullText(['title', 'description', 'resolution_notes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_insights');
    }
};
