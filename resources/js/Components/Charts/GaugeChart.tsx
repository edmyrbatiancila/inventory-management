import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Circle } from 'lucide-react';

interface GaugeChartProps {
    title: string;
    value: number;
    maxValue: number;
    label?: string;
    unit?: string;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    showPercentage?: boolean;
    loading?: boolean;
    thresholds?: {
        low: number;
        medium: number;
        high: number;
    };
    className?: string;
}

const sizeConfig = {
    sm: {
        dimension: 120,
        strokeWidth: 8,
        fontSize: 'text-lg',
        titleSize: 'text-sm'
    },
    md: {
        dimension: 160,
        strokeWidth: 10,
        fontSize: 'text-xl',
        titleSize: 'text-base'
    },
    lg: {
        dimension: 200,
        strokeWidth: 12,
        fontSize: 'text-2xl',
        titleSize: 'text-lg'
    }
};

const getColorByThreshold = (value: number, maxValue: number, thresholds?: any) => {
    if (!thresholds) return '#3b82f6'; // blue-500
    
    const percentage = (value / maxValue) * 100;
    
    if (percentage <= thresholds.low) return '#10b981'; // green-500
    if (percentage <= thresholds.medium) return '#f59e0b'; // yellow-500
    if (percentage <= thresholds.high) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
};

const animationVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.02 }
};

export default function GaugeChart({
    title,
    value,
    maxValue,
    label,
    unit = '',
    color,
    size = 'md',
    showValue = true,
    showPercentage = true,
    loading = false,
    thresholds,
    className = ''
}: GaugeChartProps) {
    const config = sizeConfig[size];
    const percentage = Math.min((value / maxValue) * 100, 100);
    const gaugeColor = color || getColorByThreshold(value, maxValue, thresholds);
    
    const radius = (config.dimension - config.strokeWidth) / 2;
    const circumference = radius * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const formatValue = (val: number) => {
        if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
        } else if (val >= 1000) {
            return `${(val / 1000).toFixed(1)}K`;
        }
        return val.toString();
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
                    <CardTitle className={`${config.titleSize} font-semibold text-gray-900 text-center`}>
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-0">
                    {loading ? (
                        <div className="animate-pulse">
                            <div 
                                className="rounded-full bg-gray-200"
                                style={{ 
                                    width: config.dimension, 
                                    height: config.dimension 
                                }}
                            ></div>
                            <div className="mt-4 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                                <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Background Circle */}
                            <svg
                                width={config.dimension}
                                height={config.dimension}
                                className="transform -rotate-90"
                            >
                                <circle
                                    cx={config.dimension / 2}
                                    cy={config.dimension / 2}
                                    r={radius}
                                    stroke="#e5e7eb"
                                    strokeWidth={config.strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={0}
                                />
                                
                                {/* Progress Circle */}
                                <motion.circle
                                    cx={config.dimension / 2}
                                    cy={config.dimension / 2}
                                    r={radius}
                                    stroke={gaugeColor}
                                    strokeWidth={config.strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ 
                                        duration: 1.5, 
                                        delay: 0.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            </svg>
                            
                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {showValue && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className={`${config.fontSize} font-bold text-gray-900`}
                                    >
                                        {formatValue(value)}{unit}
                                    </motion.div>
                                )}
                                
                                {showPercentage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-sm text-gray-600"
                                    >
                                        {percentage.toFixed(1)}%
                                    </motion.div>
                                )}
                                
                                {label && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="text-xs text-gray-500 text-center mt-1"
                                    >
                                        {label}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Threshold Legend */}
                    {thresholds && !loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                            className="flex items-center gap-3 mt-4 text-xs"
                        >
                            <div className="flex items-center gap-1">
                                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                                <span className="text-gray-600">Low</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                                <span className="text-gray-600">Medium</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
                                <span className="text-gray-600">High</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                                <span className="text-gray-600">Critical</span>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Range Information */}
                    {!loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3 }}
                            className="flex items-center justify-between w-full mt-3 text-xs text-gray-500"
                        >
                            <span>0{unit}</span>
                            <span>{formatValue(maxValue)}{unit}</span>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}