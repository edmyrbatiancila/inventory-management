<?php

namespace Database\Seeders;

use App\Models\AnalyticsReport;
use App\Models\DashboardWidget;
use App\Models\BusinessInsight;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnalyticsSystemSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('type', 'admin')->first() ?? User::first();
        
        if (!$adminUser || !$adminUser->id) {
            // Create a default admin user for analytics
            $adminUser = User::create([
                'name' => 'Analytics Admin',
                'email' => 'analytics@inventrack.com',
                'type' => 'admin',
                'password' => bcrypt('password'),
            ]);
        }

        $this->command->info("Using user ID: {$adminUser->id}");

        // Create Sample Analytics Reports
        $reports = [
            [
                'title' => 'Daily Inventory Summary',
                'description' => 'Comprehensive daily report of inventory levels across all warehouses',
                'type' => 'inventory_summary',
                'frequency' => 'daily',
                'auto_generate' => true,
                'email_on_completion' => true,
                'visibility' => 'shared',
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Weekly Stock Movement Analysis',
                'description' => 'Analysis of stock movements and trends over the past week',
                'type' => 'stock_movement',
                'frequency' => 'weekly',
                'auto_generate' => true,
                'visibility' => 'shared',
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Monthly Purchase Analytics',
                'description' => 'Purchase order performance and vendor analysis',
                'type' => 'purchase_analytics',
                'frequency' => 'monthly',
                'auto_generate' => true,
                'visibility' => 'shared',
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Warehouse Performance Dashboard',
                'description' => 'Performance metrics for warehouse operations',
                'type' => 'warehouse_performance',
                'frequency' => 'daily',
                'auto_generate' => false,
                'visibility' => 'public',
                'created_by' => $adminUser->id
            ]
        ];

        foreach ($reports as $reportData) {
            AnalyticsReport::create($reportData);
        }

        // Create Dashboard Widgets
        $widgets = [
            [
                'title' => 'Total Inventory Value',
                'description' => 'Current total value of all inventory',
                'type' => 'kpi_card',
                'data_source' => 'inventory_levels',
                'dashboard_type' => 'executive',
                'size' => 'medium',
                'grid_width' => 3,
                'grid_height' => 2,
                'cache_duration_minutes' => 30,
                'is_interactive' => false,
                'allows_export' => true,
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Stock Movement Trends',
                'description' => '30-day stock movement trend analysis',
                'type' => 'line_chart',
                'data_source' => 'stock_movements',
                'dashboard_type' => 'operational',
                'size' => 'large',
                'grid_width' => 6,
                'grid_height' => 4,
                'cache_duration_minutes' => 15,
                'is_interactive' => true,
                'allows_export' => true,
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Low Stock Alerts',
                'description' => 'Products below reorder point',
                'type' => 'alert_list',
                'data_source' => 'inventory_levels',
                'dashboard_type' => 'operational',
                'size' => 'medium',
                'grid_width' => 4,
                'grid_height' => 3,
                'cache_duration_minutes' => 5,
                'has_alerts' => true,
                'alert_thresholds' => ['low_stock' => 10],
                'is_interactive' => true,
                'allows_export' => true,
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Purchase Orders Status',
                'description' => 'Current status of purchase orders',
                'type' => 'pie_chart',
                'data_source' => 'purchase_orders',
                'dashboard_type' => 'financial',
                'size' => 'medium',
                'grid_width' => 4,
                'grid_height' => 3,
                'cache_duration_minutes' => 60,
                'is_interactive' => true,
                'allows_export' => true,
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Warehouse Utilization',
                'description' => 'Storage capacity utilization by warehouse',
                'type' => 'bar_chart',
                'data_source' => 'warehouse_metrics',
                'dashboard_type' => 'warehouse',
                'size' => 'large',
                'grid_width' => 6,
                'grid_height' => 4,
                'cache_duration_minutes' => 120,
                'is_interactive' => true,
                'allows_export' => true,
                'created_by' => $adminUser->id
            ]
        ];

        foreach ($widgets as $widgetData) {
            DashboardWidget::create($widgetData);
        }

        // Create Sample Business Insights
        $insights = [
            [
                'title' => 'Critical Low Stock Alert: Electronics Category',
                'description' => 'Multiple electronic products are critically low in stock across main warehouses. Immediate reordering recommended.',
                'type' => 'performance_alert',
                'severity' => 'critical',
                'category' => 'stock_levels',
                'current_value' => 5,
                'threshold_value' => 20,
                'percentage_change' => -75.0,
                'trend_direction' => 'down',
                'recommendations' => [
                    'Immediately place purchase orders for affected products',
                    'Review reorder points for electronics category',
                    'Consider increasing safety stock levels'
                ],
                'urgency' => 'immediate',
                'suggested_completion_date' => now()->addDays(1),
                'priority' => 'critical',
                'assigned_to' => $adminUser->id,
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Unusual Stock Movement Pattern Detected',
                'description' => 'Stock movements today are 200% higher than the 30-day average, indicating possible bulk order fulfillment or inventory adjustment.',
                'type' => 'anomaly_detection',
                'severity' => 'medium',
                'category' => 'warehouse_operations',
                'current_value' => 150,
                'threshold_value' => 50,
                'percentage_change' => 200.0,
                'trend_direction' => 'up',
                'recommendations' => [
                    'Verify if bulk orders were processed today',
                    'Check for any large inventory adjustments',
                    'Monitor movement patterns for next few days'
                ],
                'urgency' => 'medium',
                'suggested_completion_date' => now()->addDays(2),
                'priority' => 'normal',
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Optimization Opportunity: Warehouse Space',
                'description' => 'Warehouse B is operating at 95% capacity while Warehouse C is at 60%. Consider redistributing inventory.',
                'type' => 'optimization_suggestion',
                'severity' => 'medium',
                'category' => 'warehouse_operations',
                'current_value' => 95,
                'threshold_value' => 85,
                'potential_impact' => 5000.00,
                'recommendations' => [
                    'Transfer slow-moving items from Warehouse B to C',
                    'Analyze product placement strategy',
                    'Consider expanding Warehouse B capacity'
                ],
                'urgency' => 'medium',
                'suggested_completion_date' => now()->addWeeks(1),
                'priority' => 'normal',
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Purchase Order Approval Bottleneck',
                'description' => '15 purchase orders pending approval for over 48 hours, potentially impacting stock replenishment.',
                'type' => 'performance_alert',
                'severity' => 'high',
                'category' => 'purchase_orders',
                'current_value' => 15,
                'threshold_value' => 5,
                'recommendations' => [
                    'Review and approve pending purchase orders',
                    'Implement automated approval for low-value orders',
                    'Add additional approval authority'
                ],
                'urgency' => 'high',
                'suggested_completion_date' => now()->addHours(12),
                'priority' => 'high',
                'created_by' => $adminUser->id
            ],
            [
                'title' => 'Seasonal Trend Analysis: Winter Products',
                'description' => 'Winter product sales increased 45% this week compared to last year, recommend increasing inventory.',
                'type' => 'trend_analysis',
                'severity' => 'low',
                'category' => 'sales_performance',
                'current_value' => 145,
                'threshold_value' => 100,
                'percentage_change' => 45.0,
                'trend_direction' => 'up',
                'potential_impact' => 12000.00,
                'recommendations' => [
                    'Increase winter product inventory by 30%',
                    'Negotiate volume discounts with suppliers',
                    'Prepare marketing campaigns for winter products'
                ],
                'urgency' => 'medium',
                'suggested_completion_date' => now()->addWeeks(2),
                'priority' => 'normal',
                'created_by' => $adminUser->id
            ]
        ];

        foreach ($insights as $insightData) {
            BusinessInsight::create($insightData);
        }

        $this->command->info('Analytics system seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($reports) . ' Analytics Reports');
        $this->command->info('- ' . count($widgets) . ' Dashboard Widgets');
        $this->command->info('- ' . count($insights) . ' Business Insights');
    }
}
