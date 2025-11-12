import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { 
    Search, 
    Filter, 
    Save, 
    Trash2, 
    Calendar,
    DollarSign,
    Building,
    User,
    FileText,
    X,
    RotateCcw
} from 'lucide-react';
import { PurchaseOrderAdvancedFilters, SavedFilter } from '@/hooks/usePurchaseOrderAdvancedSearch';
import { ScrollArea } from '@/Components/ui/scroll-area';

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
}

interface PurchaseOrderAdvancedSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: PurchaseOrderAdvancedFilters) => void;
    warehouses: Warehouse[];
    users: User[];
    currentFilters: PurchaseOrderAdvancedFilters;
    savedFilters: SavedFilter[];
    onSaveFilter: (name: string) => void;
    onLoadFilter: (filter: SavedFilter) => void;
    onDeleteFilter: (filterId: string) => void;
}

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent_to_supplier', label: 'Sent to Supplier' },
    { value: 'partially_received', label: 'Partially Received' },
    { value: 'fully_received', label: 'Fully Received' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const PurchaseOrderAdvancedSearchDialog: React.FC<PurchaseOrderAdvancedSearchDialogProps> = ({
    isOpen,
    onClose,
    onSearch,
    warehouses,
    users,
    currentFilters,
    savedFilters,
    onSaveFilter,
    onLoadFilter,
    onDeleteFilter,
}) => {
    const [filters, setFilters] = useState<PurchaseOrderAdvancedFilters>(currentFilters);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    const handleFilterChange = (key: keyof PurchaseOrderAdvancedFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        onSearch(filters);
        onClose();
    };

    const handleClear = () => {
        setFilters({});
    };

    const handleSaveFilter = () => {
        if (saveFilterName.trim()) {
            onSaveFilter(saveFilterName);
            setSaveFilterName('');
            setShowSaveForm(false);
        }
    };

    const handleLoadFilter = (filter: SavedFilter) => {
        setFilters(filter.filters);
        onLoadFilter(filter);
    };

    const activeFiltersCount = Object.values(filters).filter(value => 
        value !== undefined && value !== '' && value !== null
    ).length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        Advanced Purchase Order Search
                    </DialogTitle>
                    <DialogDescription>
                        Use advanced filters to find specific purchase orders. You can save your search criteria for future use.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Search Filters */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Search */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Search className="h-4 w-4" />
                                    Basic Search
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="search">Search Terms</Label>
                                        <Input
                                            id="search"
                                            placeholder="Search PO numbers, suppliers..."
                                            value={filters.search || ''}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="po_number">PO Number</Label>
                                        <Input
                                            id="po_number"
                                            placeholder="e.g., PO-2024-001"
                                            value={filters.po_number || ''}
                                            onChange={(e) => handleFilterChange('po_number', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="supplier_name">Supplier Name</Label>
                                        <Input
                                            id="supplier_name"
                                            placeholder="Enter supplier name"
                                            value={filters.supplier_name || ''}
                                            onChange={(e) => handleFilterChange('supplier_name', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status & Priority Filters */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="h-4 w-4" />
                                    Status & Priority
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Status</Label>
                                        <Select
                                            value={filters.status || ''}
                                            onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Priority</Label>
                                        <Select
                                            value={filters.priority || ''}
                                            onValueChange={(value) => handleFilterChange('priority', value === 'all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                {priorityOptions.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        {priority.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Users */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Building className="h-4 w-4" />
                                    Location & Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Warehouse</Label>
                                        <Select
                                            value={filters.warehouse_id?.toString() || ''}
                                            onValueChange={(value) => handleFilterChange('warehouse_id', value === 'all' ? undefined : parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select warehouse" />
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
                                    <div>
                                        <Label>Created By</Label>
                                        <Select
                                            value={filters.created_by?.toString() || ''}
                                            onValueChange={(value) => handleFilterChange('created_by', value === 'all' ? undefined : parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Users</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Approved By</Label>
                                        <Select
                                            value={filters.approved_by?.toString() || ''}
                                            onValueChange={(value) => handleFilterChange('approved_by', value === 'all' ? undefined : parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Users</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amount Range */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <DollarSign className="h-4 w-4" />
                                    Amount Range
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="total_amount_min">Minimum Amount</Label>
                                        <Input
                                            id="total_amount_min"
                                            type="number"
                                            placeholder="0.00"
                                            value={filters.total_amount_min || ''}
                                            onChange={(e) => handleFilterChange('total_amount_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="total_amount_max">Maximum Amount</Label>
                                        <Input
                                            id="total_amount_max"
                                            type="number"
                                            placeholder="0.00"
                                            value={filters.total_amount_max || ''}
                                            onChange={(e) => handleFilterChange('total_amount_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date Ranges */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    Date Ranges
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Created Date Range</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <Label htmlFor="created_date_from">From</Label>
                                                <Input
                                                    id="created_date_from"
                                                    type="date"
                                                    value={filters.created_date_from || ''}
                                                    onChange={(e) => handleFilterChange('created_date_from', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="created_date_to">To</Label>
                                                <Input
                                                    id="created_date_to"
                                                    type="date"
                                                    value={filters.created_date_to || ''}
                                                    onChange={(e) => handleFilterChange('created_date_to', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Expected Delivery Date Range</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <Label htmlFor="expected_delivery_from">From</Label>
                                                <Input
                                                    id="expected_delivery_from"
                                                    type="date"
                                                    value={filters.expected_delivery_from || ''}
                                                    onChange={(e) => handleFilterChange('expected_delivery_from', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="expected_delivery_to">To</Label>
                                                <Input
                                                    id="expected_delivery_to"
                                                    type="date"
                                                    value={filters.expected_delivery_to || ''}
                                                    onChange={(e) => handleFilterChange('expected_delivery_to', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Saved Filters Sidebar */}
                    <div className="space-y-6">
                        {/* Active Filters Summary */}
                        {activeFiltersCount > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                                        <span>Active Filters ({activeFiltersCount})</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClear}
                                            className="h-6 px-2 text-xs"
                                        >
                                            <RotateCcw className="h-3 w-3 mr-1" />
                                            Clear All
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(filters).map(([key, value]) => {
                                            if (!value || value === '') return null;
                                            return (
                                                <Badge key={key} variant="secondary" className="text-xs">
                                                    {key}: {value}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Save Current Filter */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Save className="h-4 w-4" />
                                    Save Filter
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence>
                                    {!showSaveForm ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowSaveForm(true)}
                                                className="w-full"
                                                disabled={activeFiltersCount === 0}
                                            >
                                                <Save className="h-3 w-3 mr-2" />
                                                Save Current Filter
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-2"
                                        >
                                            <Input
                                                placeholder="Enter filter name"
                                                value={saveFilterName}
                                                onChange={(e) => setSaveFilterName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveFilter}
                                                    disabled={!saveFilterName.trim()}
                                                    className="flex-1"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowSaveForm(false);
                                                        setSaveFilterName('');
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>

                        {/* Saved Filters */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="h-4 w-4" />
                                    Saved Filters ({savedFilters.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-48">
                                    {savedFilters.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No saved filters yet
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {savedFilters.map((filter) => (
                                                <div
                                                    key={filter.id}
                                                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{filter.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(filter.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleLoadFilter(filter)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Search className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onDeleteFilter(filter.id)}
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                    <Button onClick={handleSearch}>
                        <Search className="h-4 w-4 mr-2" />
                        Apply Search
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PurchaseOrderAdvancedSearchDialog;