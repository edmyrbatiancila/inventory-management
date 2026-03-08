<?php

namespace Database\Seeders;

use App\Models\DashboardWidget;
use App\Models\User;
use Illuminate\Database\Seeder;

class DashboardWidgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@gmail.com')->first();

        if (! $adminUser) {
            $this->command->warn('Admin user not found. Creating default widgets without user association.');
        }

        $widgets = [
            [
                'title' => 'Inventory Overview',
                'description' => 'Real-time inventory levels and stock status across all warehouses',
                'type' => 'kpi_card',
                'data_source' => 'inventory_levels',
                'dashboard_type' => 'operational',
                'size' => 'medium',
                'grid_position_x' => 0,
                'grid_position_y' => 0,
                'grid_width' => 3,
                'grid_height' => 2,
                'cache_duration_minutes' => 15,
                'status' => 'active',
                'created_by' => $adminUser?->id ?? 1,
            ],
            [
                'title' => 'Stock Movements Today',
                'description' => 'Daily stock movements and transfer activities',
                'type' => 'line_chart',
                'data_source' => 'stock_movements',
                'dashboard_type' => 'operational',
                'size' => 'large',
                'grid_position_x' => 3,
                'grid_position_y' => 0,
                'grid_width' => 4,
                'grid_height' => 2,
                'cache_duration_minutes' => 5,
                'status' => 'active',
                'created_by' => $adminUser?->id ?? 1,
            ],
            [
                'title' => 'Purchase Orders Status',
                'description' => 'Overview of pending and completed purchase orders',
                'type' => 'pie_chart',
                'data_source' => 'purchase_orders',
                'dashboard_type' => 'executive',
                'size' => 'medium',
                'grid_position_x' => 0,
                'grid_position_y' => 2,
                'grid_width' => 3,
                'grid_height' => 2,
                'cache_duration_minutes' => 30,
                'status' => 'active',
                'created_by' => $adminUser?->id ?? 1,
            ],
            [
                'title' => 'Sales Performance',
                'description' => 'Monthly sales orders and revenue tracking',
                'type' => 'bar_chart',
                'data_source' => 'sales_orders',
                'dashboard_type' => 'executive',
                'size' => 'large',
                'grid_position_x' => 3,
                'grid_position_y' => 2,
                'grid_width' => 4,
                'grid_height' => 2,
                'cache_duration_minutes' => 60,
                'status' => 'active',
                'created_by' => $adminUser?->id ?? 1,
            ],
            [
                'title' => 'Financial Metrics',
                'description' => 'Key financial indicators and profitability metrics',
                'type' => 'gauge_chart',
                'data_source' => 'financial_metrics',
                'dashboard_type' => 'financial',
                'size' => 'small',
                'grid_position_x' => 7,
                'grid_position_y' => 0,
                'grid_width' => 2,
                'grid_height' => 4,
                'cache_duration_minutes' => 120,
                'status' => 'active',
                'created_by' => $adminUser?->id ?? 1,
            ],
        ];

        foreach ($widgets as $widgetData) {
            DashboardWidget::create($widgetData);
        }

        $this->command->info('Dashboard widgets seeded successfully!');
    }
}
