import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { 
    Search, Filter, AlertTriangle, TrendingUp, CheckCircle, 
    Clock, User, MoreHorizontal, Eye, UserPlus, MessageSquare,
    AlertCircle, Target, Lightbulb, Shield, Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Insight {
    id: number;
    insight_code: string;
    title: string;
    description: string;
    type: string;
    severity: string;
    category: string;
    status: string;
    priority: string;
    current_value?: number;
    threshold_value?: number;
    percentage_change?: number;
    trend_direction?: string;
    urgency: string;
    detected_at: string;
    assigned_to?: {
        name: string;
    };
    created_by?: {
        name: string;
    };
}

interface Props {
    insights: {
        data: Insight[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        type?: string;
        category?: string;
        severity?: string;
        status?: string;
        priority?: string;
    };
    stats: {
        total: number;
        new: number;
        in_progress: number;
        high_priority: number;
        critical_severity: number;
        resolved_today: number;
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
            staggerChildren: 0.05
        }
    }
};

export default function Index({ insights, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState('all');

    const handleFilter = () => {
        router.get(route('admin.insights.index'), {
            search: search || undefined,
            type: filters.type || undefined,
            category: filters.category || undefined,
            severity: filters.severity || undefined,
            status: filters.status || undefined,
            priority: filters.priority || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getSeverityColor = (severity: string) => {
        const colors = {
            'low': 'bg-blue-100 text-blue-800 border-blue-200',
            'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'high': 'bg-orange-100 text-orange-800 border-orange-200',
            'critical': 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'new': 'bg-blue-100 text-blue-800',
            'acknowledged': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-orange-100 text-orange-800',
            'resolved': 'bg-green-100 text-green-800',
            'dismissed': 'bg-gray-100 text-gray-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            'anomaly_detection': AlertTriangle,
            'trend_analysis': TrendingUp,
            'performance_alert': AlertCircle,
            'optimization_suggestion': Lightbulb,
            'risk_warning': Shield,
        };
        return icons[type as keyof typeof icons] || Activity;
    };

    const formatType = (type: string) => {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const handleAction = (insightId: number, action: string) => {
        switch (action) {
            case 'acknowledge':
                router.post(route('admin.insights.acknowledge', insightId));
                break;
            case 'view':
                router.visit(route('admin.insights.show', insightId));
                break;
        }
    };

    const filteredInsights = insights.data.filter(insight => {
        switch (activeTab) {
            case 'new':
                return insight.status === 'new';
            case 'high_priority':
                return ['high', 'critical'].includes(insight.priority);
            case 'critical':
                return insight.severity === 'critical';
            default:
                return true;
        }
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Business Insights</h2>
                    <Button onClick={() => router.post(route('admin.insights.detect'))}>
                        <Activity className="w-4 h-4 mr-2" />
                        Detect Anomalies
                    </Button>
                </div>
            }
        >
            <Head title="Business Insights" />

            <motion.div
                className="space-y-6"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Stats Overview */}
                <motion.div variants={animationVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Insights</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <Activity className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">New</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">In Progress</p>
                                        <p className="text-2xl font-bold text-orange-600">{stats.in_progress}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">High Priority</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.high_priority}</p>
                                    </div>
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Critical</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.critical_severity}</p>
                                    </div>
                                    <Shield className="w-8 h-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Resolved Today</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.resolved_today}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div variants={animationVariants}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                <CardTitle>Filters</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search insights..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleFilter}>
                                    Apply Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Insights Tabs */}
                <motion.div variants={animationVariants}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All Insights</TabsTrigger>
                            <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
                            <TabsTrigger value="high_priority">High Priority</TabsTrigger>
                            <TabsTrigger value="critical">Critical</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            <div className="space-y-4">
                                {filteredInsights.map((insight, index) => {
                                    const TypeIcon = getTypeIcon(insight.type);
                                    
                                    return (
                                        <motion.div
                                            key={insight.id}
                                            variants={animationVariants}
                                            transition={{ delay: index * 0.05 }}
                                            className="group"
                                        >
                                            <Card className="hover:shadow-md transition-all duration-200">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4 flex-1">
                                                            <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                                                                <TypeIcon className="w-5 h-5" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start gap-2 mb-2">
                                                                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                                                                        {insight.title}
                                                                    </h3>
                                                                    <div className="flex gap-2 shrink-0">
                                                                        <Badge className={getSeverityColor(insight.severity)}>
                                                                            {insight.severity}
                                                                        </Badge>
                                                                        <Badge className={getStatusColor(insight.status)}>
                                                                            {insight.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>

                                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                                    {insight.description}
                                                                </p>

                                                                <div className="flex items-center gap-6 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Target className="w-3 h-3" />
                                                                        {formatType(insight.type)}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {format(new Date(insight.detected_at), 'MMM dd, yyyy HH:mm')}
                                                                    </span>
                                                                    {insight.assigned_to && (
                                                                        <span className="flex items-center gap-1">
                                                                            <User className="w-3 h-3" />
                                                                            {insight.assigned_to.name}
                                                                        </span>
                                                                    )}
                                                                    <span>{insight.insight_code}</span>
                                                                </div>

                                                                {(insight.current_value !== null && insight.threshold_value !== null) && (
                                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <span className="text-gray-600">Current:</span>
                                                                                <span className="ml-2 font-semibold">
                                                                                    {insight.current_value?.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-gray-600">Threshold:</span>
                                                                                <span className="ml-2 font-semibold">
                                                                                    {insight.threshold_value?.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {insight.percentage_change && (
                                                                            <div className="mt-2">
                                                                                <span className="text-gray-600 text-sm">Change:</span>
                                                                                <span className={`ml-2 font-semibold text-sm ${
                                                                                    insight.percentage_change > 0 ? 'text-red-600' : 'text-green-600'
                                                                                }`}>
                                                                                    {insight.percentage_change > 0 ? '+' : ''}{insight.percentage_change}%
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleAction(insight.id, 'view')}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                {insight.status === 'new' && (
                                                                    <DropdownMenuItem onClick={() => handleAction(insight.id, 'acknowledge')}>
                                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                                        Acknowledge
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}

                                {filteredInsights.length === 0 && (
                                    <motion.div variants={animationVariants}>
                                        <Card>
                                            <CardContent className="flex flex-col items-center justify-center py-16">
                                                <Activity className="w-16 h-16 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Found</h3>
                                                <p className="text-gray-600 text-center mb-6">
                                                    {activeTab === 'all' 
                                                        ? "No business insights have been detected yet. Run anomaly detection to generate insights."
                                                        : `No ${activeTab.replace('_', ' ')} insights found.`
                                                    }
                                                </p>
                                                <Button onClick={() => router.post(route('admin.insights.detect'))}>
                                                    <Activity className="w-4 h-4 mr-2" />
                                                    Detect Anomalies
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}