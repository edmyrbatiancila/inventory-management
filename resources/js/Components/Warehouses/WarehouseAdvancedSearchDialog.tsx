import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { WarehouseAdvancedFilters, WarehouseSavedFilter } from "@/types/Warehouse/IWarehouseAdvancedFilters";
import { BookmarkPlus, Building, MapPin, Package, Save, Search, Settings, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";

interface IWarehouseAdvancedSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: WarehouseAdvancedFilters) => void;
    currentFilters: WarehouseAdvancedFilters;
    savedFilters: WarehouseSavedFilter[];
    onSaveFilter: (name: string, filters: WarehouseAdvancedFilters) => void;
    onLoadFilter: (filter: WarehouseSavedFilter) => void;
}

const WarehouseAdvancedSearchDialog = ({
    isOpen,
    onClose,
    onSearch,
    currentFilters,
    savedFilters,
    onSaveFilter,
    onLoadFilter
}: IWarehouseAdvancedSearchDialogProps) => {

    const [filters, setFilters] = useState<WarehouseAdvancedFilters>(currentFilters);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveFilter, setShowSaveFilter] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('search');

    const handleFilterChange = (key: keyof WarehouseAdvancedFilters, value: any) => {
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

    const handleLoadFilter = (savedFilter: WarehouseSavedFilter) => {
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
                        <Building className="h-5 w-5 text-blue-600" />
                        Advanced Warehouse Search
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Basic Search
                        </TabsTrigger>
                        <TabsTrigger value="location" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location & Contact
                        </TabsTrigger>
                        <TabsTrigger value="capacity" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Capacity & Features
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
                                    placeholder="Search across name, code, address, contact..."
                                    value={filters.globalSearch || ''}
                                    onChange={(e) => handleFilterChange('globalSearch', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Warehouse Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter warehouse name..."
                                    value={filters.name || ''}
                                    onChange={(e) => handleFilterChange('name', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Warehouse Code</Label>
                                <Input
                                    id="code"
                                    placeholder="Enter warehouse code..."
                                    value={filters.code || ''}
                                    onChange={(e) => handleFilterChange('code', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    placeholder="Enter contact person name..."
                                    value={filters.contactPerson || ''}
                                    onChange={(e) => handleFilterChange('contactPerson', e.target.value || undefined)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Search in warehouse descriptions..."
                                    value={filters.description || ''}
                                    onChange={(e) => handleFilterChange('description', e.target.value || undefined)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Location & Contact Tab */}
                    <TabsContent
                        value="location" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Address & Location</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            placeholder="Street address..."
                                            value={filters.address || ''}
                                            onChange={(e) => handleFilterChange('address', e.target.value || undefined)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                placeholder="City name..."
                                                value={filters.city || ''}
                                                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State/Province</Label>
                                            <Input
                                                id="state"
                                                placeholder="State..."
                                                value={filters.state || ''}
                                                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                placeholder="Country..."
                                                value={filters.country || ''}
                                                onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Input
                                                id="postalCode"
                                                placeholder="ZIP/Postal code..."
                                                value={filters.postalCode || ''}
                                                onChange={(e) => handleFilterChange('postalCode', e.target.value || undefined)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            placeholder="Phone number..."
                                            value={filters.phone || ''}
                                            onChange={(e) => handleFilterChange('phone', e.target.value || undefined)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            placeholder="Email address..."
                                            value={filters.email || ''}
                                            onChange={(e) => handleFilterChange('email', e.target.value || undefined)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Capacity & Features Tab */}
                    <TabsContent
                        value="capacity" 
                        className="space-y-4 max-h-[400px] overflow-y-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Storage Capacity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="capacityMin">Minimum Capacity</Label>
                                            <Input
                                                id="capacityMin"
                                                type="number"
                                                placeholder="0"
                                                value={filters.capacityMin || ''}
                                                onChange={(e) => handleFilterChange('capacityMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="capacityMax">Maximum Capacity</Label>
                                            <Input
                                                id="capacityMax"
                                                type="number"
                                                placeholder="10000"
                                                value={filters.capacityMax || ''}
                                                onChange={(e) => handleFilterChange('capacityMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                handleFilterChange('capacityMin', undefined);
                                                handleFilterChange('capacityMax', 500);
                                            }}
                                            className="text-xs"
                                        >
                                            Small (&lt; 500)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                handleFilterChange('capacityMin', 500);
                                                handleFilterChange('capacityMax', 2000);
                                            }}
                                            className="text-xs"
                                        >
                                            Medium (500-2000)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                handleFilterChange('capacityMin', 2000);
                                                handleFilterChange('capacityMax', undefined);
                                            }}
                                            className="text-xs"
                                        >
                                            Large (&gt; 2000)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Features & Zones</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="hasZones"
                                                checked={filters.hasZones === true}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('hasZones', checked ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="hasZones">🗂️ Has Zones</Label>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="zoneCount">Zone Count</Label>
                                            <Input
                                                id="zoneCount"
                                                type="number"
                                                placeholder="Number of zones..."
                                                value={filters.zoneCount || ''}
                                                onChange={(e) => handleFilterChange('zoneCount', e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
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
                                    <CardTitle className="text-base">Warehouse Status</CardTitle>
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
                                            <Label htmlFor="isActive">✅ Active Warehouses</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isInactive"
                                                checked={filters.isActive === false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isActive', checked ? false : filters.isActive === true ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="isInactive">❌ Inactive Warehouses</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isMain"
                                                checked={filters.isMain === true}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('isMain', checked ? true : undefined)
                                                }
                                            />
                                            <Label htmlFor="isMain">🏢 Main Warehouses</Label>
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
                                                id="myWarehouses"
                                                checked={filters.myWarehouses || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('myWarehouses', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="myWarehouses">👤 My Warehouses</Label>
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
                                                id="newWarehouses"
                                                checked={filters.newWarehouses || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('newWarehouses', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="newWarehouses">✨ New Warehouses</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="largeWarehouses"
                                                checked={filters.largeWarehouses || false}
                                                onCheckedChange={(checked) => 
                                                    handleFilterChange('largeWarehouses', checked || undefined)
                                                }
                                            />
                                            <Label htmlFor="largeWarehouses">🏭 Large Warehouses</Label>
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
                            Search Warehouses
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default WarehouseAdvancedSearchDialog;