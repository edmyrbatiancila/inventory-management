import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    Filter, 
    Download, 
    RefreshCw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/Components/ui/dropdown-menu';

interface DataColumn {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

interface DataTableWidgetProps {
    title: string;
    data: any[];
    columns: DataColumn[];
    loading?: boolean;
    searchable?: boolean;
    filterable?: boolean;
    exportable?: boolean;
    itemsPerPage?: number;
    totalCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onExport?: () => void;
    onRefresh?: () => void;
    emptyMessage?: string;
    className?: string;
}

type SortState = {
    key: string | null;
    direction: 'asc' | 'desc' | null;
};

const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.01 }
};

const rowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    hover: { backgroundColor: '#f9fafb' }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export default function DataTableWidget({
    title,
    data,
    columns,
    loading = false,
    searchable = true,
    filterable = false,
    exportable = true,
    itemsPerPage = 10,
    totalCount,
    currentPage = 1,
    onPageChange,
    onSearch,
    onSort,
    onExport,
    onRefresh,
    emptyMessage = "No data available",
    className = ''
}: DataTableWidgetProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortState, setSortState] = useState<SortState>({ key: null, direction: null });

    const handleSort = (key: string) => {
        const column = columns.find(col => col.key === key);
        if (!column?.sortable) return;

        let newDirection: 'asc' | 'desc' = 'asc';
        
        if (sortState.key === key) {
            newDirection = sortState.direction === 'asc' ? 'desc' : 'asc';
        }
        
        setSortState({ key, direction: newDirection });
        onSort?.(key, newDirection);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch?.(query);
    };

    const getSortIcon = (columnKey: string) => {
        if (sortState.key !== columnKey) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortState.direction === 'asc' 
            ? <ArrowUp className="w-4 h-4 text-blue-600" />
            : <ArrowDown className="w-4 h-4 text-blue-600" />;
    };

    const displayData = useMemo(() => {
        let filteredData = [...data];
        
        // Local search if no onSearch handler
        if (!onSearch && searchQuery) {
            filteredData = filteredData.filter(row =>
                columns.some(column => 
                    String(row[column.key] || '')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
            );
        }

        // Local sorting if no onSort handler
        if (!onSort && sortState.key) {
            filteredData.sort((a, b) => {
                const aVal = a[sortState.key!];
                const bVal = b[sortState.key!];
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }
                
                const aStr = String(aVal || '').toLowerCase();
                const bStr = String(bVal || '').toLowerCase();
                
                if (sortState.direction === 'asc') {
                    return aStr.localeCompare(bStr);
                }
                return bStr.localeCompare(aStr);
            });
        }

        return filteredData;
    }, [data, searchQuery, sortState, columns, onSearch, onSort]);

    const totalPages = totalCount ? Math.ceil(totalCount / itemsPerPage) : Math.ceil(displayData.length / itemsPerPage);
    const currentData = totalCount ? displayData : displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                            {exportable && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onExport}
                                    disabled={loading}
                                    className="h-8"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Export
                                </Button>
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

                    {/* Search and Filter Controls */}
                    {(searchable || filterable) && (
                        <div className="flex items-center gap-2 mt-3">
                            {searchable && (
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-9 h-8"
                                        disabled={loading}
                                    />
                                </div>
                            )}
                            {filterable && (
                                <Button variant="outline" size="sm" className="h-8">
                                    <Filter className="w-4 h-4 mr-1" />
                                    Filter
                                </Button>
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="pt-0">
                    {loading ? (
                        <div className="space-y-3">
                            {/* Table Header Skeleton */}
                            <div className="flex items-center gap-4 p-3 border-b">
                                {columns.map((_, i) => (
                                    <div key={i} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                                ))}
                            </div>
                            {/* Table Rows Skeleton */}
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 border-b last:border-b-0">
                                    {columns.map((_, j) => (
                                        <div key={j} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : currentData.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">{emptyMessage}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {columns.map((column) => (
                                            <th
                                                key={column.key}
                                                className={`py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                                    column.align === 'center' ? 'text-center' : 
                                                    column.align === 'right' ? 'text-right' : 'text-left'
                                                } ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                                style={{ width: column.width }}
                                                onClick={() => column.sortable && handleSort(column.key)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    {column.label}
                                                    {column.sortable && getSortIcon(column.key)}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <motion.tbody variants={staggerContainer} className="divide-y divide-gray-200">
                                    {currentData.map((row, index) => (
                                        <motion.tr
                                            key={index}
                                            variants={rowVariants}
                                            whileHover="hover"
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className={`py-3 px-4 whitespace-nowrap text-sm text-gray-900 ${
                                                        column.align === 'center' ? 'text-center' : 
                                                        column.align === 'right' ? 'text-right' : 'text-left'
                                                    }`}
                                                >
                                                    {column.render 
                                                        ? column.render(row[column.key], row)
                                                        : row[column.key]
                                                    }
                                                </td>
                                            ))}
                                            <td className="py-3 px-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-sm text-gray-600">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount || displayData.length)} of {totalCount || displayData.length} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange?.(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                
                                {/* Page Numbers */}
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum = currentPage - 2 + i;
                                    if (pageNum < 1) pageNum = i + 1;
                                    if (pageNum > totalPages) return null;
                                    
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === currentPage ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onPageChange?.(pageNum)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onPageChange?.(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}