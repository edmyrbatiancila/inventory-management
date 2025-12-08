<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnalyticsReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'report_code',
        'title',
        'description',
        'type',
        'frequency',
        'filters',
        'metrics',
        'visualization_config',
        'data',
        'summary_stats',
        'total_value',
        'total_items',
        'status',
        'scheduled_at',
        'generated_at',
        'expires_at',
        'generation_time_seconds',
        'file_path',
        'file_type',
        'file_size',
        'download_token',
        'visibility',
        'shared_with_users',
        'shared_with_roles',
        'auto_generate',
        'email_on_completion',
        'email_recipients',
        'alert_conditions',
        'tags',
        'view_count',
        'last_viewed_at',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'filters' => 'array',
        'metrics' => 'array',
        'visualization_config' => 'array',
        'data' => 'array',
        'summary_stats' => 'array',
        'shared_with_users' => 'array',
        'shared_with_roles' => 'array',
        'email_recipients' => 'array',
        'alert_conditions' => 'array',
        'tags' => 'array',
        'scheduled_at' => 'datetime',
        'generated_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'auto_generate' => 'boolean',
        'email_on_completion' => 'boolean',
        'total_value' => 'decimal:2',
    ];

    // Report Types
    public const TYPE_INVENTORY_SUMMARY = 'inventory_summary';
    public const TYPE_STOCK_MOVEMENT = 'stock_movement';
    public const TYPE_PURCHASE_ANALYTICS = 'purchase_analytics';
    public const TYPE_SALES_ANALYTICS = 'sales_analytics';
    public const TYPE_WAREHOUSE_PERFORMANCE = 'warehouse_performance';
    public const TYPE_FINANCIAL_SUMMARY = 'financial_summary';
    public const TYPE_OPERATIONAL_KPIS = 'operational_kpis';
    public const TYPE_CUSTOM_REPORT = 'custom_report';

    // Report Status
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_GENERATING = 'generating';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_ARCHIVED = 'archived';

    // Report Frequency
    public const FREQUENCY_REAL_TIME = 'real_time';
    public const FREQUENCY_DAILY = 'daily';
    public const FREQUENCY_WEEKLY = 'weekly';
    public const FREQUENCY_MONTHLY = 'monthly';
    public const FREQUENCY_QUARTERLY = 'quarterly';
    public const FREQUENCY_YEARLY = 'yearly';
    public const FREQUENCY_ON_DEMAND = 'on_demand';

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByFrequency($query, string $frequency)
    {
        return $query->where('frequency', $frequency);
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeShared($query)
    {
        return $query->where('visibility', 'shared');
    }

    // Helper Methods
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function canBeDownloaded(): bool
    {
        return $this->isCompleted() && !$this->isExpired() && $this->file_path;
    }

    public function getFileSizeFormatted(): string
    {
        if (!$this->file_size) return 'N/A';
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unitIndex = 0;
        
        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }
        
        return round($size, 2) . ' ' . $units[$unitIndex];
    }

    public function getGenerationTimeFormatted(): string
    {
        if (!$this->generation_time_seconds) return 'N/A';
        
        if ($this->generation_time_seconds < 60) {
            return $this->generation_time_seconds . 's';
        }
        
        $minutes = floor($this->generation_time_seconds / 60);
        $seconds = $this->generation_time_seconds % 60;
        
        return $minutes . 'm ' . $seconds . 's';
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($report) {
            if (!$report->report_code) {
                $report->report_code = self::generateReportCode();
            }
            // Only set created_by if not already set (for seeders)
            if (!$report->created_by) {
                $report->created_by = auth()->id() ?? 1; // Fallback to user 1 for seeding
            }
        });

        static::updating(function ($report) {
            $report->updated_by = auth()->id();
        });
    }

    private static function generateReportCode(): string
    {
        $year = date('Y');
        $lastReport = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();
        
        $sequence = $lastReport ? (int) substr($lastReport->report_code, -3) + 1 : 1;
        
        return 'REP-' . $year . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}
