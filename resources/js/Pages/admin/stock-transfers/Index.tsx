import CustomPagination from "@/Components/CustomPagination";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/Components/ui/empty";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { getStatusBadgeColor } from "@/hooks/stock-transfers/statusBadgeColor";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PaginatedResponse } from "@/types";
import { Product } from "@/types/Product/IProduct";
import { StockTransfer } from "@/types/StockTransfer/IStockTransfer";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { formatDate } from "@/utils/date";
import { Head, Link, router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MoreHorizontal, Package, Plus, Split, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface IStockTransfersIndexProps {
    transfers: PaginatedResponse<StockTransfer>;
    sort?: string;
    transferStatus?: string;
    warehouses: Warehouse[];
    products: Product[];
}

const StockTransfersIndex = ({
    transfers,
    sort: initialSort = 'newest',
    transferStatus
}: IStockTransfersIndexProps) => {

    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState(initialSort);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [status, setStatus] = useState(transferStatus || 'all');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        setSearch(value);
        
        setIsSearching(true);
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        debounceRef.current = setTimeout(() => {
            router.get(
                route('admin.stock-transfers.index'), 
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
        setStatus('all');

        router.get(
            route('admin.stock-transfers.index'), 
            {}, 
            { preserveState: true, replace: true }
        );
    };

    // Handle filter/sort change for shadcn UI Select
    const handleSortChange = (value: string) => {
        setSort(value);
    
        router.get(
            route('admin.stock-transfers.index'), 
            { search, sort: value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);

        const statusParam = value === 'all' ? '' : value;

        router.get(route('admin.stock-transfers.index'), 
            { search, sort, status: statusParam }, 
            { preserveState: true, replace: true }
        );
    };

    const handleApprove = async (transferId: number) => {
        if (confirm('Are you sure you want to approve this transfer?')) {
            router.post(route('admin.stock-transfers.approve', transferId), {}, {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Transfer approved successfully');
                }
            });
        }
    };

    const handleCancel = async (transferId: number) => {
        const reason = prompt('Please provide a cancellation reason:');
        if (reason) {
            router.post(route('admin.stock-transfers.cancel', transferId), {
                cancellation_reason: reason
            }, {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Transfer cancelled successfully');
                }
            });
        }
    };

    const handleMarkInTransit = async (transferId: number) => {
        if (confirm('Are you sure you want to mark this transfer as in transit?')) {
            router.patch(route('admin.stock-transfers.mark-in-transit', transferId), {}, {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Transfer marked as in transit successfully');
                }
            });
        }
    };

    const handleComplete = async (transferId: number) => {
        if (confirm('Are you sure you want to complete this transfer?')) {
            router.patch(route('admin.stock-transfers.complete', transferId), {}, {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Transfer completed successfully');
                }
            });
        }
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
                        <Split className="w-7 h-7 text-blue-600" />
                        Stock Transfer Management
                    </h2>
                </motion.div>
            }
        >
            <Head title="Stock Transfers" />
            
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
                                placeholder="Search stock transfers..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full max-w-xs shadow-sm focus:ring-2 focus:ring-blue-200"
                                aria-label="Search stock transfers"
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
                                        <SelectValue placeholder="Filter stock transfers"  />
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
                            <motion.div whileHover={{ scale: 1.03 }}>
                                <Select
                                    value={ status }
                                    onValueChange={ handleStatusChange }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Status</SelectLabel>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>

                        <motion.div whileHover={{ scale: 1.04 }}>
                            <Button
                                onClick={() => router.visit(route('admin.stock-transfers.create'))}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-150"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Stock Transfer
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
                                    Stock Transfers <span className="text-blue-400 font-normal">({ transfers.total })</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence mode="wait">
                                {transfers.data.length > 0 ? (
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
                                                    <TableHead>Transfer Route</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Initiated By</TableHead>
                                                    <TableHead>Date Created</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {transfers.data.map((transfer, idx) => {
                                                const rowNumber = (transfers.current_page - 1) * transfers.per_page + idx + 1;

                                                return (
                                                    <motion.tr
                                                        key={transfer.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                        className="hover:bg-blue-50/60 transition-colors"
                                                    >
                                                        <TableCell className="w-16 font-semibold text-blue-700">
                                                            { rowNumber }
                                                        </TableCell>

                                                        <TableCell className="font-mono text-sm">
                                                            { transfer.reference_number }
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Package className="w-4 h-4 text-blue-500" />
                                                                <div>
                                                                    <div 
                                                                        className="font-medium truncate max-w-[200px]"
                                                                        title={transfer.product.name}
                                                                    >
                                                                        { transfer.product.name }
                                                                    </div>
                                                                    <div
                                                                        className="text-sm text-gray-500 truncate"
                                                                        title={transfer.product.sku}
                                                                    >
                                                                        SKU: { transfer.product.sku }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="text-sm text-gray-900 flex items-center">
                                                                <span
                                                                    className="truncate max-w-20" 
                                                                    title={transfer.from_warehouse.name}
                                                                >
                                                                    { transfer.from_warehouse.name }
                                                                </span>
                                                                <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                                                                <span
                                                                    className="truncate max-w-20"
                                                                    title={transfer.to_warehouse.name}
                                                                >
                                                                    { transfer.to_warehouse.name }
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {transfer.quantity_transferred.toLocaleString()}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(transfer.transfer_status)}`}>
                                                                {transfer.transfer_status}
                                                            </span>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="text-sm text-gray-900">
                                                                {transfer.initiated_by.name}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>
                                                                    {formatDate(transfer.initiated_at)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {new Date(transfer.initiated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Link href={route('admin.stock-transfers.show', transfer.id)}>
                                                                            View Details
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    
                                                                    {transfer.transfer_status === 'pending' && (
                                                                        <>
                                                                            <DropdownMenuItem>
                                                                                <Link href={route('admin.stock-transfers.edit', transfer.id)}>
                                                                                    Edit Transfer
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleApprove(transfer.id)}>
                                                                                Approve Transfer
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleCancel(transfer.id)}>
                                                                                Cancel Transfer
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    
                                                                    {transfer.transfer_status === 'approved' && (
                                                                        <DropdownMenuItem onClick={() => handleMarkInTransit(transfer.id)}>
                                                                            Mark In Transit
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    {transfer.transfer_status === 'in_transit' && (
                                                                        <DropdownMenuItem onClick={() => handleComplete(transfer.id)}>
                                                                            Complete Transfer
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </motion.tr>
                                                );
                                            })}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-6">
                                            <CustomPagination data={ transfers } />
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
                                        <Empty className="border border-dashed">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }} 
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                    >
                                                        <Split className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                                                    </motion.div>
                                                </EmptyMedia>
                                                <EmptyTitle>No Stock Transfers Found</EmptyTitle>
                                                <EmptyDescription>
                                                    Get started by creating your first stock transfer.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <motion.div whileHover={{ scale: 1.08 }}>
                                                    <Button
                                                        onClick={() => router.visit(route('admin.stock-transfers.create'))}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Create Stock Transfer
                                                    </Button>
                                                </motion.div>
                                            </EmptyContent>
                                        </Empty>
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

export default StockTransfersIndex;