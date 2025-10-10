import ProductsFilterSection from "@/Components/Products/ProductsFilterSection";
import ProductsTable from "@/Components/Products/ProductsTable";
import ProductStatistics from "@/Components/Products/ProductStatistics";
import { Button } from "@/Components/ui/button";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Brand, Category, PageProps, PaginatedResponse } from "@/types";
import { Product, ProductFilters } from "@/types/Product/IProduct";
import { Head, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { Barcode, CheckCircle2, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface IProductIndexProps {
    products: PaginatedResponse<Product>;
    categories: Category[];
    brands: Brand[];
    filters?: ProductFilters;
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
    filters
}: IProductIndexProps) => {

    // Search and filtering state
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || '');
    const [selectedBrand, setSelectedBrand] = useState(filters?.brand_id || '');
    const [statusFilter, setStatusFilter] = useState(filters?.is_active || '');
    const [sortBy, setSortBy] = useState(filters?.sort || 'newest');
    const [currentFilters, setCurrentFilters] = useState<ProductFilters>(filters || {});

    // Refs
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    // Debounce ref for search
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Page props for flash messages
    const { props } = usePage<InertiaPageProps>();

    // Navigation Handlers
    const handleCreateNewProduct = () => {
        router.visit(route('admin.products.cresate'));
    };

    const handleEdit = (productId: number) => {
        router.visit(route('admin.products.edit', productId));
    };

    const handleView = (productId: number) => {
        router.visit(route('admin.products.show', productId))
    };

    // Delete Handler
    const handleDeleteProduct = (productId: number) => {
        router.delete(route('admin.products.destroy', productId), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Product deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete product', {
                    description: 'The product could not be deleted. It may be in use.',
                    duration: 4000
                });
            }
        });
    };

    // Search Handler with Debounce
    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            const newFilters = { ...currentFilters, search: searchTerm, page: 1 };
            setCurrentFilters(newFilters);

            router.get(route('admin.products.index'), newFilters, {
                preserveState: true,
                replace: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            });
        }, 500),
        [currentFilters]
    );

    // Filter Handlers
    const handleFilterChange = (filterKey: keyof ProductFilters, value: any) => {
        const newFilters = { ...currentFilters, [filterKey]: value, page: 1 };
        setCurrentFilters(newFilters);
        
        router.get(route('admin.products.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        const clearedFilters = { per_page: 15 };
        setCurrentFilters(clearedFilters);
        setSearch('');
        
        router.get(route('admin.products.index'), clearedFilters, {
            preserveState: true,
            replace: true,
        });
    };

    // Search Input Handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
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
        <Authenticated
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                            <Barcode className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900">
                                Product Management
                            </h2>
                            <p className="text-sm text-gray-600">
                                Manage your inventory products and track stock levels
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={ handleCreateNewProduct }
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Product
                    </Button>
                </motion.div>
            }
        >
            <Head title="Product Management" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Statistics Cards Section */}
                    <ProductStatistics 
                        totalProducts={ products.total }
                        activeProducts={ products.data.filter(p => p.is_active).length }
                        lowStockItems={ products.data.filter(p => p.inventories_count < p.min_stock_level).length }
                        categoriesCount={ categories.length }
                    />

                    {/* Filters and Search Section */}
                    <ProductsFilterSection 
                        onSearchInputRef={ searchInputRef }
                        onValue={ search }
                        onSearchChange={ handleSearchChange }
                        onSelectValueCategory={ currentFilters.category_id?.toString() || '' }
                        onSelectChangeCategory={ (value) => handleFilterChange('category_id', value ? parseInt(value) : undefined) }
                        categories={ categories }
                        onSelectValueBrand={ currentFilters.brand_id?.toString() || "" }
                        onSelectChangeBrand={ (value) => handleFilterChange('brand_id', value ? parseInt(value) : undefined) }
                        brands={ brands }
                        onSelectValueStatus={ currentFilters.is_active?.toString() || "" }
                        onSelectChangeStatus={ (value) => 
                            handleFilterChange('is_active', value === "" ? undefined : value === "true") 
                        }
                        onHandleClearFilters={ handleClearFilters }
                    />

                    {/* Products Table Section */}
                    <ProductsTable 
                        products={ products }
                        onHandleView={ handleView }
                        onHandleEdit={ handleEdit }
                        onHandleDelete={ handleDeleteProduct }
                        currentFilters={ currentFilters }
                        handleClearFilters={ handleClearFilters }
                        handleCreate={ handleCreateNewProduct }
                    />

                    {/* Pagination Section */}
                    {renderPagination()}
                </div>
            </div>
        </Authenticated>
    );
}

export default ProductIndex;