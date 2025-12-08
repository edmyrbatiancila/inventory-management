import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive?: boolean;
    };
    icon?: React.ReactNode;
    loading?: boolean;
    onRefresh?: () => void;
    className?: string;
    valuePrefix?: string;
    valueSuffix?: string;
    color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

const colorClasses = {
    blue: {
        icon: 'text-blue-600',
        background: 'bg-blue-100',
        trend: 'text-blue-600'
    },
    green: {
        icon: 'text-green-600',
        background: 'bg-green-100',
        trend: 'text-green-600'
    },
    red: {
        icon: 'text-red-600',
        background: 'bg-red-100',
        trend: 'text-red-600'
    },
    orange: {
        icon: 'text-orange-600',
        background: 'bg-orange-100',
        trend: 'text-orange-600'
    },
    purple: {
        icon: 'text-purple-600',
        background: 'bg-purple-100',
        trend: 'text-purple-600'
    }
};

const animationVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.02 }
};

export default function KPICard({
    title,
    value,
    subtitle,
    trend,
    icon,
    loading = false,
    onRefresh,
    className = '',
    valuePrefix = '',
    valueSuffix = '',
    color = 'blue'
}: KPICardProps) {
    const colorClass = colorClasses[color];

    const formatValue = (val: string | number) => {
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return val;
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        
        if (trend.value > 0) {
            return <TrendingUp className="w-4 h-4" />;
        } else if (trend.value < 0) {
            return <TrendingDown className="w-4 h-4" />;
        } else {
            return <Minus className="w-4 h-4" />;
        }
    };

    const getTrendColor = () => {
        if (!trend) return '';
        
        if (trend.isPositive !== undefined) {
            return trend.isPositive ? 'text-green-600' : 'text-red-600';
        }
        
        // Default: positive values are green, negative are red
        return trend.value >= 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className={className}
        >
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600 truncate">
                            {title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {icon && (
                                <div className={`p-1.5 rounded-lg ${colorClass.background}`}>
                                    <div className={colorClass.icon}>
                                        {icon}
                                    </div>
                                </div>
                            )}
                            {onRefresh && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onRefresh}
                                    disabled={loading}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                {subtitle && <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>}
                            </div>
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-gray-900">
                                    {valuePrefix}{formatValue(value)}{valueSuffix}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    {subtitle && (
                                        <p className="text-sm text-gray-600 truncate">
                                            {subtitle}
                                        </p>
                                    )}
                                    
                                    {trend && (
                                        <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
                                            {getTrendIcon()}
                                            <span>
                                                {trend.value > 0 ? '+' : ''}{trend.value}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}