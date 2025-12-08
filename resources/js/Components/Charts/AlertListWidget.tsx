import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { AlertTriangle, AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface AlertItem {
    id: string | number;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    category?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface AlertListWidgetProps {
    title: string;
    alerts: AlertItem[];
    loading?: boolean;
    onRefresh?: () => void;
    onViewAll?: () => void;
    maxItems?: number;
    className?: string;
}

const severityConfig = {
    low: {
        icon: Info,
        color: 'bg-blue-100 text-blue-800',
        borderColor: 'border-blue-200'
    },
    medium: {
        icon: AlertCircle,
        color: 'bg-yellow-100 text-yellow-800',
        borderColor: 'border-yellow-200'
    },
    high: {
        icon: AlertTriangle,
        color: 'bg-orange-100 text-orange-800',
        borderColor: 'border-orange-200'
    },
    critical: {
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-800',
        borderColor: 'border-red-200'
    }
};

const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -2 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function AlertListWidget({
    title,
    alerts,
    loading = false,
    onRefresh,
    onViewAll,
    maxItems = 5,
    className = ''
}: AlertListWidgetProps) {
    const displayAlerts = maxItems > 0 ? alerts.slice(0, maxItems) : alerts;

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className={className}
        >
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            {title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {alerts.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    {alerts.length}
                                </Badge>
                            )}
                            {onRefresh && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRefresh}
                                    disabled={loading}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">All Clear!</h3>
                            <p className="text-gray-600">No alerts at this time</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            className="space-y-2"
                        >
                            {displayAlerts.map((alert, index) => {
                                const config = severityConfig[alert.severity];
                                const SeverityIcon = config.icon;
                                
                                return (
                                    <motion.div
                                        key={alert.id}
                                        variants={animationVariants}
                                        className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${config.borderColor}`}
                                    >
                                        <div className={`p-1 rounded-full ${config.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                                            <SeverityIcon className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                                    {alert.title}
                                                </h4>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={config.color} variant="outline">
                                                        {alert.severity}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatTimestamp(alert.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {alert.description}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                {alert.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {alert.category}
                                                    </Badge>
                                                )}
                                                
                                                {alert.action && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={alert.action.onClick}
                                                        className="text-xs h-6 px-2 ml-auto"
                                                    >
                                                        {alert.action.label}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                    
                    {!loading && alerts.length > maxItems && onViewAll && (
                        <div className="mt-4 pt-3 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onViewAll}
                                className="w-full"
                            >
                                View All {alerts.length} Alerts
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}