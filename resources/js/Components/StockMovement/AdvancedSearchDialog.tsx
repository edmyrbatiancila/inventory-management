import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Dialog, 
    DialogContent, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/Components/ui/dialog';
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from '@/Components/ui/tabs';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from '@/Components/ui/card';
import { 
    Button 
} from '@/Components/ui/button';
import { 
    Input 
} from '@/Components/ui/input';
import { 
    Label 
} from '@/Components/ui/label';
import { 
    Badge 
} from '@/Components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/Components/ui/select';
import { 
    Checkbox 
} from '@/Components/ui/checkbox';
import { 
    Filter, 
    Save, 
    Search, 
    X, 
    Calendar, 
    Hash, 
    Package, 
    WarehouseIcon, 
    User, 
    TrendingUp,
    TrendingDown,
    History
} from 'lucide-react';

import { Product } from '@/types/Product/IProduct';
import { Warehouse } from '@/types/Warehouse/IWarehouse';
import { User as UserType } from '@/types';
import { StockMovementAdvancedFilters, StockMovementSavedFilter } from '@/types/StockMovement/IStockMovementAdvancedFilters';
import { MovementTypeLabels, StatusLabels, StockMovementStatus, StockMovementType } from '@/types/StockMovement/IStockMovement';

interface StockMovementAdvancedSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: StockMovementAdvancedFilters) => void;
    products: Product[];
    warehouses: Warehouse[];
    users: UserType[];
    currentFilters: StockMovementAdvancedFilters;
    savedFilters: StockMovementSavedFilter[];
    onSaveFilter: (name: string, filters: StockMovementAdvancedFilters) => void;
    onLoadFilter: (filter: StockMovementSavedFilter) => void;
    onDeleteFilter: (filterId: string) => void;
}

const StockMovementAdvancedSearchDialog = ({
    isOpen,
    onClose,
    onSearch,
    products,
    warehouses,
    users,
    currentFilters,
    savedFilters,
    onSaveFilter,
    onLoadFilter,
    onDeleteFilter,
}: StockMovementAdvancedSearchDialogProps) => {
    const [filters, setFilters] = useState<StockMovementAdvancedFilters>(currentFilters);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveFilter, setShowSaveFilter] = useState(false);
    const [activeTab, setActiveTab] = useState('search');

    const movementTypeOptions: StockMovementType[] = [
        'adjustment_increase', 'adjustment_decrease', 'transfer_in', 'transfer_out',
        'purchase_receive', 'sale_fulfill', 'return_customer', 'return_supplier',
        'damage_write_off', 'expiry_write_off'
    ];

    const statusOptions: StockMovementStatus[] = ['pending', 'approved', 'rejected', 'applied'];

    const relatedDocumentOptions = [
        { value: 'adjustment', label: 'Stock Adjustment' },
        { value: 'transfer', label: 'Stock Transfer' },
        { value: 'purchase_order', label: 'Purchase Order' },
        { value: 'sale_order', label: 'Sales Order' }
    ];

    const handleFilterChange = (key: keyof StockMovementAdvancedFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleArrayToggle = (key: keyof StockMovementAdvancedFilters, value: any) => {
        const currentArray = filters[key] as any[] || [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        
        handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Advanced Stock Movement Search
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Search Filters
                        </TabsTrigger>
                        <TabsTrigger value="saved" className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Saved Filters ({savedFilters.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Text Search Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Text Search
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Global Search</Label>
                                    <Input
                                        placeholder="Search across all fields..."
                                        value={filters.globalSearch || ''}
                                        onChange={(e) => handleFilterChange('globalSearch', e.target.value || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference Number</Label>
                                    <Input
                                        placeholder="SM20241101..."
                                        value={filters.referenceNumber || ''}
                                        onChange={(e) => handleFilterChange('referenceNumber', e.target.value || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Input
                                        placeholder="Movement reason..."
                                        value={filters.reason || ''}
                                        onChange={(e) => handleFilterChange('reason', e.target.value || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Input
                                        placeholder="Movement notes..."
                                        value={filters.notes || ''}
                                        onChange={(e) => handleFilterChange('notes', e.target.value || undefined)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Movement Types & Status Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Movement Types & Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Movement Types</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {movementTypeOptions.map((type) => (
                                            <div key={type} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={type}
                                                    checked={filters.movementTypes?.includes(type) || false}
                                                    onCheckedChange={() => handleArrayToggle('movementTypes', type)}
                                                />
                                                <Label htmlFor={type} className="text-sm">
                                                    {MovementTypeLabels[type]}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {statusOptions.map((status) => (
                                            <div key={status} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={status}
                                                    checked={filters.statuses?.includes(status) || false}
                                                    onCheckedChange={() => handleArrayToggle('statuses', status)}
                                                />
                                                <Label htmlFor={status} className="text-sm">
                                                    {StatusLabels[status]}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Movement Direction</Label>
                                    <Select
                                        value={filters.movementDirection || ''}
                                        onValueChange={(value) => handleFilterChange('movementDirection', value || undefined)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select direction..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="both">All Movements</SelectItem>
                                            <SelectItem value="increase">Increases Only</SelectItem>
                                            <SelectItem value="decrease">Decreases Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quantity & Value Ranges */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Quantity & Value Ranges
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quantity Moved (Min)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.quantityMovedMin || ''}
                                        onChange={(e) => handleFilterChange('quantityMovedMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity Moved (Max)</Label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={filters.quantityMovedMax || ''}
                                        onChange={(e) => handleFilterChange('quantityMovedMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Value (Min)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.totalValueMin || ''}
                                        onChange={(e) => handleFilterChange('totalValueMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Value (Max)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="10000.00"
                                        value={filters.totalValueMax || ''}
                                        onChange={(e) => handleFilterChange('totalValueMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit Cost (Min)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.unitCostMin || ''}
                                        onChange={(e) => handleFilterChange('unitCostMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit Cost (Max)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="1000.00"
                                        value={filters.unitCostMax || ''}
                                        onChange={(e) => handleFilterChange('unitCostMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date Ranges */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Date Ranges
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Created After</Label>
                                    <Input
                                        type="date"
                                        value={filters.createdAfter || ''}
                                        onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Created Before</Label>
                                    <Input
                                        type="date"
                                        value={filters.createdBefore || ''}
                                        onChange={(e) => handleFilterChange('createdBefore', e.target.value || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Approved After</Label>
                                    <Input
                                        type="date"
                                        value={filters.approvedAfter || ''}
                                        onChange={(e) => handleFilterChange('approvedAfter', e.target.value || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Approved Before</Label>
                                    <Input
                                        type="date"
                                        value={filters.approvedBefore || ''}
                                        onChange={(e) => handleFilterChange('approvedBefore', e.target.value || undefined)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quick Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="myMovements"
                                        checked={filters.myMovements || false}
                                        onCheckedChange={(checked) => handleFilterChange('myMovements', checked || undefined)}
                                    />
                                    <Label htmlFor="myMovements">My Movements</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="recentMovements"
                                        checked={filters.recentMovements || false}
                                        onCheckedChange={(checked) => handleFilterChange('recentMovements', checked || undefined)}
                                    />
                                    <Label htmlFor="recentMovements">Recent (7 days)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pendingApproval"
                                        checked={filters.pendingApproval || false}
                                        onCheckedChange={(checked) => handleFilterChange('pendingApproval', checked || undefined)}
                                    />
                                    <Label htmlFor="pendingApproval">Pending Approval</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="highValue"
                                        checked={filters.highValue || false}
                                        onCheckedChange={(checked) => handleFilterChange('highValue', checked || undefined)}
                                    />
                                    <Label htmlFor="highValue">High Value</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="largeQuantity"
                                        checked={filters.largeQuantity || false}
                                        onCheckedChange={(checked) => handleFilterChange('largeQuantity', checked || undefined)}
                                    />
                                    <Label htmlFor="largeQuantity">Large Quantity</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Saved Filters Tab */}
                    <TabsContent value="saved" className="mt-4">
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {savedFilters.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No saved filters yet</p>
                                    <p className="text-sm">Create some advanced searches to save them for later use</p>
                                </div>
                            ) : (
                                savedFilters.map((savedFilter) => (
                                    <Card key={savedFilter.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{savedFilter.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Used {savedFilter.usageCount || 0} times • 
                                                        Created {new Date(savedFilter.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {Object.keys(savedFilter.filters).slice(0, 3).map((key) => (
                                                            <Badge key={key} variant="secondary" className="text-xs">
                                                                {key}
                                                            </Badge>
                                                        ))}
                                                        {Object.keys(savedFilter.filters).length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{Object.keys(savedFilter.filters).length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onLoadFilter(savedFilter)}
                                                    >
                                                        Load
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onDeleteFilter(savedFilter.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear All
                                </Button>
                                {!showSaveFilter ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowSaveFilter(true)}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Filter
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Filter name..."
                                            value={saveFilterName}
                                            onChange={(e) => setSaveFilterName(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveFilter();
                                                }
                                            }}
                                            className="w-40"
                                        />
                                        <Button size="sm" onClick={handleSaveFilter}>
                                            Save
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => {
                                                setShowSaveFilter(false);
                                                setSaveFilterName('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSearch} disabled={!hasActiveFilters}>
                            <Search className="w-4 h-4 mr-2" />
                            Search ({Object.keys(filters).length} filters)
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default StockMovementAdvancedSearchDialog;