import CustomPagination from "@/Components/CustomPagination";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/Components/ui/empty";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PaginatedResponse } from "@/types";
import { Product } from "@/types/Product/IProduct";
import { 
    MovementTypeColors, 
    MovementTypeLabels, 
    StatusColors, 
    StatusLabels, 
    StockMovement, 
    StockMovementFilters, 
    StockMovementSearchStats 
} from "@/types/StockMovement/IStockMovement";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { formatDate } from "@/utils/date";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { 
    Activity, 
    ArrowDownCircle, 
    ArrowUpCircle, 
    BarChart3,
    Filter, 
    History, 
    Loader2, 
    PackageOpen, 
    Search, 
    TrendingDown, 
    TrendingUp, 
    View, 
    X 
} from "lucide-react";
import { useRef, useState } from "react";

interface IStockMovementsIndexProps {
    movements: PaginatedResponse<StockMovement>;
    searchStats?: StockMovementSearchStats;
    products: Product[];
    warehouses: Warehouse[];
    currentFilters: StockMovementFilters;
    sort?: string;
    status?: string;
}

const StockMovementsIndex = ({
    movements,
    searchStats,
    products,
    warehouses,
    currentFilters,
    sort: initialSort = 'newest',
    status: initialStatus
}: IStockMovementsIndexProps) => {
    const [search, setSearch] = useState<string>(currentFilters.search || '');
    const [sort, setSort] = useState(initialSort);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setSearch(value);
        setIsSearching(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            router.get(
                route('admin.stock-movements.index'), 
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
            route('admin.stock-movements.index'), 
            {}, 
            { preserveState: true, replace: true }
        );
    };

    // Handle filter/sort change for shadcn UI Select
    const handleSortChange = (value: string) => {
        setSort(value);

        router.get(
            route('admin.stock-movements.index'), 
            { search, sort: value }, 
            { preserveState: true, replace: true }
        );
    };

    // Get movement direction icon
    const getMovementIcon = (movementType: string, quantityMoved: number) => {
        if (movementType.includes('increase') || movementType === 'transfer_in' || movementType === 'purchase_receive' || movementType === 'return_customer') {
            return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
        } else if (movementType.includes('decrease') || movementType === 'transfer_out' || movementType === 'sale_fulfill' || movementType.includes('write_off')) {
            return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
        }
        
        return <Activity className="w-4 h-4 text-blue-600" />;
    };

    // Get value display
    const getValueDisplay = (movement: StockMovement) => {
        if (movement.total_value !== null && movement.total_value !== undefined) {
            const value = typeof movement.total_value === 'string' 
                ? parseFloat(movement.total_value) 
                : movement.total_value;
            return isNaN(value) || value === 0 ? '-' : `$${value.toFixed(2)}`;
        }
        return '-';
    };

    // Calculate increases and decreases from movement types
    const getMovementTypeStats = (movementTypes: Record<string, number>) => {
        const increaseTypes = ['adjustment_increase', 'transfer_in', 'purchase_receive', 'return_customer'];
        const decreaseTypes = ['adjustment_decrease', 'transfer_out', 'sale_fulfill', 'return_supplier', 'damage_write_off', 'expiry_write_off'];
        
        const increases = increaseTypes.reduce((sum, type) => sum + (movementTypes[type] || 0), 0);
        const decreases = decreaseTypes.reduce((sum, type) => sum + (movementTypes[type] || 0), 0);
        
        return { increases, decreases };
    };

    return (
        <Authenticated
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <History className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-800 tracking-tight">
                                Stock Movement History
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Complete audit trail of all inventory transactions
                            </p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {searchStats && (
                        <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{searchStats.totalMovements}</div>
                                <div className="text-xs text-gray-500">Total Movements</div>
                            </div>
                            {searchStats.statusCounts.pending > 0 && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{searchStats.statusCounts.pending}</div>
                                    <div className="text-xs text-gray-500">Pending</div>
                                </div>
                            )}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{searchStats.statusCounts.applied || 0}</div>
                                <div className="text-xs text-gray-500">Applied</div>
                            </div>
                        </div>
                    )}
                </motion.div>
            }
        >
            <Head title="Stock Movement History" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="py-8"
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Search and Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white overflow-hidden shadow-sm rounded-lg mb-6"
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                {/* Search Input */}
                                <div className="flex-1 max-w-lg">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {isSearching ? (
                                                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Search movements by reference, product, warehouse, or user..."
                                            value={search}
                                            onChange={handleSearchChange}
                                            className="pl-10 pr-10"
                                        />
                                        {search && (
                                            <button
                                                onClick={handleClear}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    {/* Sort */}
                                    <Select value={sort} onValueChange={handleSortChange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="oldest">Oldest First</SelectItem>
                                            <SelectItem value="quantity_high">Highest Quantity</SelectItem>
                                            <SelectItem value="quantity_low">Lowest Quantity</SelectItem>
                                            <SelectItem value="value_high">Highest Value</SelectItem>
                                            <SelectItem value="value_low">Lowest Value</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Advanced Search Button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAdvancedSearch(true)}
                                        className="shrink-0"
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Advanced
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search Stats Cards */}
                    {searchStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
                        >
                            {/* Movement Types */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        Stock Increases
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {getMovementTypeStats(searchStats.movementTypes).increases}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Adjustments, transfers in, receipts
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                        Stock Decreases
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {getMovementTypeStats(searchStats.movementTypes).decreases}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Sales, transfers out, write-offs
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-blue-600" />
                                        Total Value
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        ${searchStats.valueAnalysis.netValue?.toFixed(0) || '0'}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Combined movement value
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-purple-600" />
                                        Quantity Moved
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {Math.abs(searchStats.quantityAnalysis.netQuantity)?.toLocaleString() || '0'}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Total units processed
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Main Content Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <PackageOpen className="w-5 h-5 text-blue-600" />
                                            Stock Movements
                                        </CardTitle>
                                        <CardDescription>
                                            {movements.total > 0 ? (
                                                <>
                                                    Showing {movements.from} to {movements.to} of {movements.total} movements
                                                </>
                                            ) : (
                                                'No movements found matching your criteria'
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {movements.data.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-20">Type</TableHead>
                                                    <TableHead className="w-32">Reference</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Warehouse</TableHead>
                                                    <TableHead className="text-center w-24">Quantity</TableHead>
                                                    <TableHead className="text-right w-24">Value</TableHead>
                                                    <TableHead className="w-24">Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="w-20 text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {movements.data.map((movement) => (
                                                    <TableRow 
                                                        key={movement.id}
                                                        className="group hover:bg-gray-50/50 transition-colors"
                                                    >
                                                        {/* Movement Type with Icon */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getMovementIcon(movement.movement_type, movement.quantity_moved)}
                                                                <div className="flex flex-col">
                                                                    <Badge 
                                                                        variant="secondary" 
                                                                        className={`text-xs ${MovementTypeColors[movement.movement_type]} border-0`}
                                                                    >
                                                                        {MovementTypeLabels[movement.movement_type]}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Reference Number */}
                                                        <TableCell>
                                                            <div className="font-medium text-sm text-blue-600">
                                                                {movement.reference_number}
                                                            </div>
                                                            {movement.reason && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {movement.reason}
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        {/* Product */}
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <div className="font-medium text-sm">
                                                                    {movement.product?.name || 'Unknown Product'}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    SKU: {movement.product?.sku || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Warehouse */}
                                                        <TableCell>
                                                            <div className="text-sm font-medium">
                                                                {movement.warehouse?.name || 'Unknown Warehouse'}
                                                            </div>
                                                            {movement.warehouse?.code && (
                                                                <div className="text-xs text-gray-500">
                                                                    {movement.warehouse.code}
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        {/* Quantity */}
                                                        <TableCell className="text-center">
                                                            <div className={`flex items-center justify-center gap-1 ${
                                                                movement.quantity_moved > 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {movement.quantity_moved > 0 ? (
                                                                    <ArrowUpCircle className="w-3 h-3" />
                                                                ) : (
                                                                    <ArrowDownCircle className="w-3 h-3" />
                                                                )}
                                                                <span className="font-medium">
                                                                    {Math.abs(movement.quantity_moved)}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Before: {movement.quantity_before} → After: {movement.quantity_after}
                                                            </div>
                                                        </TableCell>

                                                        {/* Value */}
                                                        <TableCell className="text-right">
                                                            <div className="font-medium">
                                                                {getValueDisplay(movement)}
                                                            </div>
                                                            {movement.unit_cost && (
                                                                <div className="text-xs text-gray-500">
                                                                    @${movement.unit_cost}/unit
                                                                </div>
                                                            )}
                                                        </TableCell>

                                                        {/* Status */}
                                                        <TableCell>
                                                            <Badge 
                                                                variant="secondary"
                                                                className={`${StatusColors[movement.status]} border-0`}
                                                            >
                                                                {StatusLabels[movement.status]}
                                                            </Badge>
                                                        </TableCell>

                                                        {/* Date */}
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <div className="text-sm font-medium">
                                                                    {formatDate(movement.created_at)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {movement.user?.name || 'System'}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Actions */}
                                                        <TableCell>
                                                            <div className="flex justify-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => router.visit(route('admin.stock-movements.show', movement.id))}
                                                                >
                                                                    <View className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        
                                        {/* Pagination */}
                                        <div className="px-6 py-4 border-t">
                                            <CustomPagination data={movements} />
                                        </div>
                                    </div>
                                ) : (
                                    <Empty className="py-12">
                                        <EmptyMedia>
                                            <PackageOpen className="w-14 h-14 text-gray-300" />
                                        </EmptyMedia>
                                        <EmptyHeader>
                                            <EmptyTitle>No Stock Movements Found</EmptyTitle>
                                            <EmptyDescription>
                                                Stock movements will appear here as inventory transactions occur.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <div className="text-sm text-gray-500 mt-4">
                                                <p className="font-medium mb-2">Movements are automatically generated when:</p>
                                                <ul className="text-left space-y-1">
                                                    <li>• Stock adjustments are made</li>
                                                    <li>• Stock transfers are completed</li>
                                                    <li>• Purchase orders are received</li>
                                                    <li>• Sales orders are fulfilled</li>
                                                </ul>
                                            </div>
                                        </EmptyContent>
                                    </Empty>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default StockMovementsIndex;