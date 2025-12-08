<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BusinessInsight extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'insight_code', 'title', 'description', 'type', 'severity', 'category',
        'data_points', 'metrics', 'current_value', 'threshold_value',
        'percentage_change', 'trend_direction', 'recommendations', 'action_items',
        'potential_impact', 'urgency', 'suggested_completion_date', 'source_table',
        'source_record_id', 'detection_method', 'detected_at', 'status',
        'resolution_notes', 'is_notified', 'notified_users', 'priority',
        'auto_actionable', 'auto_action_config', 'is_recurring',
        'recurrence_pattern', 'confidence_score', 'assigned_to', 'created_by'
    ];

    protected $casts = [
        'data_points' => 'array',
        'metrics' => 'array',
        'recommendations' => 'array',
        'action_items' => 'array',
        'notified_users' => 'array',
        'auto_action_config' => 'array',
        'related_insights' => 'array',
        'current_value' => 'decimal:2',
        'threshold_value' => 'decimal:2',
        'percentage_change' => 'decimal:2',
        'potential_impact' => 'decimal:2',
        'confidence_score' => 'decimal:2',
        'suggested_completion_date' => 'date',
        'detected_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
        'notification_sent_at' => 'datetime',
        'auto_action_executed_at' => 'datetime',
        'next_check_at' => 'datetime',
        'is_notified' => 'boolean',
        'auto_actionable' => 'boolean',
        'auto_action_executed' => 'boolean',
        'is_recurring' => 'boolean',
        'user_feedback_positive' => 'boolean',
    ];

    // Insight Types
    public const TYPE_ANOMALY_DETECTION = 'anomaly_detection';
    public const TYPE_TREND_ANALYSIS = 'trend_analysis';
    public const TYPE_PERFORMANCE_ALERT = 'performance_alert';
    public const TYPE_OPTIMIZATION_SUGGESTION = 'optimization_suggestion';
    public const TYPE_RISK_WARNING = 'risk_warning';

    // Status Constants
    public const STATUS_NEW = 'new';
    public const STATUS_ACKNOWLEDGED = 'acknowledged';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_DISMISSED = 'dismissed';

    // Relationships
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_RESOLVED, self::STATUS_DISMISSED]);
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'critical']);
    }

    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Helper Methods
    public function isActionable(): bool
    {
        return in_array($this->status, [self::STATUS_NEW, self::STATUS_ACKNOWLEDGED]);
    }

    public function getStatusColor(): string
    {
        return match($this->status) {
            self::STATUS_NEW => 'bg-blue-100 text-blue-800',
            self::STATUS_ACKNOWLEDGED => 'bg-yellow-100 text-yellow-800',
            self::STATUS_IN_PROGRESS => 'bg-orange-100 text-orange-800',
            self::STATUS_RESOLVED => 'bg-green-100 text-green-800',
            self::STATUS_DISMISSED => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getSeverityColor(): string
    {
        return match($this->severity) {
            'low' => 'bg-blue-100 text-blue-800',
            'medium' => 'bg-yellow-100 text-yellow-800',
            'high' => 'bg-orange-100 text-orange-800',
            'critical' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($insight) {
            if (!$insight->insight_code) {
                $insight->insight_code = self::generateInsightCode();
            }
            // Only set created_by if not already set (for seeders)
            if (!$insight->created_by) {
                $insight->created_by = auth()->id() ?? 1; // Fallback to user 1 for seeding
            }
            $insight->detected_at = $insight->detected_at ?? now();
        });
    }

    private static function generateInsightCode(): string
    {
        $year = date('Y');
        $lastInsight = self::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
        $sequence = $lastInsight ? (int) substr($lastInsight->insight_code, -3) + 1 : 1;
        
        return 'INS-' . $year . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}
