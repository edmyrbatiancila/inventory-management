import { useState, useRef, useEffect } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { motion } from "framer-motion";
import { 
    PackagePlus, 
    Search, 
    Filter, 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    CheckCircle,
    Send,
    X,
    AlertCircle,
    Clock,
    ArrowUpDown,
    Download,
    FileText,
    Building,
    Calendar,
    DollarSign,
    Badge,
    MoreHorizontal,
    SlidersHorizontal,
    User,
    Phone,
    Mail
} from "lucide-react";

// Advanced Search Components and Hooks
import PurchaseOrderAdvancedSearchDialog from "@/Components/admin/purchase-orders/PurchaseOrderAdvancedSearchDialog";
import { usePurchaseOrderAdvancedSearch } from "@/hooks/usePurchaseOrderAdvancedSearch";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge as UIBadge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { cn } from "@/lib/utils";
import { PaginatedResponse, PageProps } from "@/types";

// Types
interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_name: string;
    supplier_email?: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_contact_person?: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'sent_to_supplier' | 'partially_received' | 'fully_received' | 'cancelled' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    warehouse: {
        id: number;
        name: string;
        code: string;
    };
    created_by: {
        id: number;
        name: string;
    };
    approved_by?: {
        id: number;
        name: string;
    };
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    expected_delivery_date?: string;
    created_at: string;
    updated_at: string;
    approved_at?: string;
    sent_at?: string;
    received_at?: string;
    cancelled_at?: string;
    notes?: string;
    terms_and_conditions?: string;
    cancellation_reason?: string;
    items_count: number;
    status_label: string;
    priority_label: string;
    status_color: string;
    priority_color: string;
    formatted_total_amount: string;
    days_until_delivery?: number;
    is_overdue: boolean;
}

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

interface PurchaseOrderFilters {
    search?: string;
    status?: string;
    priority?: string;
    warehouse_id?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

interface IPurchaseOrderIndexProps {
    purchase_orders: PaginatedResponse<PurchaseOrder>;
    warehouses: Warehouse[];
    filters: PurchaseOrderFilters;
    can: {
        create: boolean;
        viewAny: boolean;
    };
    hasAdvancedFilters?: boolean;
    users?: Array<{
        id: number;
        name: string;
    }>;
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
        error?: string;
    };
};

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    sent_to_supplier: { label: 'Sent to Supplier', color: 'bg-blue-100 text-blue-800', icon: Send },
    partially_received: { label: 'Partially Received', color: 'bg-orange-100 text-orange-800', icon: PackagePlus },
    fully_received: { label: 'Fully Received', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-800', icon: CheckCircle },
};

const priorityConfig = {
    low: { label: 'Low', color: 'bg-green-100 text-green-700' },
    normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

const PurchaseOrderIndex = ({
    purchase_orders,
    warehouses,
    filters,
    can,
    hasAdvancedFilters = false,
    users = []
}: IPurchaseOrderIndexProps) => {
    const { props } = usePage<InertiaPageProps>();
    
    const [search, setSearch] = useState<string>(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState<string>(filters.priority || 'all');
    const [warehouseFilter, setWarehouseFilter] = useState<string>(filters.warehouse_id?.toString() || 'all');
    const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(filters.sort_order || 'desc');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
    
    // Advanced Search hook - get initial filters from URL parameters
    const getInitialAdvancedFilters = () => {
        const params = new URLSearchParams(window.location.search);
        const advancedFilters: any = {};
        
        // Extract filters from URL params
        if (params.get('search')) advancedFilters.search = params.get('search');
        if (params.get('status')) advancedFilters.status = params.get('status');
        if (params.get('priority')) advancedFilters.priority = params.get('priority');
        if (params.get('warehouse_id')) advancedFilters.warehouse_id = parseInt(params.get('warehouse_id')!);
        if (params.get('supplier_name')) advancedFilters.supplier_name = params.get('supplier_name');
        if (params.get('po_number')) advancedFilters.po_number = params.get('po_number');
        if (params.get('total_amount_min')) advancedFilters.total_amount_min = parseFloat(params.get('total_amount_min')!);
        if (params.get('total_amount_max')) advancedFilters.total_amount_max = parseFloat(params.get('total_amount_max')!);
        if (params.get('created_date_from')) advancedFilters.created_date_from = params.get('created_date_from');
        if (params.get('created_date_to')) advancedFilters.created_date_to = params.get('created_date_to');
        if (params.get('expected_delivery_from')) advancedFilters.expected_delivery_from = params.get('expected_delivery_from');
        if (params.get('expected_delivery_to')) advancedFilters.expected_delivery_to = params.get('expected_delivery_to');
        if (params.get('created_by')) advancedFilters.created_by = parseInt(params.get('created_by')!);
        if (params.get('approved_by')) advancedFilters.approved_by = parseInt(params.get('approved_by')!);

        return advancedFilters;
    };

    const { 
        filters: advancedFilters,
        savedFilters,
        isSearching: isAdvancedSearching,
        applySearch,
        removeFilter,
        clearAllFilters,
        saveFilter,
        loadSavedFilter,
        deleteSavedFilter,
        hasActiveFilters,
    } = usePurchaseOrderAdvancedSearch({
        currentRoute: route('admin.purchase-orders.index'),
        initialFilters: getInitialAdvancedFilters(),
    });

    const handleAdvancedSearch = (filters: any) => {
        applySearch(filters);
    };
    
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    // Handle search with debounce
    const handleSearch = (searchTerm: string) => {
        setIsSearching(true);
        
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const params = {
                search: searchTerm || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                warehouse_id: warehouseFilter !== 'all' ? parseInt(warehouseFilter) : undefined,
                sort_by: sortBy,
                sort_order: sortOrder,
            };

            router.get(route('admin.purchase-orders.index'), params, {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            });
        }, 500);
    };

    // Handle filter changes
    const applyFilters = (newFilters: Partial<PurchaseOrderFilters>) => {
        const params = {
            search: search || undefined,
            status: newFilters.status !== 'all' ? newFilters.status : undefined,
            priority: newFilters.priority !== 'all' ? newFilters.priority : undefined,
            warehouse_id: newFilters.warehouse_id !== undefined && newFilters.warehouse_id.toString() !== 'all' 
                ? newFilters.warehouse_id : undefined,
            sort_by: newFilters.sort_by || sortBy,
            sort_order: newFilters.sort_order || sortOrder,
        };

        router.get(route('admin.purchase-orders.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle sorting
    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
        setSortBy(column);
        setSortOrder(newSortOrder);
        applyFilters({ sort_by: column, sort_order: newSortOrder });
    };

    // Handle actions
    const handleCreate = () => {
        router.get(route('admin.purchase-orders.create'));
    };

    const handleView = (id: number) => {
        router.get(route('admin.purchase-orders.show', id));
    };

    const handleEdit = (id: number) => {
        router.get(route('admin.purchase-orders.edit', id));
    };

    const handleDelete = (id: number, poNumber: string) => {
        if (confirm(`Are you sure you want to delete Purchase Order ${poNumber}? This action cannot be undone.`)) {
            router.delete(route('admin.purchase-orders.destroy', id), {
                onSuccess: () => {
                    console.log("Purchase order deleted successfully.");
                },
                onError: () => {
                    console.error("Failed to delete purchase order.");
                }
            });
        }
    };

    const handleApprove = (id: number) => {
        router.post(route('admin.purchase-orders.approve', id), {}, {
            onSuccess: () => {
                console.log("Purchase order approved successfully.");
            }
        });
    };

    const handleSendToSupplier = (id: number) => {
        router.post(route('admin.purchase-orders.send-to-supplier', id), {}, {
            onSuccess: () => {
                console.log("Purchase order sent to supplier successfully.");
            }
        });
    };

    const handleCancel = (id: number) => {
        const reason = prompt('Please provide a reason for cancellation:');
        if (reason) {
            router.post(route('admin.purchase-orders.cancel', id), { reason }, {
                onSuccess: () => {
                    console.log("Purchase order cancelled successfully.");
                }
            });
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Get status badge component
    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || FileText;
        
        return (
            <UIBadge className={cn("flex items-center gap-1", config?.color)}>
                <Icon className="w-3 h-3" />
                {config?.label || status}
            </UIBadge>
        );
    };

    // Get priority badge component
    const getPriorityBadge = (priority: string) => {
        const config = priorityConfig[priority as keyof typeof priorityConfig];
        
        return (
            <UIBadge variant="outline" className={cn("text-xs", config?.color)}>
                {config?.label || priority}
            </UIBadge>
        );
    };

    // Show flash messages
    useEffect(() => {
        if (props.flash?.success) {
            console.log("Success:", props.flash.success);
        }
        if (props.flash?.error) {
            console.error("Error:", props.flash.error);
        }
    }, [props.flash]);

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
                                <PackagePlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight">
                                    Purchase Orders Management
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage purchase orders and supplier relationships
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
                                    onClick={handleCreate}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Purchase Order
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            }
        >
            <Head title="Purchase Orders Management" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="py-8"
            >
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Summary Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{purchase_orders.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <PackagePlus className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {purchase_orders.data.filter(po => po.status === 'pending_approval').length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">In Progress</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {purchase_orders.data.filter(po => ['approved', 'sent_to_supplier', 'partially_received'].includes(po.status)).length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Send className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {purchase_orders.data.filter(po => po.status === 'fully_received').length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Search and Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    Search & Filter
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Search Input */}
                                    <div className="lg:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search by PO number, supplier..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    handleSearch(e.target.value);
                                                }}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => {
                                            setStatusFilter(value);
                                            applyFilters({ status: value });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="sent_to_supplier">Sent to Supplier</SelectItem>
                                            <SelectItem value="partially_received">Partially Received</SelectItem>
                                            <SelectItem value="fully_received">Fully Received</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Priority Filter */}
                                    <Select
                                        value={priorityFilter}
                                        onValueChange={(value) => {
                                            setPriorityFilter(value);
                                            applyFilters({ priority: value });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priorities</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Warehouse Filter */}
                                    <Select
                                        value={warehouseFilter}
                                        onValueChange={(value) => {
                                            setWarehouseFilter(value);
                                            applyFilters({ 
                                                warehouse_id: value !== 'all' ? parseInt(value) : undefined 
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Warehouses</SelectItem>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name} ({warehouse.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Advanced Search & Quick Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAdvancedSearch(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <SlidersHorizontal className="w-4 h-4" />
                                            Advanced Search
                                            {hasActiveFilters() && (
                                                <UIBadge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                                                    {Object.keys(advancedFilters).filter(key => advancedFilters[key as keyof typeof advancedFilters]).length}
                                                </UIBadge>
                                            )}
                                        </Button>
                                        {hasActiveFilters() && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearAllFilters}
                                                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                                Clear All
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {can.create && (
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                            <Link href={route('admin.purchase-orders.create')}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Purchase Order
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                {/* Active Filters Display */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {(statusFilter !== 'all' || priorityFilter !== 'all' || warehouseFilter !== 'all' || search) && (
                                        <div className="flex flex-wrap gap-2">
                                            {search && (
                                                <UIBadge variant="secondary" className="flex items-center gap-1">
                                                    Search: "{search}"
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer" 
                                                        onClick={() => {
                                                            setSearch('');
                                                            handleSearch('');
                                                        }}
                                                    />
                                                </UIBadge>
                                            )}
                                            {statusFilter !== 'all' && (
                                                <UIBadge variant="secondary" className="flex items-center gap-1">
                                                    Status: {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer" 
                                                        onClick={() => {
                                                            setStatusFilter('all');
                                                            applyFilters({ status: undefined });
                                                        }}
                                                    />
                                                </UIBadge>
                                            )}
                                            {priorityFilter !== 'all' && (
                                                <UIBadge variant="secondary" className="flex items-center gap-1">
                                                    Priority: {priorityConfig[priorityFilter as keyof typeof priorityConfig]?.label}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer" 
                                                        onClick={() => {
                                                            setPriorityFilter('all');
                                                            applyFilters({ priority: undefined });
                                                        }}
                                                    />
                                                </UIBadge>
                                            )}
                                            {warehouseFilter !== 'all' && (
                                                <UIBadge variant="secondary" className="flex items-center gap-1">
                                                    Warehouse: {warehouses.find(w => w.id.toString() === warehouseFilter)?.name}
                                                    <X 
                                                        className="w-3 h-3 cursor-pointer" 
                                                        onClick={() => {
                                                            setWarehouseFilter('all');
                                                            applyFilters({ warehouse_id: undefined });
                                                        }}
                                                    />
                                                </UIBadge>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 px-2 text-xs"
                                                onClick={() => {
                                                    setSearch('');
                                                    setStatusFilter('all');
                                                    setPriorityFilter('all');
                                                    setWarehouseFilter('all');
                                                    router.get(route('admin.purchase-orders.index'), {}, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                Clear All
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Data Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Purchase Orders ({purchase_orders.total})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('po_number')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        PO Number
                                                        <ArrowUpDown className="w-4 h-4" />
                                                    </div>
                                                </TableHead>
                                                <TableHead>Supplier</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Warehouse</TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('total_amount')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Total Amount
                                                        <ArrowUpDown className="w-4 h-4" />
                                                    </div>
                                                </TableHead>
                                                <TableHead 
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleSort('created_at')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Created
                                                        <ArrowUpDown className="w-4 h-4" />
                                                    </div>
                                                </TableHead>
                                                <TableHead>Expected Delivery</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {purchase_orders.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <PackagePlus className="w-12 h-12 text-gray-300" />
                                                            <p>No purchase orders found</p>
                                                            {can.create && (
                                                                <Button 
                                                                    onClick={handleCreate}
                                                                    variant="outline"
                                                                >
                                                                    <Plus className="w-4 h-4 mr-2" />
                                                                    Create First Purchase Order
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                purchase_orders.data.map((po) => (
                                                    <TableRow key={po.id} className="hover:bg-gray-50/50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span className="text-blue-600 font-semibold">
                                                                    {po.po_number}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    ID: {po.id}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{po.supplier_name}</span>
                                                                <div className="flex flex-col gap-1 mt-1">
                                                                    {po.supplier_contact_person && (
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <User className="w-3 h-3" />
                                                                            {po.supplier_contact_person}
                                                                        </span>
                                                                    )}
                                                                    {po.supplier_phone && (
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <Phone className="w-3 h-3" />
                                                                            {po.supplier_phone}
                                                                        </span>
                                                                    )}
                                                                    {po.supplier_email && (
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <Mail className="w-3 h-3" />
                                                                            {po.supplier_email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                                                        <TableCell>{getPriorityBadge(po.priority)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Building className="w-4 h-4 text-gray-400" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">{po.warehouse.name}</span>
                                                                    <span className="text-xs text-gray-500">{po.warehouse.code}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            {formatCurrency(po.total_amount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Calendar className="w-4 h-4" />
                                                                {formatDate(po.created_at)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {po.expected_delivery_date ? (
                                                                <div className={cn(
                                                                    "flex items-center gap-2 text-sm",
                                                                    po.is_overdue ? "text-red-600" : "text-gray-600"
                                                                )}>
                                                                    <Calendar className="w-4 h-4" />
                                                                    {formatDate(po.expected_delivery_date)}
                                                                    {po.is_overdue && (
                                                                        <UIBadge className="bg-red-100 text-red-800">
                                                                            Overdue
                                                                        </UIBadge>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">Not set</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <UIBadge variant="outline" className="text-xs">
                                                                {po.items_count} items
                                                            </UIBadge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleView(po.id)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    
                                                                    {po.status === 'draft' && (
                                                                        <DropdownMenuItem onClick={() => handleEdit(po.id)}>
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    {po.status === 'pending_approval' && (
                                                                        <DropdownMenuItem onClick={() => handleApprove(po.id)}>
                                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                                            Approve
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    {po.status === 'approved' && (
                                                                        <DropdownMenuItem onClick={() => handleSendToSupplier(po.id)}>
                                                                            <Send className="mr-2 h-4 w-4" />
                                                                            Send to Supplier
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    
                                                                    {['draft', 'pending_approval', 'approved'].includes(po.status) && (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCancel(po.id)}
                                                                                className="text-orange-600"
                                                                            >
                                                                                <X className="mr-2 h-4 w-4" />
                                                                                Cancel
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    
                                                                    {po.status === 'draft' && (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleDelete(po.id, po.po_number)}
                                                                                className="text-red-600"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {purchase_orders.last_page > 1 && (
                                    <div className="flex items-center justify-between px-2 py-4">
                                        <div className="flex-1 text-sm text-gray-700">
                                            Showing {purchase_orders.from} to {purchase_orders.to} of{' '}
                                            {purchase_orders.total} results
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {purchase_orders.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, {}, {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: link.label 
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* Advanced Search Dialog */}
            <PurchaseOrderAdvancedSearchDialog
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={handleAdvancedSearch}
                warehouses={warehouses}
                users={users}
                currentFilters={advancedFilters}
                savedFilters={savedFilters}
                onSaveFilter={saveFilter}
                onLoadFilter={loadSavedFilter}
                onDeleteFilter={deleteSavedFilter}
            />
        </Authenticated>
    );
}

export default PurchaseOrderIndex;