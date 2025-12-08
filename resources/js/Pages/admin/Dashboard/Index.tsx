import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Grid, BarChart3, LineChart, PieChart, Gauge, 
    Plus, Settings, RefreshCw, Layout, 
    TrendingUp, Users, Package, DollarSign,
    Maximize2, Minimize2, Eye, Edit, Trash2
} from 'lucide-react';

interface Widget {
    id: number;
    widget_code: string;
    title: string;
    description: string;
    type: string;
    data_source: string;
    dashboard_type: string;
    size: string;
    grid_position_x: number;
    grid_position_y: number;
    grid_width: number;
    grid_height: number;
    cached_data: any;
    data_cached_at: string;
    status: string;
    created_by: {
        name: string;
    };
}

interface Props {
    widgets: Widget[];
    dashboardType: string;
    dashboardTypes: Array<{
        value: string;
        label: string;
    }>;
}

const animationVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};

const containerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Index({ widgets, dashboardType, dashboardTypes }: Props) {
    const [selectedDashboard, setSelectedDashboard] = useState(dashboardType);
    const [refreshing, setRefreshing] = useState<number | null>(null);

    const handleDashboardChange = (newType: string) => {
        setSelectedDashboard(newType);
        router.get(route('admin.dashboard.index'), { dashboard: newType }, {
            preserveState: true,
            replace: true
        });
    };

    const handleRefreshWidget = async (widgetId: number) => {
        setRefreshing(widgetId);
        try {
            await router.post(route('admin.dashboard.widgets.refresh', widgetId));
        } catch (error) {
            console.error('Failed to refresh widget:', error);
        } finally {
            setRefreshing(null);
        }
    };

    const getWidgetIcon = (type: string) => {
        const icons = {
            'kpi_card': TrendingUp,
            'line_chart': LineChart,
            'bar_chart': BarChart3,
            'pie_chart': PieChart,
            'gauge_chart': Gauge,
            'data_table': Grid,
        };
        return icons[type as keyof typeof icons] || Grid;
    };

    const getDataSourceIcon = (dataSource: string) => {
        const icons = {
            'inventory_levels': Package,
            'stock_movements': TrendingUp,
            'purchase_orders': DollarSign,
            'sales_orders': DollarSign,
            'financial_metrics': DollarSign,
            'user_activity': Users,
        };
        return icons[dataSource as keyof typeof icons] || Package;
    };

    const getSizeClass = (size: string) => {
        const sizes = {
            'small': 'col-span-1 row-span-1',
            'medium': 'col-span-2 row-span-2',
            'large': 'col-span-3 row-span-2',
            'extra_large': 'col-span-4 row-span-3',
        };
        return sizes[size as keyof typeof sizes] || 'col-span-2 row-span-2';
    };

    const renderWidgetData = (widget: Widget) => {
        const data = widget.cached_data;
        
        if (!data) {
            return (
                <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No data available</p>
                    </div>
                </div>
            );
        }

        switch (widget.type) {
            case 'kpi_card':
                return (
                    <div className="space-y-4">
                        {Object.entries(data).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 capitalize">
                                    {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="font-semibold text-lg">
                                    {typeof value === 'number' 
                                        ? (key.includes('value') || key.includes('amount') 
                                            ? `₱${value.toLocaleString()}` 
                                            : value.toLocaleString())
                                        : value
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                );

            case 'line_chart':
            case 'bar_chart':
            case 'pie_chart':
                return (
                    <div className="space-y-3">
                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                            <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600">Chart visualization</p>
                            <p className="text-xs text-gray-500">
                                {Object.keys(data).length} data points
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(data).slice(0, 4).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{key}</div>
                                    <div className="text-gray-600">{String(value)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'alert_list':
                return (
                    <div className="space-y-2">
                        {Object.entries(data).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                <span className="text-sm text-orange-800 capitalize">
                                    {key.replace(/_/g, ' ')}
                                </span>
                                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                    {String(value)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <div className="grid grid-cols-1 gap-2">
                        {Object.entries(data).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 capitalize">
                                    {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="font-medium">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Layout className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                        <Select value={selectedDashboard} onValueChange={handleDashboardChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {dashboardTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('admin.dashboard.widgets'))}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Widgets
                        </Button>
                        <Button onClick={() => router.visit(route('admin.dashboard.widgets.create'))}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Widget
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Analytics Dashboard" />

            <motion.div
                className="space-y-6"
                initial="initial"
                animate="animate"
                variants={containerVariants}
            >
                {widgets.length > 0 ? (
                    <motion.div variants={animationVariants}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                            <AnimatePresence>
                                {widgets.map((widget, index) => {
                                    const WidgetIcon = getWidgetIcon(widget.type);
                                    const DataIcon = getDataSourceIcon(widget.data_source);
                                    
                                    return (
                                        <motion.div
                                            key={widget.id}
                                            variants={animationVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            transition={{ delay: index * 0.1 }}
                                            className={getSizeClass(widget.size)}
                                        >
                                            <Card className="h-full hover:shadow-lg transition-all duration-200 group">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <WidgetIcon className="w-4 h-4 text-blue-600" />
                                                            <DataIcon className="w-4 h-4 text-gray-500" />
                                                            <Badge 
                                                                variant={widget.status === 'active' ? 'default' : 'secondary'}
                                                                className="text-xs"
                                                            >
                                                                {widget.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleRefreshWidget(widget.id)}
                                                                disabled={refreshing === widget.id}
                                                            >
                                                                <RefreshCw className={`w-3 h-3 ${refreshing === widget.id ? 'animate-spin' : ''}`} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-semibold line-clamp-2">
                                                            {widget.title}
                                                        </CardTitle>
                                                        {widget.description && (
                                                            <CardDescription className="text-xs line-clamp-2 mt-1">
                                                                {widget.description}
                                                            </CardDescription>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0 flex-1">
                                                    {renderWidgetData(widget)}
                                                    
                                                    {widget.data_cached_at && (
                                                        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                                                            Last updated: {new Date(widget.data_cached_at).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div variants={animationVariants}>
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Layout className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Widgets Configured
                                </h3>
                                <p className="text-gray-600 text-center mb-6 max-w-md">
                                    This dashboard doesn't have any widgets yet. Create your first widget to start visualizing your data.
                                </p>
                                <div className="flex gap-3">
                                    <Button onClick={() => router.visit(route('admin.dashboard.widgets.create'))}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Widget
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.dashboard.widgets'))}
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage Widgets
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Stats Summary */}
                {widgets.length > 0 && (
                    <motion.div variants={animationVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Dashboard Summary</CardTitle>
                                <CardDescription>
                                    Overview of your {selectedDashboard} dashboard
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {widgets.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Widgets</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {widgets.filter(w => w.status === 'active').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Active</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {widgets.filter(w => w.cached_data).length}
                                        </div>
                                        <div className="text-sm text-gray-600">With Data</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {new Set(widgets.map(w => w.data_source)).size}
                                        </div>
                                        <div className="text-sm text-gray-600">Data Sources</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </AuthenticatedLayout>
    );
}