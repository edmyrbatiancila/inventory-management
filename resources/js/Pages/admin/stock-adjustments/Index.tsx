import CustomPagination from "@/Components/CustomPagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { handleDeleteData } from "@/hooks/deleteFunction";
import { getReasonText } from "@/hooks/stock-adjustments/reasonText";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PaginatedResponse } from "@/types";
import { StockAdjustment } from "@/types/StockAdjustment/IStockAdjustment";
import { containerVariants } from "@/utils/animationVarians";
import { formatDate } from "@/utils/date";
import { Head, router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Edit2, Package, Plus, Trash2, TrendingDown, TrendingUp, View, X } from "lucide-react";
import { useRef, useState } from "react";

interface IStockAdjustmentIndexProps {
    stockAdjustments: PaginatedResponse<StockAdjustment>;
    sort?: string;
}

const StockAdjustmentIndex = ({
    stockAdjustments,
    sort: initialSort = 'newest'
}: IStockAdjustmentIndexProps) => {

    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState(initialSort);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
    
        setSearch(value);
    
        setIsSearching(true);
    
        if (debounceRef.current) clearTimeout(debounceRef.current);
    
        debounceRef.current = setTimeout(() => {
            router.get(
                route('admin.stock-adjustments.index'), 
                { search: value, sort }, 
                { preserveState: true, replace: true }
            );
    
            setIsSearching(false);
        }, 500);
    };

    // Clear search
    const handleClear = () => {
        setSearch('');
        setSort('newest');

        router.get(
            route('admin.stock-adjustments.index'), 
            {}, 
            { preserveState: true, replace: true }
        );
    };

    // Handle filter/sort change for shadcn UI Select
        const handleSortChange = (value: string) => {
            setSort(value);
    
            router.get(
                route('admin.stock-adjustments.index'), 
                { search, sort: value }, 
                { preserveState: true, replace: true }
            );
        };

    return (
        <Authenticated
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-blue-600" />
                        Stock Adjustment Management
                    </h2>
                </motion.div>
            }
        >
            <Head title="Stock Adjustments" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="py-12"
            >
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters/Search UI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                    >
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <Input 
                                type="text"
                                placeholder="Search stock adjustments..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full max-w-xs shadow-sm focus:ring-2 focus:ring-blue-200"
                                aria-label="Search stock adjustments"
                            />
                        {search && (
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={ handleClear }
                                    title="Clear Search"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}
                            <motion.div whileHover={{ scale: 1.03 }}>
                                <Select
                                    value={ sort } 
                                    onValueChange={ handleSortChange }
                                >
                                    <SelectTrigger className="w-[180px] shadow-sm focus:ring-2 focus:ring-blue-200">
                                        <SelectValue placeholder="Filter stock adjustments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Select Filter</SelectLabel>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="oldest">Oldest First</SelectItem>
                                            <SelectItem value="quantity_high">Highest Quantity</SelectItem>
                                            <SelectItem value="quantity_low">Lowest Quantity</SelectItem>
                                            <SelectItem value="reference">Reference Number</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>

                        <motion.div whileHover={{ scale: 1.04 }}>
                            <Button
                                onClick={() => router.visit(route('admin.stock-adjustments.create'))}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-150"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Stock Adjustment
                            </Button>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <Card className="shadow-lg border border-blue-100 rounded-xl bg-white/90">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100 bg-blue-50/60 rounded-t-xl">
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    Stock Adjustments <span className="text-blue-400 font-normal">({ stockAdjustments.total })</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence mode="wait">
                                {stockAdjustments.data.length > 0 ? (
                                    <motion.div
                                        key="table"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-16">#</TableHead>
                                                    <TableHead className="w-32">Reference</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Warehouse</TableHead>
                                                    <TableHead className="text-center w-24">Type</TableHead>
                                                    <TableHead className="text-center w-24">Quantity</TableHead>
                                                    <TableHead className="text-center w-32">Stock Levels</TableHead>
                                                    <TableHead className="w-24">Reason</TableHead>
                                                    <TableHead className="w-20">Date</TableHead>
                                                    <TableHead className="w-32 text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {stockAdjustments.data.map((adjustment, idx) => {
                                                const rowNumber = (stockAdjustments.current_page - 1) * stockAdjustments.per_page + idx + 1;

                                                return (
                                                    <motion.tr
                                                        key={adjustment.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                        className="hover:bg-blue-50/60 transition-colors"
                                                    >
                                                        <TableCell className="w-16 font-semibold text-blue-700">
                                                            { rowNumber }
                                                        </TableCell>

                                                        <TableCell className="font-mono text-sm">
                                                            { adjustment.reference_number }
                                                        </TableCell>

                                                        {/* Product Information */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Package className="w-4 h-4 text-blue-500" />
                                                                <div>
                                                                    <div 
                                                                        className="font-medium truncate max-w-[200px]" 
                                                                        title={adjustment.inventory.product.name}
                                                                    >
                                                                        {adjustment.inventory.product.name}
                                                                    </div>
                                                                    <div 
                                                                        className="text-sm text-gray-500 truncate" 
                                                                        title={adjustment.inventory.product.sku}
                                                                    >
                                                                        SKU: {adjustment.inventory.product.sku}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Warehouse Information */}
                                                        <TableCell>
                                                            <div>
                                                                <div 
                                                                    className="font-medium truncate max-w-[150px]" 
                                                                    title={adjustment.inventory.warehouse.name}
                                                                >
                                                                    {adjustment.inventory.warehouse.name}
                                                                </div>
                                                                <div 
                                                                    className="text-sm text-gray-500 truncate" 
                                                                    title={adjustment.inventory.warehouse.code}
                                                                >
                                                                    {adjustment.inventory.warehouse.code}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <Badge variant={adjustment.adjustment_type === 'increase' ? 'default' : 'secondary'}>
                                                                {adjustment.adjustment_type === 'increase' ? (
                                                                    <>
                                                                        <TrendingUp className="w-3 h-3 mr-1" /> 
                                                                        Increase
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <TrendingDown className="w-3 h-3 mr-1" /> 
                                                                        Decrease
                                                                    </>
                                                                )}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <span className={`font-semibold text-lg ${
                                                                adjustment.adjustment_type === 'increase' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {adjustment.adjustment_type === 'increase' ? '+' : '-'}{adjustment.quantity_adjusted.toLocaleString()}
                                                            </span>
                                                        </TableCell>

                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                                <span className="text-gray-600">
                                                                    {adjustment.quantity_before.toLocaleString()}
                                                                </span>
                                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                                <span className="font-semibold text-gray-900">
                                                                    {adjustment.quantity_after.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">
                                                                {getReasonText(adjustment.reason)}
                                                            </Badge>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>{formatDate(adjustment.adjusted_at)}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {new Date(adjustment.adjusted_at).toLocaleTimeString('en-US', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Actions */}
                                                        <TableCell className="w-32">
                                                            <div className="flex gap-2 justify-center">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="View Stock Adjustment Details"
                                                                    onClick={() => router.visit(route('admin.stock-adjustments.show', adjustment.id))}
                                                                >
                                                                    <View className="w-4 h-4" />
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="Edit Stock Adjustment"
                                                                    onClick={() => router.visit(route('admin.stock-adjustments.edit', adjustment.id))}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </motion.button>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                );
                                            })}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-6">
                                            <CustomPagination data={ stockAdjustments } />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }} 
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <TrendingUp className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                                        </motion.div>
                                        <h3 className="text-xl font-semibold mb-2 text-blue-700">
                                            No Stock Adjustment Found
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Get started by creating your first stock adjustment.
                                        </p>
                                        <motion.div whileHover={{ scale: 1.08 }}>
                                            <Button
                                                onClick={() => router.visit(route('admin.stock-adjustments.create'))}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Stock Adjustment
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default StockAdjustmentIndex;