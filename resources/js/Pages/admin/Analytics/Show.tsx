import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { 
    ArrowLeft, 
    Download, 
    RefreshCw, 
    Play, 
    Edit, 
    Trash2, 
    Calendar,
    Clock,
    TrendingUp,
    FileText,
    Users,
    Eye,
    BarChart3,
    Activity
} from 'lucide-react';

interface AnalyticsReport {
    id: number;
    report_code: string;
    title: string;
    description: string;
    type: string;
    frequency: string;
    status: string;
    data?: any;
    summary_stats?: {
        total_value?: number;
        total_items?: number;
        critical_alerts?: number;
    };
    total_value?: number;
    total_items?: number;
    generated_at: string;
    generation_time_seconds?: number;
    view_count: number;
    last_viewed_at?: string;
    auto_generate: boolean;
    email_on_completion: boolean;
    email_recipients?: string[];
    created_by: {
        name: string;
    };
    updated_by?: {
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    report: AnalyticsReport;
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

export default function Show({ report }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

    const formatType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await router.post(`/admin/analytics/${report.id}/generate`);
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = (format: string) => {
        router.get(`/admin/analytics/${report.id}/export`, { format });
    };

    const handleDelete = () => {
        router.delete(`/admin/analytics/${report.id}`);
    };

    const renderDataVisualization = () => {
        if (!report.data) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No data available</p>
                        <p className="text-sm">Generate this report to view data</p>
                    </div>
                </div>
            );
        }

        // Render different visualizations based on report type
        switch (report.type) {
            case 'inventory_summary':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Total Products */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold">{formatNumber(report.data.total_products || 0)}</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Stock Value */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(report.data.total_stock_value || 0)}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Low Stock Items */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatNumber(report.data.low_stock_items || 0)}
                                        </p>
                                    </div>
                                    <Activity className="w-8 h-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'stock_movement':
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Movement Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Movements</p>
                                        <p className="text-xl font-semibold">
                                            {formatNumber(report.summary_stats?.total_items || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Quantity</p>
                                        <p className="text-xl font-semibold">
                                            {formatNumber(report.data?.total_quantity || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return (
                    <Card>
                        <CardContent className="p-6">
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                                {JSON.stringify(report.data, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/admin/analytics')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Reports
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
                            <p className="text-sm text-gray-600">{report.report_code}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {report.status === 'completed' && (
                            <>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Export Report</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Button 
                                                className="w-full justify-start" 
                                                variant="outline"
                                                onClick={() => handleExport('pdf')}
                                            >
                                                Export as PDF
                                            </Button>
                                            <Button 
                                                className="w-full justify-start" 
                                                variant="outline"
                                                onClick={() => handleExport('excel')}
                                            >
                                                Export as Excel
                                            </Button>
                                            <Button 
                                                className="w-full justify-start" 
                                                variant="outline"
                                                onClick={() => handleExport('csv')}
                                            >
                                                Export as CSV
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                        
                        <Button
                            size="sm"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </Button>
                        
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.visit(`/admin/analytics/${report.id}/edit`)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Report</DialogTitle>
                                </DialogHeader>
                                <p>Are you sure you want to delete this report? This action cannot be undone.</p>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            }
        >
            <Head title={`Analytics Report - ${report.title}`} />

            <motion.div
                className="space-y-6"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Report Overview */}
                <motion.div variants={animationVariants}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Status</h3>
                                        <Badge className={getStatusColor(report.status)}>
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Type</h3>
                                        <p className="text-gray-600">{formatType(report.type)}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Frequency</h3>
                                        <p className="text-gray-600">{formatType(report.frequency)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Generated</h3>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            {report.generated_at ? 
                                                new Date(report.generated_at).toLocaleString() : 
                                                'Not generated'
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Generation Time</h3>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            {report.generation_time_seconds ? 
                                                `${report.generation_time_seconds}s` : 
                                                'N/A'
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Views</h3>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Eye className="w-4 h-4" />
                                            {report.view_count}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Created By</h3>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="w-4 h-4" />
                                            {report.created_by.name}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Auto Generate</h3>
                                        <p className="text-gray-600">{report.auto_generate ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                                        <p className="text-gray-600">{report.email_on_completion ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                </div>
                            </div>

                            {report.description && (
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600">{report.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Report Data */}
                <motion.div variants={animationVariants}>
                    <Tabs defaultValue="visualization" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="visualization">Visualization</TabsTrigger>
                            <TabsTrigger value="data">Raw Data</TabsTrigger>
                            {report.summary_stats && (
                                <TabsTrigger value="summary">Summary Stats</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="visualization">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Visualization</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderDataVisualization()}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="data">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Raw Data</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {report.data ? (
                                        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                                            {JSON.stringify(report.data, null, 2)}
                                        </pre>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No data available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {report.summary_stats && (
                            <TabsContent value="summary">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Summary Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {report.summary_stats.total_value && (
                                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">Total Value</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {formatCurrency(report.summary_stats.total_value)}
                                                    </p>
                                                </div>
                                            )}
                                            {report.summary_stats.total_items && (
                                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">Total Items</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {formatNumber(report.summary_stats.total_items)}
                                                    </p>
                                                </div>
                                            )}
                                            {report.summary_stats.critical_alerts && (
                                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">Critical Alerts</p>
                                                    <p className="text-2xl font-bold text-red-600">
                                                        {formatNumber(report.summary_stats.critical_alerts)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}