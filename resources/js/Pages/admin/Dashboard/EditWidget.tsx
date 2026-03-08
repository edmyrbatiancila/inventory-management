import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft, Edit3 } from 'lucide-react';

interface Widget {
    id: number;
    widget_code: string;
    title: string;
    description?: string;
    type: string;
    data_source: string;
    dashboard_type: string;
    size: string;
    grid_position_x?: number;
    grid_position_y?: number;
    grid_width?: number;
    grid_height?: number;
    configuration?: Record<string, any>;
    filters?: Record<string, any>;
    refresh_interval?: number;
    status: string;
    alert_thresholds?: Record<string, any>;
    cached_data?: any;
    data_cached_at?: string;
}

interface Props {
    widget: Widget;
}

const EditWidget = ({ widget }: Props) => {
    const { data, setData, put, processing, errors } = useForm<{
        title: string;
        description: string;
        type: string;
        data_source: string;
        dashboard_type: string;
        size: string;
        configuration: Record<string, any>;
        filters: Record<string, any>;
        refresh_interval: number;
        status: string;
        alert_thresholds: Record<string, any>;
    }>({
        title: widget.title || '',
        description: widget.description || '',
        type: widget.type || '',
        data_source: widget.data_source || '',
        dashboard_type: widget.dashboard_type || '',
        size: widget.size || '',
        configuration: widget.configuration || {},
        filters: widget.filters || {},
        refresh_interval: widget.refresh_interval || 300,
        status: widget.status || 'active',
        alert_thresholds: widget.alert_thresholds || {}
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.dashboard.widgets.update', widget.id));
    };

    const widgetTypes = [
        { value: 'kpi_card', label: 'KPI Card' },
        { value: 'line_chart', label: 'Line Chart' },
        { value: 'bar_chart', label: 'Bar Chart' },
        { value: 'pie_chart', label: 'Pie Chart' },
        { value: 'area_chart', label: 'Area Chart' },
        { value: 'gauge_chart', label: 'Gauge Chart' },
        { value: 'heatmap', label: 'Heatmap' },
        { value: 'data_table', label: 'Data Table' },
        { value: 'alert_list', label: 'Alert List' },
        { value: 'quick_actions', label: 'Quick Actions' },
        { value: 'custom_widget', label: 'Custom Widget' }
    ];

    const dataSources = [
        { value: 'inventory_levels', label: 'Inventory Levels' },
        { value: 'stock_movements', label: 'Stock Movements' },
        { value: 'purchase_orders', label: 'Purchase Orders' },
        { value: 'sales_orders', label: 'Sales Orders' },
        { value: 'warehouse_metrics', label: 'Warehouse Metrics' },
        { value: 'financial_metrics', label: 'Financial Metrics' },
        { value: 'user_activity', label: 'User Activity' },
        { value: 'custom_query', label: 'Custom Query' }
    ];

    const dashboardTypes = [
        { value: 'executive', label: 'Executive Dashboard' },
        { value: 'operational', label: 'Operational Dashboard' },
        { value: 'financial', label: 'Financial Dashboard' },
        { value: 'warehouse', label: 'Warehouse Dashboard' },
        { value: 'custom', label: 'Custom Dashboard' }
    ];

    const sizes = [
        { value: 'small', label: 'Small (1x1)' },
        { value: 'medium', label: 'Medium (2x2)' },
        { value: 'large', label: 'Large (3x2)' },
        { value: 'extra_large', label: 'Extra Large (4x3)' }
    ];

    const statuses = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Edit Widget: {widget.title}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Widget Code: {widget.widget_code}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Widget - ${widget.title}`} />

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-blue-600" />
                                Widget Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Widget Title</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter widget title"
                                            className={errors.title ? 'border-red-300' : ''}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Widget Type</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) => setData('type', value)}
                                        >
                                            <SelectTrigger className={errors.type ? 'border-red-300' : ''}>
                                                <SelectValue placeholder="Select widget type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {widgetTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="data_source">Data Source</Label>
                                        <Select
                                            value={data.data_source}
                                            onValueChange={(value) => setData('data_source', value)}
                                        >
                                            <SelectTrigger className={errors.data_source ? 'border-red-300' : ''}>
                                                <SelectValue placeholder="Select data source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dataSources.map((source) => (
                                                    <SelectItem key={source.value} value={source.value}>
                                                        {source.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.data_source && (
                                            <p className="text-sm text-red-600">{errors.data_source}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dashboard_type">Dashboard Type</Label>
                                        <Select
                                            value={data.dashboard_type}
                                            onValueChange={(value) => setData('dashboard_type', value)}
                                        >
                                            <SelectTrigger className={errors.dashboard_type ? 'border-red-300' : ''}>
                                                <SelectValue placeholder="Select dashboard type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dashboardTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.dashboard_type && (
                                            <p className="text-sm text-red-600">{errors.dashboard_type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="size">Widget Size</Label>
                                        <Select
                                            value={data.size}
                                            onValueChange={(value) => setData('size', value)}
                                        >
                                            <SelectTrigger className={errors.size ? 'border-red-300' : ''}>
                                                <SelectValue placeholder="Select widget size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sizes.map((size) => (
                                                    <SelectItem key={size.value} value={size.value}>
                                                        {size.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.size && (
                                            <p className="text-sm text-red-600">{errors.size}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="refresh_interval">Refresh Interval (seconds)</Label>
                                        <Input
                                            id="refresh_interval"
                                            type="number"
                                            value={data.refresh_interval}
                                            onChange={(e) => setData('refresh_interval', parseInt(e.target.value) || 300)}
                                            placeholder="300"
                                            min="30"
                                            max="3600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter widget description"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Widget'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </AuthenticatedLayout>
    );
};

export default EditWidget;