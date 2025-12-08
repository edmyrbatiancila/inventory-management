import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageProps, PaginatedResponse } from '@/types';
import {
    Building2,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Calendar,
    DollarSign,
    Star,
    ChevronDown,
    MoreVertical,
    Download,
    Upload,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { toast } from 'sonner';
import { Supplier, SupplierConstants, SupplierFilters } from '@/types/Suppliers/ISuppliers';
import { renderPerformanceRating } from '@/hooks/supplier/render-perf-rating';
import CustomPagination from '@/Components/CustomPagination';


interface SupplierIndexProps {
    suppliers: PaginatedResponse<Supplier>;
    filters: SupplierFilters;
    constants: SupplierConstants;
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        viewAny: boolean;
    };
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
        error?: string;
    };
};

// Advanced Search Hook
const useAdvancedSearch = (initialFilters: SupplierFilters) => {
    const [advancedFilters, setAdvancedFilters] = useState({
        company_name: initialFilters.search || '',
        status: initialFilters.status || 'all',
        type: initialFilters.type || 'all',
        country: initialFilters.country || 'all',
        min_rating: initialFilters.min_rating || 'all',
        payment_terms: 'all',
        has_active_orders: 'all',
        created_from: '',
        created_to: ''
    });

    const updateFilter = (key: string, value: string) => {
        setAdvancedFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetAdvancedFilters = () => {
        setAdvancedFilters({
            company_name: '',
            status: 'all',
            type: 'all',
            country: 'all',
            min_rating: 'all',
            payment_terms: 'all',
            has_active_orders: 'all',
            created_from: '',
            created_to: ''
        });
    };

    return { advancedFilters, updateFilter, resetAdvancedFilters };
};

const SuppliersIndex = ({
    suppliers,
    filters,
    constants,
    can
}: SupplierIndexProps) => {
    const { props } = usePage<InertiaPageProps>();
    
    // State management
    const [search, setSearch] = useState<string>(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState<string>(filters.type || 'all');
    const [countryFilter, setCountryFilter] = useState<string>(filters.country || 'all');
    const [minRatingFilter, setMinRatingFilter] = useState<string>(filters.min_rating || 'all');
    const [sortBy, setSortBy] = useState<string>('company_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    const [confirmationDialog, setConfirmationDialog] = useState<{
        isOpen: boolean;
        type: 'delete' | 'activate' | 'deactivate';
        supplier: Supplier | null;
        isProcessing: boolean;
    }>({
        isOpen: false,
        type: 'delete',
        supplier: null,
        isProcessing: false
    });

    // Advanced Search hook
    const { advancedFilters, updateFilter, resetAdvancedFilters } = useAdvancedSearch(filters);

    // Status configuration
    const statusConfig = {
        active: { icon: CheckCircle2, color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
        inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' },
        pending_approval: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50' },
        blacklisted: { icon: AlertCircle, color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50' }
    };

    // Filter handling
    const handleSearch = () => {
        router.get(route('admin.suppliers.index'), {
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            country: countryFilter || undefined,
            min_rating: minRatingFilter || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAdvancedSearch = () => {
        const queryParams = Object.entries(advancedFilters).reduce((acc, [key, value]) => {
            if (value && value !== 'all') {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, string>);

        router.get(route('admin.suppliers.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowAdvancedSearch(false);
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setTypeFilter('all');
        setCountryFilter('all');
        setMinRatingFilter('all');
        resetAdvancedFilters();
        
        router.get(route('admin.suppliers.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Action handlers
    const handleAction = (type: 'delete' | 'activate' | 'deactivate', supplier: Supplier) => {
        setConfirmationDialog({
            isOpen: true,
            type,
            supplier,
            isProcessing: false
        });
    };

    const executeAction = () => {
        if (!confirmationDialog.supplier) return;

        setConfirmationDialog(prev => ({ ...prev, isProcessing: true }));

        const { type, supplier } = confirmationDialog;
        
        if (type === 'delete') {
            router.delete(route('admin.suppliers.destroy', supplier.id), {
                onSuccess: () => {
                    toast.success('Supplier deleted successfully');
                    setConfirmationDialog({ isOpen: false, type: 'delete', supplier: null, isProcessing: false });
                },
                onError: () => {
                    toast.error('Failed to delete supplier');
                    setConfirmationDialog(prev => ({ ...prev, isProcessing: false }));
                }
            });
        } else if (type === 'activate') {
            router.patch(route('admin.suppliers.update', supplier.id), {
                status: 'active'
            }, {
                onSuccess: () => {
                    toast.success('Supplier activated successfully');
                    setConfirmationDialog({ isOpen: false, type: 'activate', supplier: null, isProcessing: false });
                },
                onError: () => {
                    toast.error('Failed to activate supplier');
                    setConfirmationDialog(prev => ({ ...prev, isProcessing: false }));
                }
            });
        } else if (type === 'deactivate') {
            router.patch(route('admin.suppliers.update', supplier.id), {
                status: 'inactive'
            }, {
                onSuccess: () => {
                    toast.success('Supplier deactivated successfully');
                    setConfirmationDialog({ isOpen: false, type: 'deactivate', supplier: null, isProcessing: false });
                },
                onError: () => {
                    toast.error('Failed to deactivate supplier');
                    setConfirmationDialog(prev => ({ ...prev, isProcessing: false }));
                }
            });
        }
    };

    // Sorting
    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
        return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    };

    // Helper functions
    const getCountries = () => {
        const countries = [...new Set(supplierArray.map(s => s.address.country))].sort();
        return countries;
    };

    const getStatusBadge = (supplier: Supplier) => {
        const config = statusConfig[supplier.status as keyof typeof statusConfig];
        const IconComponent = config?.icon || AlertCircle;
        
        return (
            <Badge className={`${supplier.status_badge_color} flex items-center gap-1`}>
                <IconComponent className="w-3 h-3" />
                {supplier.status_label}
            </Badge>
        );
    };

    // Sort suppliers - handle both array and Laravel Resource Collection formats
    const supplierArray = Array.isArray(suppliers) 
        ? suppliers 
        : (suppliers && typeof suppliers === 'object' && 'data' in suppliers && Array.isArray(suppliers.data))
            ? suppliers.data 
            : [];
    const sortedSuppliers = [...supplierArray].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'company_name':
                aValue = a.company_name.toLowerCase();
                bValue = b.company_name.toLowerCase();
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'type':
                aValue = a.supplier_type;
                bValue = b.supplier_type;
                break;
            case 'rating':
                aValue = a.performance_metrics.overall_rating;
                bValue = b.performance_metrics.overall_rating;
                break;
            case 'orders':
                aValue = a.performance_metrics.total_orders;
                bValue = b.performance_metrics.total_orders;
                break;
            case 'created_at':
                aValue = new Date(a.timestamps.created_at).getTime();
                bValue = new Date(b.timestamps.created_at).getTime();
                break;
            default:
                aValue = a.company_name.toLowerCase();
                bValue = b.company_name.toLowerCase();
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
    });

    return (
        <AuthenticatedLayout
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight">
                                    Supplier Management
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage your supplier relationships and vendor information
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
                                    onClick={() => router.get(route('admin.suppliers.create'))}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Supplier
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            }
        >
            <Head title="Supplier Management" />

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

                    {/* Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{supplierArray.length}</div>
                                </CardContent>
                            </Card>
                        
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {supplierArray.filter(s => s.status === 'active').length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {supplierArray.filter(s => s.status === 'pending_approval').length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                                    <Star className="h-4 w-4 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {supplierArray.length > 0
                                            ? (supplierArray.reduce((sum, s) => sum + s.performance_metrics.overall_rating, 0) / supplierArray.length).toFixed(1)
                                            : '0.0'
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Search & Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Basic Search */}
                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            placeholder="Search suppliers by company name, contact person, or email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSearch} className="gap-2">
                                        <Search className="h-4 w-4" />
                                        Search
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                        className="gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Advanced
                                        <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div className="flex flex-wrap gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {Object.entries(constants.statuses).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {Object.entries(constants.supplier_types).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {getCountries().length > 0 && (
                                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="All Countries" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Countries</SelectItem>
                                            {getCountries().map((country) => (
                                                <SelectItem key={country} value={country}>{country}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Button variant="ghost" onClick={resetFilters} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </div>

                            {/* Advanced Search Panel */}
                            <AnimatePresence>
                                {showAdvancedSearch && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t pt-4"
                                    >
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Company Name</label>
                                                <Input
                                                    value={advancedFilters.company_name}
                                                    onChange={(e) => updateFilter('company_name', e.target.value)}
                                                    placeholder="Enter company name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Country</label>
                                                <Input
                                                    value={advancedFilters.country}
                                                    onChange={(e) => updateFilter('country', e.target.value)}
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Minimum Rating</label>
                                                <Select 
                                                    value={advancedFilters.min_rating} 
                                                    onValueChange={(value) => updateFilter('min_rating', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Any rating" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Any rating</SelectItem>
                                                        <SelectItem value="4">4+ Stars</SelectItem>
                                                        <SelectItem value="3">3+ Stars</SelectItem>
                                                        <SelectItem value="2">2+ Stars</SelectItem>
                                                        <SelectItem value="1">1+ Stars</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={handleAdvancedSearch} className="gap-2">
                                                <Search className="h-4 w-4" />
                                                Apply Filters
                                            </Button>
                                            <Button variant="outline" onClick={resetAdvancedFilters}>
                                                Clear Advanced
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Suppliers Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Suppliers Directory</CardTitle>
                                <CardDescription>
                                    Showing {sortedSuppliers.length} supplier{sortedSuppliers.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Import
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead 
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('company_name')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Company {getSortIcon('company_name')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('type')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Type {getSortIcon('type')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Status {getSortIcon('status')}
                                                </div>
                                            </TableHead>
                                            <TableHead>Contact Info</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead 
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('rating')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Rating {getSortIcon('rating')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('orders')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Orders {getSortIcon('orders')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer select-none"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Created {getSortIcon('created_at')}
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {sortedSuppliers.map((supplier, index) => (
                                                <motion.tr
                                                    key={supplier.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="group hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                >
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{supplier.display_name}</div>
                                                            <div className="text-sm text-gray-500">{supplier.supplier_code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {supplier.supplier_type_label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(supplier)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {supplier.contact_info.contact_person && (
                                                                <div className="text-sm">{supplier.contact_info.contact_person}</div>
                                                            )}
                                                            {supplier.contact_info.email && (
                                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                    <Mail className="w-3 h-3" />
                                                                    {supplier.contact_info.email}
                                                                </div>
                                                            )}
                                                            {supplier.contact_info.phone && (
                                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                    <Phone className="w-3 h-3" />
                                                                    {supplier.contact_info.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-start gap-1 text-sm">
                                                            <MapPin className="w-3 h-3 mt-0.5 text-gray-400" />
                                                            <div>
                                                                <div>{supplier.address.city}</div>
                                                                <div className="text-gray-500">{supplier.address.country}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderPerformanceRating(supplier.performance_metrics.overall_rating)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <div className="font-medium">{supplier.performance_metrics.total_orders}</div>
                                                            <div className="text-gray-500">orders</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(supplier.timestamps.created_at).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <Link 
                                                                        href={route('admin.suppliers.show', supplier.id)}
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {supplier.permissions.can_edit && (
                                                                    <DropdownMenuItem asChild>
                                                                        <Link 
                                                                            href={route('admin.suppliers.edit', supplier.id)}
                                                                            className="flex items-center gap-2 cursor-pointer"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                            Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {supplier.status === 'active' ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleAction('deactivate', supplier)}
                                                                        className="flex items-center gap-2 cursor-pointer text-yellow-600"
                                                                    >
                                                                        <Clock className="w-4 h-4" />
                                                                        Deactivate
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleAction('activate', supplier)}
                                                                        className="flex items-center gap-2 cursor-pointer text-green-600"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Activate
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {supplier.permissions.can_delete && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleAction('delete', supplier)}
                                                                            className="flex items-center gap-2 cursor-pointer text-red-600"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>

                                {sortedSuppliers.length === 0 && (
                                    <div className="text-center py-12">
                                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {Object.values(filters).some(v => v) 
                                                ? 'Try adjusting your search criteria'
                                                : 'Get started by adding your first supplier'
                                            }
                                        </p>
                                        {can.create && !Object.values(filters).some(v => v) && (
                                            <Button asChild className="mt-4">
                                                <Link href={route('admin.suppliers.create')}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Supplier
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                                <div className="mt-6">
                                    <CustomPagination data={ suppliers } />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
            </motion.div>

            {/* Confirmation Dialog */}
            <AlertDialog 
                open={confirmationDialog.isOpen} 
                onOpenChange={(open) => !open && setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmationDialog.type === 'delete' && 'Delete Supplier'}
                            {confirmationDialog.type === 'activate' && 'Activate Supplier'}
                            {confirmationDialog.type === 'deactivate' && 'Deactivate Supplier'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmationDialog.type === 'delete' && (
                                <>
                                    Are you sure you want to delete <strong>{confirmationDialog.supplier?.display_name}</strong>? 
                                    This action cannot be undone and will remove all associated data.
                                </>
                            )}
                            {confirmationDialog.type === 'activate' && (
                                <>
                                    Are you sure you want to activate <strong>{confirmationDialog.supplier?.display_name}</strong>? 
                                    This supplier will be able to receive new orders.
                                </>
                            )}
                            {confirmationDialog.type === 'deactivate' && (
                                <>
                                    Are you sure you want to deactivate <strong>{confirmationDialog.supplier?.display_name}</strong>? 
                                    This supplier will not be able to receive new orders.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={confirmationDialog.isProcessing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeAction}
                            disabled={confirmationDialog.isProcessing}
                            className={
                                confirmationDialog.type === 'delete' 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : confirmationDialog.type === 'activate'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-yellow-600 hover:bg-yellow-700'
                            }
                        >
                            {confirmationDialog.isProcessing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {confirmationDialog.type === 'delete' && 'Delete Supplier'}
                                    {confirmationDialog.type === 'activate' && 'Activate Supplier'}
                                    {confirmationDialog.type === 'deactivate' && 'Deactivate Supplier'}
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
};

export default SuppliersIndex;