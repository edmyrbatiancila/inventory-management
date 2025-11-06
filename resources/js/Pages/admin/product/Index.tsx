import CustomPagination from "@/Components/CustomPagination";
import ProductAdvancedSearchDialog from "@/Components/Products/ProductAdvancedSearchDialog";
import ProductFilterChips from "@/Components/Products/ProductFilterChips";
import ProductSearchStats from "@/Components/Products/ProductSearchStats";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { useProductAdvancedSearch } from "@/hooks/useProductAdvancedSearch";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Brand, Category, PageProps, PaginatedResponse } from "@/types";
import { Product, ProductFilters, ProductAdvancedSearchProps } from "@/types/Product/IProduct";
import { ProductAdvancedFilters } from "@/types/Product/IProductAdvancedFilters";
import { Head, router, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Barcode, CheckCircle2, Edit2, Filter, Plus, Search, Trash2, View, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface IProductIndexProps {
    products: PaginatedResponse<Product>;
    categories: Category[];
    brands: Brand[];
    sort?: string;
    searchStats?: ProductAdvancedSearchProps;
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
        error?: string;
    };
};

const ProductIndex = ({
    products,
    categories,
    brands,
    sort: initialSort = 'newest',
    searchStats
}: IProductIndexProps) => {

    const { props } = usePage<InertiaPageProps>();

    const [search, setSearch] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [sort, setSort] = useState(initialSort);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Advanced Search hook - get initial filters from URL parameters
    const getInitialFilters = (): ProductAdvancedFilters => {
        const params = new URLSearchParams(window.location.search);
        const filters: ProductAdvancedFilters = {};
        
        if (params.get('global_search')) filters.globalSearch = params.get('global_search') || undefined;
        if (params.get('name')) filters.name = params.get('name') || undefined;
        if (params.get('sku')) filters.sku = params.get('sku') || undefined;
        if (params.get('categories')) {
            filters.categoryIds = params.get('categories')?.split(',').map(Number).filter(Boolean);
        }
        if (params.get('brands')) {
            filters.brandIds = params.get('brands')?.split(',').map(Number).filter(Boolean);
        }
        if (params.get('price_min')) filters.priceMin = parseFloat(params.get('price_min') || '0');
        if (params.get('price_max')) filters.priceMax = parseFloat(params.get('price_max') || '0');
        if (params.get('is_active')) filters.isActive = params.get('is_active') === 'true';
        
        return filters;
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
        hasActiveFilters,
    } = useProductAdvancedSearch({
        currentRoute: route('admin.products.index'),
        initialFilters: getInitialFilters(),
    });

    const handleAdvancedSearch = (filters: ProductAdvancedFilters) => {
        applySearch(filters);
        setShowAdvancedSearch(false);
    };

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        setIsSearching(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('admin.products.index'), { search: value, sort }, { preserveState: true, replace: true });
            setIsSearching(false);
        }, 500);
    };

    // Handle filter/sort change for shadcn UI Select
    const handleSortChange = (value: string) => {
        setSort(value);
        router.get(route('admin.products.index'), { search, sort: value }, { preserveState: true, replace: true });
    };

    // Clear search
    const handleClear = () => {
        setSearch('');
        setSort('newest');
        router.get(route('admin.products.index'), {}, { preserveState: true, replace: true });
    };

    const handleDeleteProduct = (productId: number) => {
        router.delete(route('admin.products.destroy', productId), {
            preserveScroll: true,
            onSuccess: () => {
                // Success message will be handled by the flash message
            },
            onError: () => {
                toast.error('Failed to delete product', {
                    description: 'The product could not be deleted. It may be in use.',
                    duration: 4000,
                });
            }
        });
    };

    useEffect(() => {
        if (props.flash && props.flash.success) {
            toast.success(props.flash.success, {
                description: 'Product operation completed successfully.',
                duration: 4000,
                style: { fontWeight: 'bold', fontSize: '1.1rem' },
                icon: <CheckCircle2 className="text-green-600 w-6 h-6" />,
            });
        }
        if (props.flash && props.flash.error) {
            toast.error(props.flash.error, {
                description: 'Please try again or contact support if the problem persists.',
                duration: 4000,
                style: { fontWeight: 'bold', fontSize: '1.1rem' },
            });
        }
    }, [props.flash]);

    return (
        <AuthenticatedLayout
            header={(
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight flex items-center gap-2">
                        <Barcode className="w-7 h-7 text-blue-600" />
                        Product Management
                    </h2>
                </motion.div>
            )}
        >
            <Head title="Products" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="py-12"
            >
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Search Stats */}
                    {searchStats && hasActiveFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mb-6"
                        >
                            <ProductSearchStats
                                totalResults={searchStats.totalResults}
                                statusCounts={searchStats.statusCounts}
                                priceRanges={searchStats.priceRanges}
                                isFiltered={hasActiveFilters}
                                searchTime={searchStats.searchTime}
                            />
                        </motion.div>
                    )}

                    {/* Filter Chips */}
                    {hasActiveFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="mb-6"
                        >
                            <ProductFilterChips
                                filters={advancedFilters}
                                onRemoveFilter={removeFilter}
                                onClearAll={clearAllFilters}
                                categories={categories}
                                brands={brands}
                            />
                        </motion.div>
                    )}

                    {/* Filter/Search UI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                    >
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full max-w-xs shadow-sm focus:ring-2 focus:ring-blue-200"
                                aria-label="Search products"
                            />
                            {search && (
                                <motion.div whileHover={{ scale: 1.1 }}>
                                    <Button size="icon" variant="ghost" onClick={handleClear} title="Clear search">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
                            <motion.div whileHover={{ scale: 1.03 }}>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAdvancedSearch(true)}
                                    className={`shadow-sm ${hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Advanced Search
                                    {hasActiveFilters && (
                                        <span className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                            {Object.keys(advancedFilters).length}
                                        </span>
                                    )}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }}>
                                <Select value={sort} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[180px] shadow-sm focus:ring-2 focus:ring-blue-200">
                                        <SelectValue placeholder="Filter products" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Select Filter</SelectLabel>
                                            <SelectItem value="newest">Newest</SelectItem>
                                            <SelectItem value="oldest">Oldest</SelectItem>
                                            <SelectItem value="az">A-Z</SelectItem>
                                            <SelectItem value="za">Z-A</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>
                        <motion.div whileHover={{ scale: 1.04 }}>
                            <Button
                                onClick={() => router.visit(route('admin.products.create'))}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-150"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <Card className="shadow-lg border border-blue-100 rounded-xl bg-white/90">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100 bg-blue-50/60 rounded-t-xl">
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    <Barcode className="w-6 h-6 text-blue-600" />
                                    Products <span className="text-blue-400 font-normal">({products.total})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence mode="wait">
                                {products.data.length > 0 ? (
                                    <motion.div
                                        key="table"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-16">#</TableHead>
                                                    <TableHead className="w-48">Product</TableHead>
                                                    <TableHead className="w-32">Category</TableHead>
                                                    <TableHead className="w-32">Brand</TableHead>
                                                    <TableHead className="w-24">Price</TableHead>
                                                    <TableHead className="w-20">Status</TableHead>
                                                    <TableHead className="w-32 text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {products.data.map((product, idx) => {
                                                const rowNumber = (products.current_page - 1) * products.per_page + idx + 1;

                                                return (
                                                    <motion.tr
                                                        key={product.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                        className="hover:bg-blue-50/60 transition-colors"
                                                    >
                                                        <TableCell className="w-16 font-semibold text-blue-700">{rowNumber}</TableCell>
                                                        <TableCell className="w-48">
                                                            <div>
                                                                <div className="font-medium truncate" title={product.name}>
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 truncate" title={product.sku}>
                                                                    SKU: {product.sku}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-32 text-gray-600">
                                                            <div className="truncate" title={product.category?.name || "No category"}>
                                                                {product.category?.name || "No category"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-32 text-gray-600">
                                                            <div className="truncate" title={product.brand?.name || "No brand"}>
                                                                {product.brand?.name || "No brand"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-24 font-medium">
                                                            ₱{product.price}
                                                        </TableCell>
                                                        <TableCell className="w-20">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                product.is_active 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {product.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="w-32">
                                                            <div className="flex gap-2 justify-center">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="View Product Details"
                                                                    onClick={() => router.visit(route('admin.products.show', product.id))}
                                                                >
                                                                    <View className="w-4 h-4" />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="Edit Product Details"
                                                                    onClick={() => router.visit(route('admin.products.edit', product.id))}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </motion.button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.15 }}
                                                                            className="p-2 rounded hover:bg-red-100 text-red-600"
                                                                            title="Delete Product"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete "{product.name}"? 
                                                                                This action cannot be undone and will permanently remove this product.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction 
                                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                );
                                            })}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-6">
                                            <CustomPagination data={products} />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div 
                                            animate={{ scale: [1, 1.1, 1] }} 
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <Barcode className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                                        </motion.div>
                                        <h3 className="text-xl font-semibold mb-2 text-blue-700">No products found</h3>
                                        <p className="text-gray-500 mb-4">Get started by creating your first product.</p>
                                        <motion.div whileHover={{ scale: 1.08 }}>
                                            <Button
                                                onClick={() => router.visit(route('admin.products.create'))}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Product
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* Advanced Search Dialog */}
            <ProductAdvancedSearchDialog
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                onSearch={handleAdvancedSearch}
                categories={categories}
                brands={brands}
                currentFilters={advancedFilters}
                savedFilters={savedFilters}
                onSaveFilter={saveFilter}
                onLoadFilter={loadSavedFilter}
            />
        </AuthenticatedLayout>
    );
};

export default ProductIndex;