<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DashboardWidget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'widget_code', 'title', 'description', 'type', 'data_source',
        'query_config', 'filters', 'chart_config', 'cached_data',
        'cache_duration_minutes', 'real_time_config', 'size',
        'grid_position_x', 'grid_position_y', 'grid_width', 'grid_height',
        'styling_config', 'dashboard_type', 'display_order', 'visibility',
        'visible_to_roles', 'visible_to_users', 'is_interactive',
        'allows_drill_down', 'drill_down_config', 'allows_export',
        'status', 'has_alerts', 'alert_thresholds', 'alert_recipients',
        'created_by', 'updated_by'
    ];

    protected $casts = [
        'query_config' => 'array',
        'filters' => 'array',
        'chart_config' => 'array',
        'cached_data' => 'array',
        'real_time_config' => 'array',
        'styling_config' => 'array',
        'visible_to_roles' => 'array',
        'visible_to_users' => 'array',
        'drill_down_config' => 'array',
        'alert_thresholds' => 'array',
        'alert_recipients' => 'array',
        'data_cached_at' => 'datetime',
        'last_updated_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'is_interactive' => 'boolean',
        'allows_drill_down' => 'boolean',
        'allows_export' => 'boolean',
        'has_alerts' => 'boolean',
    ];

    // Widget Types
    public const TYPE_KPI_CARD = 'kpi_card';
    public const TYPE_LINE_CHART = 'line_chart';
    public const TYPE_BAR_CHART = 'bar_chart';
    public const TYPE_PIE_CHART = 'pie_chart';
    public const TYPE_AREA_CHART = 'area_chart';
    public const TYPE_GAUGE_CHART = 'gauge_chart';

    // Dashboard Types
    public const DASHBOARD_EXECUTIVE = 'executive';
    public const DASHBOARD_OPERATIONAL = 'operational';
    public const DASHBOARD_FINANCIAL = 'financial';
    public const DASHBOARD_WAREHOUSE = 'warehouse';

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
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByDashboard($query, string $dashboardType)
    {
        return $query->where('dashboard_type', $dashboardType);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    // Helper Methods
    public function isDataStale(): bool
    {
        if (!$this->data_cached_at) return true;
        
        $expiresAt = $this->data_cached_at->addMinutes($this->cache_duration_minutes);
        return now()->greaterThan($expiresAt);
    }

    public function canBeViewedByUser(int $userId): bool
    {
        if ($this->visibility === 'public') return true;
        if ($this->created_by === $userId) return true;
        
        return in_array($userId, $this->visible_to_users ?? []);
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($widget) {
            if (!$widget->widget_code) {
                $widget->widget_code = self::generateWidgetCode();
            }
            // Only set created_by if not already set (for seeders)
            if (!$widget->created_by) {
                $widget->created_by = auth()->id() ?? 1; // Fallback to user 1 for seeding
            }
        });

        static::updating(function ($widget) {
            $widget->updated_by = auth()->id();
        });
    }

    private static function generateWidgetCode(): string
    {
        $year = date('Y');
        $lastWidget = self::whereYear('created_at', $year)->orderBy('id', 'desc')->first();
        $sequence = $lastWidget ? (int) substr($lastWidget->widget_code, -3) + 1 : 1;
        
        return 'WID-' . $year . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}
