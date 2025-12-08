import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface ProgressItem {
    id: string | number;
    label: string;
    value: number;
    maxValue: number;
    color?: string;
    status?: 'success' | 'warning' | 'error' | 'info';
    trend?: {
        direction: 'up' | 'down';
        percentage: number;
    };
    target?: number;
}

interface ProgressWidgetProps {
    title: string;
    items: ProgressItem[];
    loading?: boolean;
    onRefresh?: () => void;
    showPercentages?: boolean;
    showTargets?: boolean;
    showTrends?: boolean;
    orientation?: 'vertical' | 'horizontal';
    className?: string;
}

const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
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

const progressVariants = {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 }
};

export default function ProgressWidget({
    title,
    items,
    loading = false,
    onRefresh,
    showPercentages = true,
    showTargets = false,
    showTrends = false,
    orientation = 'vertical',
    className = ''
}: ProgressWidgetProps) {
    const getProgressColor = (item: ProgressItem) => {
        if (item.color) return item.color;
        if (item.status) return statusColors[item.status];
        
        const percentage = (item.value / item.maxValue) * 100;
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatValue = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    };

    const getTargetStatus = (item: ProgressItem) => {
        if (!item.target) return null;
        
        const percentage = (item.value / item.maxValue) * 100;
        const targetPercentage = (item.target / item.maxValue) * 100;
        
        if (percentage >= targetPercentage) return 'success';
        if (percentage >= targetPercentage * 0.8) return 'warning';
        return 'error';
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
                </CardHeader>
                <CardContent className="pt-0">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex justify-between mb-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No progress data available</p>
                        </div>
                    ) : (
                        <motion.div 
                            variants={staggerContainer}
                            className={`${orientation === 'horizontal' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}
                        >
                            {items.map((item) => {
                                const percentage = Math.min((item.value / item.maxValue) * 100, 100);
                                const targetStatus = getTargetStatus(item);
                                
                                return (
                                    <motion.div
                                        key={item.id}
                                        variants={animationVariants}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {item.label}
                                                </span>
                                                {targetStatus && showTargets && (
                                                    <Badge 
                                                        variant="outline"
                                                        className={`text-xs ${
                                                            targetStatus === 'success' ? 'text-green-600 border-green-200' :
                                                            targetStatus === 'warning' ? 'text-yellow-600 border-yellow-200' :
                                                            'text-red-600 border-red-200'
                                                        }`}
                                                    >
                                                        {targetStatus === 'success' ? 'On Track' : 
                                                         targetStatus === 'warning' ? 'Behind' : 'Critical'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {showTrends && item.trend && (
                                                    <div className={`flex items-center gap-1 ${
                                                        item.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {item.trend.direction === 'up' ? (
                                                            <TrendingUp className="w-3 h-3" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3" />
                                                        )}
                                                        <span className="text-xs font-medium">
                                                            {item.trend.percentage}%
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-600">
                                                    {formatValue(item.value)}{showPercentages && ` (${percentage.toFixed(1)}%)`}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    className={`h-2 rounded-full ${getProgressColor(item)}`}
                                                    variants={progressVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    transition={{ 
                                                        duration: 1, 
                                                        delay: 0.2,
                                                        ease: "easeInOut"
                                                    }}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            
                                            {/* Target line */}
                                            {showTargets && item.target && (
                                                <div
                                                    className="absolute top-0 h-2 w-0.5 bg-gray-800 rounded-full"
                                                    style={{ 
                                                        left: `${Math.min((item.target / item.maxValue) * 100, 100)}%`,
                                                        transform: 'translateX(-50%)'
                                                    }}
                                                    title={`Target: ${formatValue(item.target)}`}
                                                />
                                            )}
                                        </div>
                                        
                                        {/* Progress details */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>0</span>
                                            <div className="flex items-center gap-2">
                                                {showTargets && item.target && (
                                                    <span>Target: {formatValue(item.target)}</span>
                                                )}
                                                <span>{formatValue(item.maxValue)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}