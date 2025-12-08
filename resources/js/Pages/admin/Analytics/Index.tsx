import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, MoreHorizontal, FileText, TrendingUp, Calendar, Clock, Eye, Download, Play } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsReport {
    id: number;
    report_code: string;
    title: string;
    description: string;
    type: string;
    frequency: string;
    status: string;
    generated_at: string;
    view_count: number;
    total_value?: number;
    total_items?: number;
    created_by: {
        name: string;
    };
    created_at: string;
}

interface Props {
    reports: {
        data: AnalyticsReport[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        type?: string;
        status?: string;
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

export default function Index({ reports, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(route('admin.analytics.index'), {
            search: search || undefined,
            type: type || undefined,
            status: status || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800',
            'scheduled': 'bg-blue-100 text-blue-800',
            'generating': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'archived': 'bg-purple-100 text-purple-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            'inventory_summary': TrendingUp,
            'stock_movement': FileText,
            'purchase_analytics': Calendar,
            'sales_analytics': TrendingUp,
            'warehouse_performance': FileText,
            'financial_summary': TrendingUp,
            'operational_kpis': FileText,
        };
        return icons[type as keyof typeof icons] || FileText;
    };

    const formatType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Reports</h2>
                    <Button onClick={() => router.visit(route('admin.analytics.create'))}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Report
                    </Button>
                </div>
            }
        >
            <Head title="Analytics Reports" />

            <motion.div
                className="space-y-6"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Filters */}
                <motion.div variants={animationVariants}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Filter className="w-5 h-5" />
                                        Filters
                                    </CardTitle>
                                    <CardDescription>
                                        Filter and search through your analytics reports
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search reports..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Report Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="inventory_summary">Inventory Summary</SelectItem>
                                        <SelectItem value="stock_movement">Stock Movement</SelectItem>
                                        <SelectItem value="purchase_analytics">Purchase Analytics</SelectItem>
                                        <SelectItem value="sales_analytics">Sales Analytics</SelectItem>
                                        <SelectItem value="warehouse_performance">Warehouse Performance</SelectItem>
                                        <SelectItem value="financial_summary">Financial Summary</SelectItem>
                                        <SelectItem value="operational_kpis">Operational KPIs</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="generating">Generating</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button onClick={handleFilter} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Reports Grid */}
                <motion.div variants={animationVariants}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reports.data.map((report, index) => {
                            const TypeIcon = getTypeIcon(report.type);
                            
                            return (
                                <motion.div
                                    key={report.id}
                                    variants={animationVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group"
                                >
                                    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="w-5 h-5 text-blue-600" />
                                                    <Badge className={getStatusColor(report.status)}>
                                                        {report.status}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            onClick={() => router.visit(route('admin.analytics.show', report.id))}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        {report.status === 'completed' && (
                                                            <>
                                                                <DropdownMenuItem 
                                                                    onClick={() => router.post(route('admin.analytics.generate', report.id))}
                                                                >
                                                                    <Play className="w-4 h-4 mr-2" />
                                                                    Generate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Export
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                                    {report.title}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {report.description || `${formatType(report.type)} report`}
                                                </CardDescription>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {report.frequency}
                                                    </span>
                                                    <span>{report.report_code}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                {report.total_value && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Total Value:</span>
                                                        <span className="font-semibold">
                                                            ₱{Number(report.total_value).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {report.total_items && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Total Items:</span>
                                                        <span className="font-semibold">
                                                            {Number(report.total_items).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Views:</span>
                                                    <span className="font-semibold">{report.view_count}</span>
                                                </div>

                                                <div className="pt-2 border-t">
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>By {report.created_by.name}</span>
                                                        <span>{format(new Date(report.created_at), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                    {report.generated_at && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Generated: {format(new Date(report.generated_at), 'MMM dd, yyyy HH:mm')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {reports.data.length === 0 && (
                        <motion.div variants={animationVariants}>
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
                                    <p className="text-gray-600 text-center mb-6">
                                        {Object.keys(filters).length > 0 
                                            ? "No reports match your current filters. Try adjusting your search criteria."
                                            : "Get started by creating your first analytics report."
                                        }
                                    </p>
                                    <Button onClick={() => router.visit(route('admin.analytics.create'))}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First Report
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}