import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { InventoryAdvancedFilters, InventorySavedFilter } from '@/types/Inventory/IInventoryAdvancedFilters';

interface UseInventoryAdvancedSearchProps {
    currentRoute: string;
    initialFilters?: InventoryAdvancedFilters;
}

export function useInventoryAdvancedSearch({ currentRoute, initialFilters = {} }: UseInventoryAdvancedSearchProps) {
    const [filters, setFilters] = useState<InventoryAdvancedFilters>(initialFilters);
    const [savedFilters, setSavedFilters] = useState<InventorySavedFilter[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('inventory-saved-filters');
        if (saved) {
            try {
                const parsedFilters = JSON.parse(saved);
                if (Array.isArray(parsedFilters)) {
                    setSavedFilters(parsedFilters);
                }
            } catch (error) {
                console.error('Error parsing saved inventory filters:', error);
            }
        }
    }, []);

    // Save filters to localStorage
    const saveSavedFilters = useCallback((filters: InventorySavedFilter[]) => {
        localStorage.setItem('inventory-saved-filters', JSON.stringify(filters));
    }, []);

    // Convert filters to query parameters for inventory search
    const filtersToQuery = useCallback((filters: InventoryAdvancedFilters) => {
        const query: Record<string, any> = {};

        // Text filters
        if (filters.globalSearch) query.globalSearch = filters.globalSearch;
        if (filters.productName) query.productName = filters.productName;
        if (filters.productSku) query.productSku = filters.productSku;
        if (filters.warehouseName) query.warehouseName = filters.warehouseName;
        if (filters.warehouseCode) query.warehouseCode = filters.warehouseCode;
        if (filters.notes) query.notes = filters.notes;

        // Array filters
        if (filters.productIds && filters.productIds.length > 0) {
            query.productIds = filters.productIds;
        }
        if (filters.categoryIds && filters.categoryIds.length > 0) {
            query.categoryIds = filters.categoryIds;
        }
        if (filters.brandIds && filters.brandIds.length > 0) {
            query.brandIds = filters.brandIds;
        }
        if (filters.warehouseIds && filters.warehouseIds.length > 0) {
            query.warehouseIds = filters.warehouseIds;
        }
        if (filters.stockStatus && filters.stockStatus.length > 0) {
            query.stockStatus = filters.stockStatus;
        }

        // Boolean filters
        if (filters.warehouseIsActive !== undefined) query.warehouseIsActive = filters.warehouseIsActive;
        if (filters.isLowStock !== undefined) query.isLowStock = filters.isLowStock;
        if (filters.isOutOfStock !== undefined) query.isOutOfStock = filters.isOutOfStock;
        if (filters.hasReservedStock !== undefined) query.hasReservedStock = filters.hasReservedStock;

        // Numeric filters
        if (filters.quantityOnHandMin !== undefined) query.quantityOnHandMin = filters.quantityOnHandMin;
        if (filters.quantityOnHandMax !== undefined) query.quantityOnHandMax = filters.quantityOnHandMax;
        if (filters.quantityReservedMin !== undefined) query.quantityReservedMin = filters.quantityReservedMin;
        if (filters.quantityReservedMax !== undefined) query.quantityReservedMax = filters.quantityReservedMax;
        if (filters.quantityAvailableMin !== undefined) query.quantityAvailableMin = filters.quantityAvailableMin;
        if (filters.quantityAvailableMax !== undefined) query.quantityAvailableMax = filters.quantityAvailableMax;
        if (filters.stockValueMin !== undefined) query.stockValueMin = filters.stockValueMin;
        if (filters.stockValueMax !== undefined) query.stockValueMax = filters.stockValueMax;

        // Date filters
        if (filters.createdAfter) query.createdAfter = filters.createdAfter;
        if (filters.createdBefore) query.createdBefore = filters.createdBefore;
        if (filters.updatedAfter) query.updatedAfter = filters.updatedAfter;
        if (filters.updatedBefore) query.updatedBefore = filters.updatedBefore;

        // Quick filters
        if (filters.myInventories) query.myInventories = filters.myInventories;
        if (filters.recentlyUpdated) query.recentlyUpdated = filters.recentlyUpdated;
        if (filters.newInventories) query.newInventories = filters.newInventories;
        if (filters.highValueInventories) query.highValueInventories = filters.highValueInventories;

        return query;
    }, []);

    // Apply search with filters
    const applySearch = useCallback((newFilters: InventoryAdvancedFilters) => {
        setIsSearching(true);
        setFilters(newFilters);

        const queryParams = filtersToQuery(newFilters);
        
        router.get(currentRoute, queryParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    }, [currentRoute, filtersToQuery]);

    // Remove specific filter
    const removeFilter = useCallback((key: keyof InventoryAdvancedFilters, value?: any) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        applySearch(newFilters);
    }, [filters, applySearch]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        applySearch({});
    }, [applySearch]);

    // Save current filter combination
    const saveFilter = useCallback((name: string, filtersToSave: InventoryAdvancedFilters) => {
        const newFilter: InventorySavedFilter = {
            id: Date.now().toString(),
            name,
            filters: filtersToSave,
            createdAt: new Date().toISOString(),
            usageCount: 1
        };
        
        const updatedFilters = [...savedFilters, newFilter];
        setSavedFilters(updatedFilters);
        saveSavedFilters(updatedFilters);
    }, [savedFilters, saveSavedFilters]);

    // Load saved filter
    const loadSavedFilter = useCallback((savedFilter: InventorySavedFilter) => {
        // Update usage count
        const updatedFilters = savedFilters.map(f => 
            f.id === savedFilter.id 
                ? { ...f, usageCount: (f.usageCount || 0) + 1 }
                : f
        );
        setSavedFilters(updatedFilters);
        saveSavedFilters(updatedFilters);
        
        applySearch(savedFilter.filters);
    }, [savedFilters, saveSavedFilters, applySearch]);

    // Delete saved filter
    const deleteSavedFilter = useCallback((filterId: string) => {
        const updatedFilters = savedFilters.filter(f => f.id !== filterId);
        setSavedFilters(updatedFilters);
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