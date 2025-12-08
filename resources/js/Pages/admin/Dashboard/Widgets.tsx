import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { 
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    MoreVertical,
    Grid3X3,
    BarChart3,
    LineChart,
    PieChart,
    Activity,
    Settings,
    Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import CustomPagination from '@/Components/CustomPagination';

interface Widget {
    id: number;
    widget_code: string;
    title: string;
    description: string;
    type: string;
    data_source: string;
    dashboard_type: string;
    size: string;
    grid_width: number;
    grid_height: number;
    cache_duration_minutes: number;
    status: string;
    last_updated_at?: string;
    view_count: number;
    created_by: {
        name: string;
    };
    created_at: string;
}

interface Props {
    widgets: {
        data: Widget[];
        links: any[];
        meta: any;
    };
}

const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function Widgets({ widgets }: Props) {
    const [refreshing, setRefreshing] = useState<number | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

    const getTypeIcon = (type: string) => {
        const icons = {
            'kpi_card': Activity,
            'line_chart': LineChart,
            'bar_chart': BarChart3,
            'pie_chart': PieChart,
            'gauge_chart': Activity,
            'heatmap': Grid3X3,
            'data_table': Grid3X3,
            'alert_list': Activity,
        };
        return icons[type as keyof typeof icons] || Grid3X3;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'maintenance': 'bg-yellow-100 text-yellow-800',
            'error': 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getDashboardTypeColor = (type: string) => {
        const colors = {
            'executive': 'bg-purple-100 text-purple-800',
            'operational': 'bg-blue-100 text-blue-800',
            'financial': 'bg-green-100 text-green-800',
            'warehouse': 'bg-orange-100 text-orange-800',
            'custom': 'bg-gray-100 text-gray-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getSizeBadge = (size: string) => {
        const sizeMap = {
            'small': { label: 'S', class: 'bg-blue-100 text-blue-800' },
            'medium': { label: 'M', class: 'bg-green-100 text-green-800' },
            'large': { label: 'L', class: 'bg-orange-100 text-orange-800' },
            'extra_large': { label: 'XL', class: 'bg-red-100 text-red-800' },
        };
        const sizeInfo = sizeMap[size as keyof typeof sizeMap] || sizeMap.medium;
        return (
            <Badge className={sizeInfo.class}>
                {sizeInfo.label}
            </Badge>
        );
    };

    const formatType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const handleRefresh = async (widgetId: number) => {
        setRefreshing(widgetId);
        try {
            await router.post(`/admin/dashboard/widgets/${widgetId}/refresh`);
        } catch (error) {
            console.error('Failed to refresh widget:', error);
        } finally {
            setRefreshing(null);
        }
    };

    const handleDelete = (widgetId: number) => {
        router.delete(`/admin/dashboard/widgets/${widgetId}`);
        setDeleteDialog(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Widgets</h2>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => router.visit('/admin/dashboard')}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Dashboard
                        </Button>
                        <Button onClick={() => router.visit('/admin/dashboard/widgets/create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Widget
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard Widgets" />

            <motion.div
                className="space-y-6"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Widgets Grid */}
                <motion.div variants={animationVariants}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {widgets.data.map((widget, index) => {
                            const TypeIcon = getTypeIcon(widget.type);
                            
                            return (
                                <motion.div
                                    key={widget.id}
                                    variants={animationVariants}
                                    whileHover={{ y: -2 }}
                                    className="group"
                                >
                                    <Card className="h-full border-2 border-transparent hover:border-blue-200 transition-all duration-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <TypeIcon className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {widget.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">{widget.widget_code}</p>
                                                    </div>
                                                </div>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            onClick={() => router.visit(`/admin/dashboard/widgets/${widget.id}/edit`)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleRefresh(widget.id)}
                                                            disabled={refreshing === widget.id}
                                                        >
                                                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing === widget.id ? 'animate-spin' : ''}`} />
                                                            Refresh Data
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setDeleteDialog(widget.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="space-y-4">
                                            {widget.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {widget.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className={getStatusColor(widget.status)}>
                                                    {widget.status}
                                                </Badge>
                                                <Badge className={getDashboardTypeColor(widget.dashboard_type)}>
                                                    {formatType(widget.dashboard_type)}
                                                </Badge>
                                                {getSizeBadge(widget.size)}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Type:</span>
                                                    <p className="font-medium">{formatType(widget.type)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Data Source:</span>
                                                    <p className="font-medium">{formatType(widget.data_source)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Grid Size:</span>
                                                    <p className="font-medium">{widget.grid_width} × {widget.grid_height}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Cache:</span>
                                                    <p className="font-medium">{widget.cache_duration_minutes}m</p>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Views: {widget.view_count}</span>
                                                    <span>By {widget.created_by.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                    <span>Created: {new Date(widget.created_at).toLocaleDateString()}</span>
                                                    {widget.last_updated_at && (
                                                        <span>Updated: {new Date(widget.last_updated_at).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {widgets.data.length === 0 && (
                        <motion.div variants={animationVariants}>
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Grid3X3 className="w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets found</h3>
                                    <p className="text-gray-600 text-center mb-6">
                                        Create your first dashboard widget to get started with data visualization.
                                    </p>
                                    <Button onClick={() => router.visit('/admin/dashboard/widgets/create')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Widget
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>

                {/* Pagination */}
                {widgets.data.length > 0 && (
                    <motion.div 
                        variants={animationVariants}
                        className="mt-6 text-center text-muted-foreground"
                    >
                        Showing {widgets.data.length} widgets
                    </motion.div>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Widget</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this widget? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => deleteDialog && handleDelete(deleteDialog)}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </AuthenticatedLayout>
    );
}