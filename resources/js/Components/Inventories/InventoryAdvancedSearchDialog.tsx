import { InventoryAdvancedFilters, InventorySavedFilter } from "@/types/Inventory/IInventoryAdvancedFilters";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Product } from "@/types/Product/IProduct";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Brand, Category } from "@/types";
import { useEffect, useState } from "react";
import { BookmarkPlus, CalendarIcon, Clock, Save, Search, Trash2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

interface IInventoryAdvancedSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: InventoryAdvancedFilters) => void;
    currentFilters: InventoryAdvancedFilters;
    savedFilters: InventorySavedFilter[];
    onSaveFilter: (name: string, filters: InventoryAdvancedFilters) => void;
    onLoadFilter: (filter: InventorySavedFilter) => void;
    products?: Product[];
    warehouses?: Warehouse[];
    categories?: Category[];
    brands?: Brand[];
}

const InventoryAdvancedSearchDialog = ({
    isOpen,
    onClose,
    onSearch,
    currentFilters,
    savedFilters,
    onSaveFilter,
    onLoadFilter,
    products = [],
    warehouses = [],
    categories = [],
    brands = []
}: IInventoryAdvancedSearchDialogProps) => {

    const [filters, setFilters] = useState<InventoryAdvancedFilters>(currentFilters);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveFilter, setShowSaveFilter] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('search');

    const handleFilterChange = (key: keyof InventoryAdvancedFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
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

    const handleLoadFilter = (savedFilter: InventorySavedFilter) => {
        setFilters(savedFilter.filters);
        onLoadFilter(savedFilter);
    };

    const stockStatusOptions = [
        { value: 'healthy', label: 'Healthy Stock' },
        { value: 'low', label: 'Low Stock' },
        { value: 'critical', label: 'Critical Stock' },
        { value: 'out_of_stock', label: 'Out of Stock' }
    ];

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
                        <Search className="w-5 h-5" />
                        Advanced Inventory Search
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-full"
                >
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="search">🔍 Search</TabsTrigger>
                            <TabsTrigger value="products">📦 Products</TabsTrigger>
                            <TabsTrigger value="warehouses">🏢 Warehouses</TabsTrigger>
                            <TabsTrigger value="quantities">📊 Quantities</TabsTrigger>
                            <TabsTrigger value="dates">📅 Dates</TabsTrigger>
                            <TabsTrigger value="saved">💾 Saved</TabsTrigger>
                        </TabsList>

                        <div className="overflow-y-auto max-h-[400px]">
                            {/* Text Search Tab */}
                            <TabsContent
                                value="search" 
                                className="space-y-4 mt-0"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Text Search</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="globalSearch">Global Search</Label>
                                                <Input
                                                    id="globalSearch"
                                                    placeholder="Search across all fields..."
                                                    value={filters.globalSearch || ''}
                                                    onChange={(e) => handleFilterChange('globalSearch', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="productName">Product Name</Label>
                                                <Input
                                                    id="productName"
                                                    placeholder="Filter by product name..."
                                                    value={filters.productName || ''}
                                                    onChange={(e) => handleFilterChange('productName', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="productSku">Product SKU</Label>
                                                <Input
                                                    id="productSku"
                                                    placeholder="Filter by SKU..."
                                                    value={filters.productSku || ''}
                                                    onChange={(e) => handleFilterChange('productSku', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="warehouseName">Warehouse Name</Label>
                                                <Input
                                                    id="warehouseName"
                                                    placeholder="Filter by warehouse name..."
                                                    value={filters.warehouseName || ''}
                                                    onChange={(e) => handleFilterChange('warehouseName', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="warehouseCode">Warehouse Code</Label>
                                                <Input
                                                    id="warehouseCode"
                                                    placeholder="Filter by warehouse code..."
                                                    value={filters.warehouseCode || ''}
                                                    onChange={(e) => handleFilterChange('warehouseCode', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Search in notes..."
                                                value={filters.notes || ''}
                                                onChange={(e) => handleFilterChange('notes', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Filters */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Quick Filters</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="myInventories"
                                                    checked={filters.myInventories || false}
                                                    onCheckedChange={(checked) => 
                                                        handleFilterChange('myInventories', checked)
                                                    }
                                                />
                                                <Label htmlFor="myInventories">My Inventories</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="recentlyUpdated"
                                                    checked={filters.recentlyUpdated || false}
                                                    onCheckedChange={(checked) => 
                                                        handleFilterChange('recentlyUpdated', checked)
                                                    }
                                                />
                                                <Label htmlFor="recentlyUpdated">Recently Updated</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="newInventories"
                                                    checked={filters.newInventories || false}
                                                    onCheckedChange={(checked) => 
                                                        handleFilterChange('newInventories', checked)
                                                    }
                                                />
                                                <Label htmlFor="newInventories">New Items</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="highValueInventories"
                                                    checked={filters.highValueInventories || false}
                                                    onCheckedChange={(checked) => 
                                                        handleFilterChange('highValueInventories', checked)
                                                    }
                                                />
                                                <Label htmlFor="highValueInventories">High Value</Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Products Tab */}
                            <TabsContent
                                value="products" 
                                className="space-y-4 mt-0 max-h-[400px] overflow-y-auto"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Product Filters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Product Selection */}
                                        <div>
                                            <Label>Products</Label>
                                            <Select
                                                value=""
                                                onValueChange={(value) => {
                                                    const productId = parseInt(value);
                                                    const currentProducts = filters.productIds || [];
                                                    if (!currentProducts.includes(productId)) {
                                                        handleFilterChange('productIds', [...currentProducts, productId]);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select products..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem
                                                            key={product.id} 
                                                            value={product.id.toString()}
                                                            disabled={filters.productIds?.includes(product.id)}
                                                        >
                                                            {product.name} ({product.sku})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {filters.productIds && filters.productIds.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {filters.productIds.map((productId) => {
                                                        const product = products.find(p => p.id === productId);
                                                        return product ? (
                                                            <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                                                                {product.name}
                                                                <X 
                                                                    className="w-3 h-3 cursor-pointer" 
                                                                    onClick={() => {
                                                                        const newProducts = filters.productIds?.filter(id => id !== productId);
                                                                        handleFilterChange('productIds', newProducts?.length ? newProducts : undefined);
                                                                    }}
                                                                />
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Categories Selection */}
                                        <div>
                                            <Label>Categories</Label>
                                            <Select
                                                value=""
                                                onValueChange={(value) => {
                                                    const categoryId = parseInt(value);
                                                    const currentCategories = filters.categoryIds || [];
                                                    if (!currentCategories.includes(categoryId)) {
                                                        handleFilterChange('categoryIds', [...currentCategories, categoryId]);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select categories..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem 
                                                            key={category.id} 
                                                            value={category.id.toString()}
                                                            disabled={filters.categoryIds?.includes(category.id)}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {filters.categoryIds && filters.categoryIds.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {filters.categoryIds.map((categoryId) => {
                                                        const category = categories.find(c => c.id === categoryId);
                                                        return category ? (
                                                            <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                                                                {category.name}
                                                                <X 
                                                                    className="w-3 h-3 cursor-pointer" 
                                                                    onClick={() => {
                                                                        const newCategories = filters.categoryIds?.filter(id => id !== categoryId);
                                                                        handleFilterChange('categoryIds', newCategories?.length ? newCategories : undefined);
                                                                    }}
                                                                />
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Brands Selection */}
                                        <div>
                                            <Label>Brands</Label>
                                            <Select
                                                value=""
                                                onValueChange={(value) => {
                                                    const brandId = parseInt(value);
                                                    const currentBrands = filters.brandIds || [];
                                                    if (!currentBrands.includes(brandId)) {
                                                        handleFilterChange('brandIds', [...currentBrands, brandId]);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select brands..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map((brand) => (
                                                        <SelectItem 
                                                            key={brand.id} 
                                                            value={brand.id.toString()}
                                                            disabled={filters.brandIds?.includes(brand.id)}
                                                        >
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {filters.brandIds && filters.brandIds.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {filters.brandIds.map((brandId) => {
                                                        const brand = brands.find(b => b.id === brandId);
                                                        return brand ? (
                                                            <Badge key={brandId} variant="secondary" className="flex items-center gap-1">
                                                                {brand.name}
                                                                <X 
                                                                    className="w-3 h-3 cursor-pointer" 
                                                                    onClick={() => {
                                                                        const newBrands = filters.brandIds?.filter(id => id !== brandId);
                                                                        handleFilterChange('brandIds', newBrands?.length ? newBrands : undefined);
                                                                    }}
                                                                />
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Warehouses Tab */}
                            <TabsContent
                                value="warehouses" 
                                className="space-y-4 mt-0 max-h-[400px] overflow-y-auto"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Warehouse Filters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Warehouse Selection */}
                                        <div>
                                            <Label>Warehouses</Label>
                                            <Select
                                                value=""
                                                onValueChange={(value) => {
                                                    const warehouseId = parseInt(value);
                                                    const currentWarehouses = filters.warehouseIds || [];
                                                    if (!currentWarehouses.includes(warehouseId)) {
                                                        handleFilterChange('warehouseIds', [...currentWarehouses, warehouseId]);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouses..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem 
                                                            key={warehouse.id} 
                                                            value={warehouse.id.toString()}
                                                            disabled={filters.warehouseIds?.includes(warehouse.id)}
                                                        >
                                                            {warehouse.name} ({warehouse.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {filters.warehouseIds && filters.warehouseIds.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {filters.warehouseIds.map((warehouseId) => {
                                                        const warehouse = warehouses.find(w => w.id === warehouseId);
                                                        return warehouse ? (
                                                            <Badge key={warehouseId} variant="secondary" className="flex items-center gap-1">
                                                                {warehouse.name}
                                                                <X 
                                                                    className="w-3 h-3 cursor-pointer" 
                                                                    onClick={() => {
                                                                        const newWarehouses = filters.warehouseIds?.filter(id => id !== warehouseId);
                                                                        handleFilterChange('warehouseIds', newWarehouses?.length ? newWarehouses : undefined);
                                                                    }}
                                                                />
                                                            </Badge>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Warehouse Status */}
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="warehouseIsActive"
                                                checked={filters.warehouseIsActive === true}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('warehouseIsActive', checked ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="warehouseIsActive">Only Active Warehouses</Label>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Quantities Tab */}
                            <TabsContent
                                value="quantities" 
                                className="space-y-4 mt-0 max-h-[400px] overflow-y-auto"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Quantity Filters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* On Hand Quantity */}
                                        <div>
                                            <Label className="text-base font-medium">Quantity On Hand</Label>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <Label htmlFor="quantityOnHandMin">Minimum</Label>
                                                    <Input
                                                        id="quantityOnHandMin"
                                                        type="number"
                                                        placeholder="0"
                                                        value={filters.quantityOnHandMin || ''}
                                                        onChange={(e) => handleFilterChange('quantityOnHandMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="quantityOnHandMax">Maximum</Label>
                                                    <Input
                                                        id="quantityOnHandMax"
                                                        type="number"
                                                        placeholder="1000"
                                                        value={filters.quantityOnHandMax || ''}
                                                        onChange={(e) => handleFilterChange('quantityOnHandMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reserved Quantity */}
                                        <div>
                                            <Label className="text-base font-medium">Quantity Reserved</Label>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <Label htmlFor="quantityReservedMin">Minimum</Label>
                                                    <Input
                                                        id="quantityReservedMin"
                                                        type="number"
                                                        placeholder="0"
                                                        value={filters.quantityReservedMin || ''}
                                                        onChange={(e) => handleFilterChange('quantityReservedMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="quantityReservedMax">Maximum</Label>
                                                    <Input
                                                        id="quantityReservedMax"
                                                        type="number"
                                                        placeholder="100"
                                                        value={filters.quantityReservedMax || ''}
                                                        onChange={(e) => handleFilterChange('quantityReservedMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Available Quantity */}
                                        <div>
                                            <Label className="text-base font-medium">Quantity Available</Label>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <Label htmlFor="quantityAvailableMin">Minimum</Label>
                                                    <Input
                                                        id="quantityAvailableMin"
                                                        type="number"
                                                        placeholder="0"
                                                        value={filters.quantityAvailableMin || ''}
                                                        onChange={(e) => handleFilterChange('quantityAvailableMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="quantityAvailableMax">Maximum</Label>
                                                    <Input
                                                        id="quantityAvailableMax"
                                                        type="number"
                                                        placeholder="1000"
                                                        value={filters.quantityAvailableMax || ''}
                                                        onChange={(e) => handleFilterChange('quantityAvailableMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Stock Status */}
                                        <div>
                                            <Label className="text-base font-medium">Stock Status</Label>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                {stockStatusOptions.map((option) => (
                                                    <div key={option.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={option.value}
                                                            checked={filters.stockStatus?.includes(option.value as any) || false}
                                                            onCheckedChange={(checked) => {
                                                                const currentStatus = filters.stockStatus || [];
                                                                if (checked) {
                                                                    handleFilterChange('stockStatus', [...currentStatus, option.value]);
                                                                } else {
                                                                    const newStatus = currentStatus.filter(s => s !== option.value);
                                                                    handleFilterChange('stockStatus', newStatus.length > 0 ? newStatus : undefined);
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={option.value}>{option.label}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Stock Value Range */}
                                        <div>
                                            <Label className="text-base font-medium">Stock Value Range</Label>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <Label htmlFor="stockValueMin">Minimum Value</Label>
                                                    <Input
                                                        id="stockValueMin"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={filters.stockValueMin || ''}
                                                        onChange={(e) => handleFilterChange('stockValueMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="stockValueMax">Maximum Value</Label>
                                                    <Input
                                                        id="stockValueMax"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="10000.00"
                                                        value={filters.stockValueMax || ''}
                                                        onChange={(e) => handleFilterChange('stockValueMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Boolean Filters */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-medium">Stock Conditions</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isLowStock"
                                                        checked={filters.isLowStock || false}
                                                        onCheckedChange={(checked) => 
                                                            handleFilterChange('isLowStock', checked)
                                                        }
                                                    />
                                                    <Label htmlFor="isLowStock">Low Stock Items</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isOutOfStock"
                                                        checked={filters.isOutOfStock || false}
                                                        onCheckedChange={(checked) => 
                                                            handleFilterChange('isOutOfStock', checked)
                                                        }
                                                    />
                                                    <Label htmlFor="isOutOfStock">Out of Stock</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="hasReservedStock"
                                                        checked={filters.hasReservedStock || false}
                                                        onCheckedChange={(checked) => 
                                                            handleFilterChange('hasReservedStock', checked)
                                                        }
                                                    />
                                                    <Label htmlFor="hasReservedStock">Has Reserved Stock</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Dates Tab */}
                            <TabsContent
                                value="dates" 
                                className="space-y-4 mt-0 max-h-[400px] overflow-y-auto"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Date Filters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Created Date Range */}
                                        <div>
                                            <Label className="text-base font-medium">Created Date Range</Label>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <Label htmlFor="createdAfter">Created After</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !filters.createdAfter && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {filters.createdAfter ? format(new Date(filters.createdAfter), "PPP") : "Pick a date"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={filters.createdAfter ? new Date(filters.createdAfter) : undefined}
                                                                onSelect={(date) => 
                                                                    handleFilterChange('createdAfter', date ? format(date, 'yyyy-MM-dd') : undefined)
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Saved Filters Tab */}
                            <TabsContent 
                                value="saved" 
                                className="space-y-4 mt-0 max-h-[400px] overflow-y-auto"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            Saved Filters
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowSaveFilter(true)}
                                                >
                                                    <BookmarkPlus className="w-4 h-4 mr-2" />
                                                    Save Current
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {showSaveFilter && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mb-4 p-4 border rounded-lg"
                                            >
                                                <Label htmlFor="saveFilterName">Filter Name</Label>
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        id="saveFilterName"
                                                        placeholder="Enter filter name..."
                                                        value={saveFilterName}
                                                        onChange={(e) => setSaveFilterName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
                                                    />
                                                    <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                                                        <Save className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowSaveFilter(false);
                                                            setSaveFilterName('');
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {savedFilters.length === 0 ? (
                                                <p className="text-muted-foreground text-center py-8">
                                                    No saved filters yet. Create your first saved filter by applying some filters and clicking "Save Current".
                                                </p>
                                            ) : (
                                                savedFilters.map((savedFilter) => (
                                                    <motion.div
                                                        key={savedFilter.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{savedFilter.name}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {Object.keys(savedFilter.filters).length} filters
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(savedFilter.createdAt).toLocaleDateString()}
                                                                {savedFilter.usageCount && (
                                                                    <span className="ml-2">• Used {savedFilter.usageCount} times</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleLoadFilter(savedFilter)}
                                                            >
                                                                Load
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => {
                                                                    // Handle delete saved filter
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                </Tabs>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={clearFilters} 
                            disabled={!hasActiveFilters}
                        >
                            Clear All
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Badge variant="secondary">
                                {Object.keys(filters).length} filter{Object.keys(filters).length !== 1 ? 's' : ''} active
                            </Badge>
                        )}
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                            <Search className="w-4 h-4 mr-2" />
                            Search Inventory
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default InventoryAdvancedSearchDialog;