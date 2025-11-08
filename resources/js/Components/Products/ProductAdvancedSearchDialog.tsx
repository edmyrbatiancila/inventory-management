import { Brand, Category } from "@/types";
import { ProductAdvancedFilters, ProductSavedFilter } from "@/types/Product/IProductAdvancedFilters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { BookmarkPlus, Package, PhilippinePeso, Save, Search, Settings, Tag, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface IProductAdvancedSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: ProductAdvancedFilters) => void;
    categories: Category[];
    brands: Brand[];
    currentFilters: ProductAdvancedFilters;
    savedFilters: ProductSavedFilter[];
    onSaveFilter: (name: string, filters: ProductAdvancedFilters) => void;
    onLoadFilter: (filter: ProductSavedFilter) => void;
}

const ProductAdvancedSearchDialog = ({
    isOpen,
    onClose,
    onSearch,
    categories,
    brands,
    currentFilters,
    savedFilters,
    onSaveFilter,
    onLoadFilter
}: IProductAdvancedSearchDialogProps) => {
    const [filters, setFilters] = useState<ProductAdvancedFilters>(currentFilters);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveFilter, setShowSaveFilter] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('search');

    const handleFilterChange = (key: keyof ProductAdvancedFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleCategoryToggle = (categoryId: number) => {
        const currentCategories = filters.categoryIds || [];
        const newCategories = currentCategories.includes(categoryId)
            ? currentCategories.filter(id => id !== categoryId)
            : [...currentCategories, categoryId];
        
        handleFilterChange('categoryIds', newCategories.length > 0 ? newCategories : undefined);
    };

    const handleBrandToggle = (brandId: number) => {
        const currentBrands = filters.brandIds || [];
        const newBrands = currentBrands.includes(brandId)
            ? currentBrands.filter(id => id !== brandId)
            : [...currentBrands, brandId];
        
        handleFilterChange('brandIds', newBrands.length > 0 ? newBrands : undefined);
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

    const handleLoadFilter = (savedFilter: ProductSavedFilter) => {
        setFilters(savedFilter.filters);
        onLoadFilter(savedFilter);
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
                        <Package className="h-5 w-5 text-blue-600" />
                        Advanced Product Search
                    </DialogTitle>
                    <DialogDescription>
                        Use the filters below to find products by name, category, price range, stock levels, and more. 
                        You can save frequently used filter combinations for quick access.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Basic Search
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Categories & Brands
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="flex items-center gap-2">
                            <PhilippinePeso className="h-4 w-4" />
                            Pricing
                        </TabsTrigger>
                        <TabsTrigger value="stock" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Stock & Inventory
                        </TabsTrigger>
                        <TabsTrigger value="status" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Status & Dates
                        </TabsTrigger>
                        <TabsTrigger value="saved" className="flex items-center gap-2">
                            <BookmarkPlus className="h-4 w-4" />
                            Saved Filters
                        </TabsTrigger>
                    </TabsList>

                    {/* Basic Search Tab */}
                    <TabsContent
                        value="search" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="globalSearch">Global Search</Label>
                                <Input
                                    id="globalSearch"
                                    placeholder="Search across name, SKU, description, barcode..."
                                    value={filters.globalSearch || ''}
                                    onChange={(e) => handleFilterChange('globalSearch', e.target.value || undefined)}
                                />
                                <p className="text-xs text-gray-500">
                                    Searches in product name, SKU, description, barcode, category, and brand
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter product name..."
                                    value={filters.name || ''}
                                    onChange={(e) => handleFilterChange('name', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    placeholder="Enter SKU..."
                                    value={filters.sku || ''}
                                    onChange={(e) => handleFilterChange('sku', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    placeholder="Enter barcode..."
                                    value={filters.barcode || ''}
                                    onChange={(e) => handleFilterChange('barcode', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Search in product descriptions..."
                                    value={filters.description || ''}
                                    onChange={(e) => handleFilterChange('description', e.target.value || undefined)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Categories & Brands Tab */}
                    <TabsContent
                        value="categories" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">
                                    Categories
                                </Label>
                                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
                                    {categories.length > 0 ? (
                                        <div className="space-y-2">
                                            {categories.map(category => (
                                                <div 
                                                    key={category.id} 
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`category-${category.id}`}
                                                        checked={filters.categoryIds?.includes(category.id) || false}
                                                        onCheckedChange={() => handleCategoryToggle(category.id)}
                                                    />
                                                    <Label 
                                                        htmlFor={`category-${category.id}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {category.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No categories available</p>
                                    )}
                                </div>
                                {filters.categoryIds && filters.categoryIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {filters.categoryIds.map(id => {
                                            const category = categories.find(c => c.id === id);
                                            return category ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {category.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Brands</Label>
                                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
                                    {brands.length > 0 ? (
                                        <div className="space-y-2">
                                            {brands.map(brand => (
                                                <div key={brand.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`brand-${brand.id}`}
                                                        checked={filters.brandIds?.includes(brand.id) || false}
                                                        onCheckedChange={() => handleBrandToggle(brand.id)}
                                                    />
                                                    <Label 
                                                        htmlFor={`brand-${brand.id}`}
                                                        className="text-sm cursor-pointer"
                                                    >
                                                        {brand.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No brands available</p>
                                    )}
                                </div>
                                {filters.brandIds && filters.brandIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {filters.brandIds.map(id => {
                                            const brand = brands.find(b => b.id === id);
                                            return brand ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {brand.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent
                        value="pricing" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Selling Price Range</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="priceMin">Minimum ($)</Label>
                                            <Input
                                                id="priceMin"
                                                type="number"
                                                placeholder="0.00"
                                                value={filters.priceMin || ''}
                                                onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priceMax">Maximum ($)</Label>
                                            <Input
                                                id="priceMax"
                                                type="number"
                                                placeholder="999.99"
                                                value={filters.priceMax || ''}
                                                onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Cost Price Range</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="costPriceMin">Minimum ($)</Label>
                                            <Input
                                                id="costPriceMin"
                                                type="number"
                                                placeholder="0.00"
                                                value={filters.costPriceMin || ''}
                                                onChange={(e) => handleFilterChange('costPriceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="costPriceMax">Maximum ($)</Label>
                                            <Input
                                                id="costPriceMax"
                                                type="number"
                                                placeholder="999.99"
                                                value={filters.costPriceMax || ''}
                                                onChange={(e) => handleFilterChange('costPriceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    handleFilterChange('priceMin', undefined);
                                    handleFilterChange('priceMax', 50);
                                }}
                                className="text-xs"
                            >
                                Budget (&lt; $50)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    handleFilterChange('priceMin', 50);
                                    handleFilterChange('priceMax', 200);
                                }}
                                className="text-xs"
                            >
                                Moderate ($50-$200)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    handleFilterChange('priceMin', 200);
                                    handleFilterChange('priceMax', undefined);
                                }}
                                className="text-xs"
                            >
                                Premium (&gt; $200)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    handleFilterChange('expensiveProducts', true);
                                }}
                                className="text-xs"
                            >
                                💎 Expensive Items
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Stock & Inventory Tab */}
                    <TabsContent
                        value="stock" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Stock Level Ranges</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="minStockMin">Min Stock Level</Label>
                                            <Input
                                                id="minStockMin"
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minStockMin || ''}
                                                onChange={(e) => handleFilterChange('minStockMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="minStockMax">to</Label>
                                            <Input
                                                id="minStockMax"
                                                type="number"
                                                placeholder="Max"
                                                value={filters.minStockMax || ''}
                                                onChange={(e) => handleFilterChange('minStockMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="maxStockMin">Max Stock Level</Label>
                                            <Input
                                                id="maxStockMin"
                                                type="number"
                                                placeholder="Min"
                                                value={filters.maxStockMin || ''}
                                                onChange={(e) => handleFilterChange('maxStockMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxStockMax">to</Label>
                                            <Input
                                                id="maxStockMax"
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxStockMax || ''}
                                                onChange={(e) => handleFilterChange('maxStockMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                                
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Inventory Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasInventory"
                                                checked={filters.hasInventory === true}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('hasInventory', checked ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="hasInventory">📦 Has Inventory</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isLowStock"
                                                checked={filters.isLowStock || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isLowStock', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="isLowStock">⚠️ Low Stock</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isOutOfStock"
                                                checked={filters.isOutOfStock || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isOutOfStock', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="isOutOfStock">🔴 Out of Stock</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isOverstock"
                                                checked={filters.isOverstock || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isOverstock', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="isOverstock">📈 Overstock</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Status & Dates Tab */}
                    <TabsContent
                        value="status" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Product Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isActive"
                                                checked={filters.isActive === true}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isActive', checked ? true : filters.isActive === false ? false : undefined)
                                                }
                                            />
                                            <Label htmlFor="isActive">✅ Active Products</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isInactive"
                                                checked={filters.isActive === false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isActive', checked ? false : filters.isActive === true ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="isInactive">❌ Inactive Products</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="trackQuantity"
                                                checked={filters.trackQuantity === true}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('trackQuantity', checked ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="trackQuantity">📊 Track Quantity</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Quick Filters</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="myProducts"
                                                checked={filters.myProducts || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('myProducts', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="myProducts">👤 My Products</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="recentlyUpdated"
                                                checked={filters.recentlyUpdated || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('recentlyUpdated', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="recentlyUpdated">🕒 Recently Updated</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="newProducts"
                                                checked={filters.newProducts || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('newProducts', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="newProducts">✨ New Products</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Date Ranges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Creation Date</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="createdAfter" className="text-xs">From</Label>
                                                <Input
                                                    id="createdAfter"
                                                    type="date"
                                                    value={filters.createdAfter || ''}
                                                    onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="createdBefore" className="text-xs">To</Label>
                                                <Input
                                                    id="createdBefore"
                                                    type="date"
                                                    value={filters.createdBefore || ''}
                                                    onChange={(e) => handleFilterChange('createdBefore', e.target.value || undefined)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Last Updated</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="updatedAfter" className="text-xs">From</Label>
                                                <Input
                                                    id="updatedAfter"
                                                    type="date"
                                                    value={filters.updatedAfter || ''}
                                                    onChange={(e) => handleFilterChange('updatedAfter', e.target.value || undefined)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="updatedBefore" className="text-xs">To</Label>
                                                <Input
                                                    id="updatedBefore"
                                                    type="date"
                                                    value={filters.updatedBefore || ''}
                                                    onChange={(e) => handleFilterChange('updatedBefore', e.target.value || undefined)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Saved Filters Tab */}
                    <TabsContent
                        value="saved" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="space-y-4">
                            {showSaveFilter && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Save Current Filter</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter filter name..."
                                                value={saveFilterName}
                                                onChange={(e) => setSaveFilterName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
                                            />
                                            <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowSaveFilter(false)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Saved Filters</h3>
                                {hasActiveFilters && !showSaveFilter && (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowSaveFilter(true)}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Current
                                    </Button>
                                )}
                            </div>

                            {savedFilters.length > 0 ? (
                                <div className="space-y-2">
                                    {savedFilters.map(savedFilter => (
                                        <Card key={savedFilter.id} className="cursor-pointer hover:bg-gray-50">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div onClick={() => handleLoadFilter(savedFilter)}>
                                                        <h4 className="font-medium">{savedFilter.name}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {Object.keys(savedFilter.filters).length} filters • 
                                                            Created {new Date(savedFilter.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleLoadFilter(savedFilter)}
                                                    >
                                                        Load
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <BookmarkPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved filters</h3>
                                        <p className="text-gray-500 mb-4">
                                            Save your frequently used filter combinations for quick access.
                                        </p>
                                        {hasActiveFilters && (
                                            <Button onClick={() => setShowSaveFilter(true)}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Current Filters
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
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
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Badge variant="secondary">
                                {Object.keys(filters).length} filter{Object.keys(filters).length !== 1 ? 's' : ''} active
                            </Badge>
                        )}
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                            <Search className="h-4 w-4 mr-2" />
                            Search Products
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ProductAdvancedSearchDialog;