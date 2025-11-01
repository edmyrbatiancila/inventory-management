import { Calendar, Clock, Filter, Hash, History, Package, Save, Search, WarehouseIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AdvancedFilters, SavedFilter } from "@/types";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { statusOptions } from "@/hooks/stock-transfers/statusOptions";
import { StockTransferStatus } from "@/types/StockTransfer/IStockTransfer";
import { Product } from "@/types/Product/IProduct";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Button } from "../ui/button";

interface IAdvancedSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: AdvancedFilters) => void;
    warehouses: Warehouse[];
    products: Product[];
    currentFilters: AdvancedFilters;
    savedFilters: SavedFilter[];
    onSaveFilter: (name: string, filters: AdvancedFilters) => void;
    onLoadFilter: (filter: SavedFilter) => void;
}

const AdvancedSearchDialog = ({
    isOpen,
    onClose,
    onSearch,
    warehouses,
    products,
    currentFilters,
    savedFilters,
    onSaveFilter,
    onLoadFilter,
}: IAdvancedSearchDialogProps) => {
    const [filters, setFilters] = useState<AdvancedFilters>(currentFilters);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveFilter, setShowSaveFilter] = useState(false);
    const [activeTab, setActiveTab] = useState('search');

    const handleFilterChange = (key: keyof AdvancedFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleStatusToggle = (status: StockTransferStatus) => {
        const currentStatuses = filters.statuses || [];
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status];
        
        handleFilterChange('statuses', newStatuses.length > 0 ? newStatuses : undefined);
    };

    const handleWarehouseToggle = (warehouseId: number, type: 'from' | 'to') => {
        const key = type === 'from' ? 'fromWarehouseIds' : 'toWarehouseIds';
        const currentIds = filters[key] || [];
        const newIds = currentIds.includes(warehouseId)
            ? currentIds.filter(id => id !== warehouseId)
            : [...currentIds, warehouseId];
        
        handleFilterChange(key, newIds.length > 0 ? newIds : undefined);
    };

    const clearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    const handleSearch = () => {
        onSearch(filters);
        onClose();
    };

    const handleSaveFilter = () => {
        if (saveFilterName.trim() && hasActiveFilters) {
            onSaveFilter(saveFilterName.trim(), filters);
            setSaveFilterName('');
            setShowSaveFilter(false);
        }
    };

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    return (
        <Dialog
            open={isOpen} 
            onOpenChange={onClose}
        >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Advanced Search & Filtering
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="search">Search Criteria</TabsTrigger>
                        <TabsTrigger value="filters">Smart Filters</TabsTrigger>
                        <TabsTrigger value="saved">Saved Filters</TabsTrigger>
                    </TabsList>

                    <div className="max-h-[60vh] overflow-y-auto mt-4">
                        <TabsContent
                            value="search"
                            className="space-y-6"
                        >
                            {/* Global Search */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Search className="h-4 w-4" />
                                        Global Search
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="globalSearch">Search everywhere</Label>
                                        <Input
                                            id="globalSearch"
                                            placeholder="Search in reference numbers, notes, products, warehouses..."
                                            value={filters.globalSearch || ''}
                                            onChange={(e) => handleFilterChange('globalSearch', e.target.value || undefined)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="referenceNumber">Reference Number</Label>
                                            <Input
                                                id="referenceNumber"
                                                placeholder="ST-20241031-0001"
                                                value={filters.referenceNumber || ''}
                                                onChange={(e) => handleFilterChange('referenceNumber', e.target.value || undefined)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Filters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Hash className="h-4 w-4" />
                                        Transfer Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {statusOptions.map((status) => (
                                            <motion.div
                                                key={status.value}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Badge
                                                    variant={filters.statuses?.includes(status.value) ? "default" : "outline"}
                                                    className={`cursor-pointer transition-all duration-200 ${
                                                        filters.statuses?.includes(status.value) 
                                                            ? `${status.color} text-white` 
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => handleStatusToggle(status.value)}
                                                >
                                                    {status.label}
                                                    {filters.statuses?.includes(status.value) && (
                                                        <X className="h-3 w-3 ml-1" />
                                                    )}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location Filters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <WarehouseIcon className="h-4 w-4" />
                                        Warehouses & Locations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>From Warehouses</Label>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {warehouses.map((warehouse) => (
                                                    <Badge
                                                        key={`from-${warehouse.id}`}
                                                        variant={filters.fromWarehouseIds?.includes(warehouse.id) ? "default" : "outline"}
                                                        className="cursor-pointer text-xs"
                                                        onClick={() => handleWarehouseToggle(warehouse.id, 'from')}
                                                    >
                                                        {warehouse.code}
                                                        {filters.fromWarehouseIds?.includes(warehouse.id) && (
                                                            <X className="h-3 w-3 ml-1" />
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>To Warehouses</Label>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {warehouses.map((warehouse) => (
                                                    <Badge
                                                        key={`to-${warehouse.id}`}
                                                        variant={filters.toWarehouseIds?.includes(warehouse.id) ? "default" : "outline"}
                                                        className="cursor-pointer text-xs"
                                                        onClick={() => handleWarehouseToggle(warehouse.id, 'to')}
                                                    >
                                                        {warehouse.code}
                                                        {filters.toWarehouseIds?.includes(warehouse.id) && (
                                                            <X className="h-3 w-3 ml-1" />
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quantity Range */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4" />
                                        Quantity Range
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="quantityMin">Minimum Quantity</Label>
                                            <Input
                                                id="quantityMin"
                                                type="number"
                                                placeholder="0"
                                                value={filters.quantityMin || ''}
                                                onChange={(e) => handleFilterChange('quantityMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="quantityMax">Maximum Quantity</Label>
                                            <Input
                                                id="quantityMax"
                                                type="number"
                                                placeholder="1000"
                                                value={filters.quantityMax || ''}
                                                onChange={(e) => handleFilterChange('quantityMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent
                            value="filters" 
                            className="space-y-6"
                        >
                            {/* Date Range Filters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4" />
                                        Date Ranges
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="createdAfter">Created After</Label>
                                            <Input
                                                id="createdAfter"
                                                type="date"
                                                value={filters.createdAfter || ''}
                                                onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="createdBefore">Created Before</Label>
                                            <Input
                                                id="createdBefore"
                                                type="date"
                                                value={filters.createdBefore || ''}
                                                onChange={(e) => handleFilterChange('createdBefore', e.target.value || undefined)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="initiatedAfter">Initiated After</Label>
                                            <Input
                                                id="initiatedAfter"
                                                type="date"
                                                value={filters.initiatedAfter || ''}
                                                onChange={(e) => handleFilterChange('initiatedAfter', e.target.value || undefined)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="initiatedBefore">Initiated Before</Label>
                                            <Input
                                                id="initiatedBefore"
                                                type="date"
                                                value={filters.initiatedBefore || ''}
                                                onChange={(e) => handleFilterChange('initiatedBefore', e.target.value || undefined)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Filters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4" />
                                        Quick Filters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant={filters.isUrgent ? "default" : "outline"}
                                            onClick={() => handleFilterChange('isUrgent', !filters.isUrgent || undefined)}
                                            className="justify-start"
                                        >
                                            🔥 Urgent Transfers
                                        </Button>
                                        <Button
                                            variant={filters.isOverdue ? "default" : "outline"}
                                            onClick={() => handleFilterChange('isOverdue', !filters.isOverdue || undefined)}
                                            className="justify-start"
                                        >
                                            ⏰ Overdue
                                        </Button>
                                        <Button
                                            variant={filters.hasNotes ? "default" : "outline"}
                                            onClick={() => handleFilterChange('hasNotes', !filters.hasNotes || undefined)}
                                            className="justify-start"
                                        >
                                            📝 Has Notes
                                        </Button>
                                        <Button
                                            variant={filters.myTransfers ? "default" : "outline"}
                                            onClick={() => handleFilterChange('myTransfers', !filters.myTransfers || undefined)}
                                            className="justify-start"
                                        >
                                            👤 My Transfers
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent
                            value="saved" 
                            className="space-y-4"
                        >
                            {/* Save Current Filter */}
                            {hasActiveFilters && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Save className="h-4 w-4" />
                                            Save Current Filter
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Filter name..."
                                                value={saveFilterName}
                                                onChange={(e) => setSaveFilterName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
                                            />
                                            <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                                                Save
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Saved Filters List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <History className="h-4 w-4" />
                                        Saved Filters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {savedFilters.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">
                                            No saved filters yet. Create a filter and save it for quick access.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {savedFilters.map((savedFilter) => (
                                                <motion.div
                                                    key={savedFilter.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => onLoadFilter(savedFilter)}
                                                >
                                                    <div>
                                                        <h4 className="font-medium">{savedFilter.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            Used {savedFilter.usageCount} times • {savedFilter.createdAt}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {Object.keys(savedFilter.filters).length} filters
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                            Clear All
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                        <Search className="h-4 w-4 mr-2" />
                        Search ({Object.keys(filters).length} filters)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default AdvancedSearchDialog;