import { Brand, Category } from "@/types";
import { ProductAdvancedFilters, ProductSavedFilter } from "@/types/Product/IProductAdvancedFilters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { BookmarkPlus, Package, PhilippinePeso, Search, Settings, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

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
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default ProductAdvancedSearchDialog;