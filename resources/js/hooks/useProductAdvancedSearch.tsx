// resources/js/hooks/useProductAdvancedSearch.tsx
import { useCallback, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { ProductAdvancedFilters, ProductSavedFilter } from '@/types/Product/IProductAdvancedFilters';

interface UseProductAdvancedSearchProps {
    currentRoute: string;
    initialFilters?: ProductAdvancedFilters;
}

export function useProductAdvancedSearch({ currentRoute, initialFilters = {} }: UseProductAdvancedSearchProps) {
    const [filters, setFilters] = useState<ProductAdvancedFilters>(initialFilters);
    const [savedFilters, setSavedFilters] = useState<ProductSavedFilter[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('product-saved-filters');
        if (saved) {
            try {
                const parsedFilters = JSON.parse(saved);
                setSavedFilters(parsedFilters);
            } catch (error) {
                console.error('Error loading saved product filters:', error);
                localStorage.removeItem('product-saved-filters');
            }
        }
    }, []);

    // Save filters to localStorage
    const saveSavedFilters = useCallback((filters: ProductSavedFilter[]) => {
        setSavedFilters(filters);
        localStorage.setItem('product-saved-filters', JSON.stringify(filters));
    }, []);

    // Convert filters to query parameters for product search
    const filtersToQuery = useCallback((filters: ProductAdvancedFilters) => {
        const query: Record<string, any> = {};

        // Text searches
        if (filters.globalSearch) query.global_search = filters.globalSearch;
        if (filters.name) query.name = filters.name;
        if (filters.sku) query.sku = filters.sku;
        if (filters.description) query.description = filters.description;
        if (filters.barcode) query.barcode = filters.barcode;

        // Categories and Brands
        if (filters.categoryIds?.length) query.categories = filters.categoryIds.join(',');
        if (filters.brandIds?.length) query.brands = filters.brandIds.join(',');

        // Price ranges
        if (filters.priceMin !== undefined) query.price_min = filters.priceMin;
        if (filters.priceMax !== undefined) query.price_max = filters.priceMax;
        if (filters.costPriceMin !== undefined) query.cost_price_min = filters.costPriceMin;
        if (filters.costPriceMax !== undefined) query.cost_price_max = filters.costPriceMax;

        // Stock levels
        if (filters.minStockMin !== undefined) query.min_stock_min = filters.minStockMin;
        if (filters.minStockMax !== undefined) query.min_stock_max = filters.minStockMax;
        if (filters.maxStockMin !== undefined) query.max_stock_min = filters.maxStockMin;
        if (filters.maxStockMax !== undefined) query.max_stock_max = filters.maxStockMax;

        // Status filters
        if (filters.isActive !== undefined) query.is_active = filters.isActive;
        if (filters.trackQuantity !== undefined) query.track_quantity = filters.trackQuantity;

        // Date ranges
        if (filters.createdAfter) query.created_after = filters.createdAfter;
        if (filters.createdBefore) query.created_before = filters.createdBefore;
        if (filters.updatedAfter) query.updated_after = filters.updatedAfter;
        if (filters.updatedBefore) query.updated_before = filters.updatedBefore;

        // Stock status
        if (filters.hasInventory !== undefined) query.has_inventory = filters.hasInventory;
        if (filters.isLowStock) query.is_low_stock = filters.isLowStock;
        if (filters.isOutOfStock) query.is_out_of_stock = filters.isOutOfStock;
        if (filters.isOverstock) query.is_overstock = filters.isOverstock;

        // Quick filters
        if (filters.myProducts) query.my_products = filters.myProducts;
        if (filters.recentlyUpdated) query.recently_updated = filters.recentlyUpdated;
        if (filters.newProducts) query.new_products = filters.newProducts;
        if (filters.expensiveProducts) query.expensive_products = filters.expensiveProducts;

        return query;
    }, []);

    // Apply search with filters
    const applySearch = useCallback((newFilters: ProductAdvancedFilters) => {
        setIsSearching(true);
        setFilters(newFilters);
        
        const queryParams = filtersToQuery(newFilters);
        
        router.get(currentRoute, queryParams, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    }, [currentRoute, filtersToQuery]);

    // Remove specific filter
    const removeFilter = useCallback((key: keyof ProductAdvancedFilters, value?: any) => {
        const newFilters = { ...filters };
        
        if (key === 'categoryIds' && value !== undefined) {
            newFilters.categoryIds = newFilters.categoryIds?.filter(id => id !== value);
            if (!newFilters.categoryIds?.length) delete newFilters.categoryIds;
        } else if (key === 'brandIds' && value !== undefined) {
            newFilters.brandIds = newFilters.brandIds?.filter(id => id !== value);
            if (!newFilters.brandIds?.length) delete newFilters.brandIds;
        } else {
            delete newFilters[key];
        }
        
        applySearch(newFilters);
    }, [filters, applySearch]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        applySearch({});
    }, [applySearch]);

    // Save current filter combination
    const saveFilter = useCallback((name: string, filtersToSave: ProductAdvancedFilters) => {
        const newSavedFilter: ProductSavedFilter = {
            id: Date.now().toString(),
            name,
            filters: filtersToSave,
            createdAt: new Date().toISOString(),
        };
        
        const updatedFilters = [...savedFilters, newSavedFilter];
        saveSavedFilters(updatedFilters);
    }, [savedFilters, saveSavedFilters]);

    // Load saved filter
    const loadSavedFilter = useCallback((savedFilter: ProductSavedFilter) => {
        // Update usage count if you want to track it
        const updatedFilters = savedFilters.map(f => 
            f.id === savedFilter.id 
                ? { ...f, usageCount: (f.usageCount || 0) + 1 }
                : f
        );
        saveSavedFilters(updatedFilters);
        
        // Apply the filters
        applySearch(savedFilter.filters);
    }, [savedFilters, saveSavedFilters, applySearch]);

    // Delete saved filter
    const deleteSavedFilter = useCallback((filterId: string) => {
        const updatedFilters = savedFilters.filter(f => f.id !== filterId);
        saveSavedFilters(updatedFilters);
    }, [savedFilters, saveSavedFilters]);

    return {
        filters,
        savedFilters,
        isSearching,
        applySearch,
        removeFilter,
        clearAllFilters,
        saveFilter,
        loadSavedFilter,
        deleteSavedFilter,
        hasActiveFilters: Object.keys(filters).length > 0,
    };
}