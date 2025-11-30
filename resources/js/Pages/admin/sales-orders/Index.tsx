import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PaginatedResponse, PageProps } from "@/types";
import { SalesOrder, SalesOrderFilters, StatusSO, PrioritySO, PaymentStatusSO } from "@/types/SalesOrders/ISalesOrder";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Store, 
    Plus, 
    Search, 
    Filter, 
    Download, 
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    FileText,
    Truck,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    ChevronUp,
    ChevronDown,
    X,
    SlidersHorizontal,
    Calendar,
    ShoppingBasket
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/ui/collapsible";
import { Separator } from "@/Components/ui/separator";
import { Label } from "@/Components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CustomPagination from "@/Components/CustomPagination";

// Types and Interfaces
interface ISalesOrderIndexProps {
    sales_orders: PaginatedResponse<SalesOrder>;
    warehouses: Warehouse[];
    filters: SalesOrderFilters;
    statuses: Record<StatusSO, string>;
    payment_statuses: Record<PaymentStatusSO, string>;
    priorities: Record<PrioritySO, string>;
    can: {
        create: boolean;
        viewAny: boolean;
    };
    hasAdvancedFilters?: boolean;
    users?: User[];
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
        error?: string;
    };
};

// Advanced Search Components and Hooks
const useAdvancedSearch = (initialFilters: SalesOrderFilters) => {
    const [advancedFilters, setAdvancedFilters] = useState({
        customer_name: initialFilters.customer_name || '',
        warehouse_id: initialFilters.warehouse_id?.toString() || 'all',
        payment_status: initialFilters.payment_status || 'all',
        created_from: '',
        created_to: '',
        total_amount_min: '',
        total_amount_max: ''
    });

    const updateFilter = (key: string, value: string) => {
        setAdvancedFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetAdvancedFilters = () => {
        setAdvancedFilters({
            customer_name: '',
            warehouse_id: 'all',
            payment_status: 'all',
            created_from: '',
            created_to: '',
            total_amount_min: '',
            total_amount_max: ''
        });
    };

    return { advancedFilters, updateFilter, resetAdvancedFilters };
};

const SalesOrderIndex = ({
    sales_orders,
    warehouses,
    filters,
    statuses,
    payment_statuses,
    priorities,
    can,
    hasAdvancedFilters = false,
    users = []
}: ISalesOrderIndexProps) => {
    const { props } = usePage<InertiaPageProps>();
    
    const [search, setSearch] = useState<string>(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState<string>(filters.priority || 'all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>(filters.payment_status || 'all');
    const [warehouseFilter, setWarehouseFilter] = useState<string>(filters.warehouse_id?.toString() || 'all');
    const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sort_order || 'desc');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
    const [confirmationDialog, setConfirmationDialog] = useState<{
        isOpen: boolean; 
        type: 'delete' | 'cancel' | 'approve' | 'ship' | 'fulfill'; 
        so: SalesOrder | null;
        isProcessing: boolean;
    }>({
        isOpen: false,
        type: 'delete',
        so: null,
        isProcessing: false
    });
    
    // Advanced Search hook - get initial filters from URL parameters
    const { advancedFilters, updateFilter, resetAdvancedFilters } = useAdvancedSearch(filters);

    // Status configuration with colors and icons
    const statusConfig = useMemo(() => ({
        draft: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FileText, label: 'Draft' },
        pending_approval: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending Approval' },
        approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Approved' },
        confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Confirmed' },
        partially_fulfilled: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package, label: 'Partially Fulfilled' },
        fully_fulfilled: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Package, label: 'Fully Fulfilled' },
        shipped: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck, label: 'Shipped' },
        delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Delivered' },
        cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Cancelled' },
        closed: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FileText, label: 'Closed' },
    }), []);

    const paymentStatusConfig = useMemo(() => ({
        pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
        partial: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Partial' },
        paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
        overdue: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Overdue' },
        cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled' },
    }), []);

    const priorityConfig = useMemo(() => ({
        low: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Low' },
        normal: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Normal' },
        high: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'High' },
        urgent: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Urgent' },
    }), []);

    // Filter and search functions
    const applyFilters = useCallback(() => {
        const filterParams: any = {};
        
        if (search) filterParams.search = search;
        if (statusFilter !== 'all') filterParams.status = statusFilter;
        if (priorityFilter !== 'all') filterParams.priority = priorityFilter;
        if (paymentStatusFilter !== 'all') filterParams.payment_status = paymentStatusFilter;
        if (warehouseFilter !== 'all') filterParams.warehouse_id = warehouseFilter;
        if (advancedFilters.customer_name) filterParams.customer_name = advancedFilters.customer_name;
        if (sortBy) filterParams.sort_by = sortBy;
        if (sortOrder) filterParams.sort_order = sortOrder;

        router.get(route('admin.sales-orders.index'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [search, statusFilter, priorityFilter, paymentStatusFilter, warehouseFilter, advancedFilters, sortBy, sortOrder]);

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setPaymentStatusFilter('all');
        setWarehouseFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');
        resetAdvancedFilters();
        router.get(route('admin.sales-orders.index'));
    };

    // Action handlers
    const handleSort = (column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
    };

    const handleView = (so: SalesOrder) => {
        router.get(route('admin.sales-orders.show', so.id));
    };

    const handleEdit = (so: SalesOrder) => {
        router.get(route('admin.sales-orders.edit', so.id));
    };

    const handleDelete = (so: SalesOrder) => {
        setConfirmationDialog({
            isOpen: true,
            type: 'delete',
            so,
            isProcessing: false
        });
    };

    const handleApprove = (so: SalesOrder) => {
        setConfirmationDialog({
            isOpen: true,
            type: 'approve',
            so,
            isProcessing: false
        });
    };

    const confirmAction = () => {
        if (!confirmationDialog.so) return;

        setConfirmationDialog(prev => ({ ...prev, isProcessing: true }));

        const routeMap = {
            delete: 'admin.sales-orders.destroy',
            approve: 'admin.sales-orders.approve',
            cancel: 'admin.sales-orders.cancel',
            ship: 'admin.sales-orders.ship',
            fulfill: 'admin.sales-orders.fulfill'
        };

        const route_name = routeMap[confirmationDialog.type];
        const method = confirmationDialog.type === 'delete' ? 'delete' : 'patch';

        router.visit(route(route_name, confirmationDialog.so.id), {
            method,
            onSuccess: () => {
                toast.success(`Sales order ${confirmationDialog.type}d successfully!`);
                setConfirmationDialog({ isOpen: false, type: 'delete', so: null, isProcessing: false });
            },
            onError: () => {
                toast.error(`Failed to ${confirmationDialog.type} sales order.`);
                setConfirmationDialog(prev => ({ ...prev, isProcessing: false }));
            }
        });
    };

    // Helper functions
    const getActionButtons = (so: SalesOrder) => {
        const buttons: Array<{
            icon: React.ComponentType<any>;
            label: string;
            onClick: () => void;
            variant: 'ghost';
            className?: string;
        }> = [
            {
                icon: Eye,
                label: 'View',
                onClick: () => handleView(so),
                variant: 'ghost' as const
            },
        ];

        if (so.status === 'draft' || so.status === 'pending_approval') {
            buttons.push({
                icon: Edit,
                label: 'Edit',
                onClick: () => handleEdit(so),
                variant: 'ghost' as const
            });
        }

        if (so.status === 'pending_approval') {
            buttons.push({
                icon: CheckCircle,
                label: 'Approve',
                onClick: () => handleApprove(so),
                variant: 'ghost' as const
            });
        }

        if (['draft', 'pending_approval', 'approved'].includes(so.status)) {
            buttons.push({
                icon: Trash2,
                label: 'Delete',
                onClick: () => handleDelete(so),
                variant: 'ghost' as const,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
            });
        }

        return buttons;
    };

    const SortableHeader = ({ children, sortKey }: { children: React.ReactNode, sortKey: string }) => (
        <Button
            variant="ghost"
            className="h-auto p-0 font-semibold hover:bg-transparent"
            onClick={() => handleSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {children}
                {sortBy === sortKey && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
            </div>
        </Button>
    );

    return (
        <Authenticated
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ShoppingBasket className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight">
                                    Sales Orders Management
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage and track all your sales orders efficiently
                                </p>
                            </div>
                        </div>

                        {can.create && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Button
                                    onClick={() => router.get(route('admin.sales-orders.create'))}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Sales Order
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            }
        >
            <Head title="Sales Orders Management" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="py-8"
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Flash Messages */}
                    <AnimatePresence>
                        {props.flash?.success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md"
                            >
                                {props.flash.success}
                            </motion.div>
                        )}
                        {props.flash?.error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md"
                            >
                                {props.flash.error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Filters and Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Filter Sales Orders</CardTitle>
                                        <CardDescription>Search and filter sales orders by various criteria</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                        >
                                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                                            Advanced
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetFilters}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Basic Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                    {/* Search Input */}
                                    <div className="lg:col-span-2">
                                        <Label htmlFor="search">Search</Label>
                                        <div className="relative mt-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                id="search"
                                                placeholder="Search by SO number, customer..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-10"
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                            />
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                {Object.entries(statuses).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Priority Filter */}
                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="All Priorities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                {Object.entries(priorities).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Payment Status Filter */}
                                    <div>
                                        <Label htmlFor="payment_status">Payment Status</Label>
                                        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="All Payment Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Payment Status</SelectItem>
                                                {Object.entries(payment_statuses).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Warehouse Filter */}
                                    <div>
                                        <Label htmlFor="warehouse">Warehouse</Label>
                                        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="All Warehouses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Warehouses</SelectItem>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        {warehouse.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Advanced Search Collapsible */}
                                <Collapsible open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
                                    <CollapsibleContent className="space-y-4">
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <Label htmlFor="customer_name">Customer Name</Label>
                                                <Input
                                                    id="customer_name"
                                                    placeholder="Filter by customer name"
                                                    value={advancedFilters.customer_name}
                                                    onChange={(e) => updateFilter('customer_name', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="total_amount_min">Min Amount</Label>
                                                <Input
                                                    id="total_amount_min"
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={advancedFilters.total_amount_min}
                                                    onChange={(e) => updateFilter('total_amount_min', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="total_amount_max">Max Amount</Label>
                                                <Input
                                                    id="total_amount_max"
                                                    type="number"
                                                    placeholder="10000.00"
                                                    value={advancedFilters.total_amount_max}
                                                    onChange={(e) => updateFilter('total_amount_max', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="created_from">Date From</Label>
                                                <Input
                                                    id="created_from"
                                                    type="date"
                                                    value={advancedFilters.created_from}
                                                    onChange={(e) => updateFilter('created_from', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Apply Filters Button */}
                                <div className="flex justify-end">
                                    <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sales Orders Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Sales Orders ({sales_orders.total})
                                        </CardTitle>
                                        <CardDescription>
                                            Showing {sales_orders.from}-{sales_orders.to} of {sales_orders.total} sales orders
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold">
                                                    <SortableHeader sortKey="so_number">SO Number</SortableHeader>
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    <SortableHeader sortKey="customer_name">Customer</SortableHeader>
                                                </TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Payment</TableHead>
                                                <TableHead className="font-semibold">Priority</TableHead>
                                                <TableHead className="font-semibold">
                                                    <SortableHeader sortKey="total_amount">Total Amount</SortableHeader>
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    <SortableHeader sortKey="created_at">Created Date</SortableHeader>
                                                </TableHead>
                                                <TableHead className="font-semibold">Warehouse</TableHead>
                                                <TableHead className="text-right font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {sales_orders.data.length > 0 ? (
                                                    sales_orders.data.map((so, index) => {
                                                        const StatusIcon = statusConfig[so.status]?.icon || FileText;
                                                        return (
                                                            <motion.tr
                                                                key={so.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="border-b hover:bg-gray-50 transition-colors"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                                        {so.so_number}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div>
                                                                        <div className="font-medium">{so.customer_name}</div>
                                                                        {so.customer_email && (
                                                                            <div className="text-sm text-gray-500">{so.customer_email}</div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "inline-flex items-center gap-1 border",
                                                                            statusConfig[so.status]?.color
                                                                        )}
                                                                    >
                                                                        <StatusIcon className="h-3 w-3" />
                                                                        {statusConfig[so.status]?.label || so.status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "border",
                                                                            paymentStatusConfig[so.payment_status]?.color
                                                                        )}
                                                                    >
                                                                        {paymentStatusConfig[so.payment_status]?.label || so.payment_status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "border",
                                                                            priorityConfig[so.priority]?.color
                                                                        )}
                                                                    >
                                                                        {priorityConfig[so.priority]?.label || so.priority}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {so.currency} {so.formatted_total_amount || (so.total_amount ? Number(so.total_amount).toFixed(2) : '0.00')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm">
                                                                        {new Date(so.created_at).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {new Date(so.created_at).toLocaleTimeString()}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-sm font-medium">
                                                                        {so.warehouse?.name || 'N/A'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-48">
                                                                            {getActionButtons(so).map((action, i) => {
                                                                                const Icon = action.icon;
                                                                                return (
                                                                                    <DropdownMenuItem
                                                                                        key={i}
                                                                                        onClick={action.onClick}
                                                                                        className={action.className || ''}
                                                                                    >
                                                                                        <Icon className="h-4 w-4 mr-2" />
                                                                                        {action.label}
                                                                                    </DropdownMenuItem>
                                                                                );
                                                                            })}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </motion.tr>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Store className="h-8 w-8 text-gray-400" />
                                                                <p className="text-gray-500">No sales orders found</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                    <div className="mt-6">
                                        <CustomPagination data={ sales_orders } />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmationDialog.isOpen} onOpenChange={(open) => 
                !confirmationDialog.isProcessing && setConfirmationDialog(prev => ({ ...prev, isOpen: open }))
            }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm {confirmationDialog.type}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {confirmationDialog.type} sales order{' '}
                            <span className="font-medium">{confirmationDialog.so?.so_number}</span>?
                            {confirmationDialog.type === 'delete' && ' This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
                            disabled={confirmationDialog.isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAction}
                            disabled={confirmationDialog.isProcessing}
                            className={cn(
                                confirmationDialog.type === 'delete' 
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            )}
                        >
                            {confirmationDialog.isProcessing ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Authenticated>
    );
};

export default SalesOrderIndex;