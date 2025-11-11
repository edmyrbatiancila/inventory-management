import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { StockMovementAdvancedFilters, StockMovementSavedFilter } from '@/types/StockMovement/IStockMovementAdvancedFilters';
// import { StockMovementAdvancedFilters, StockMovementSavedFilter } from '@/types/StockMovement/IStockMovementAdvancedFilters';

interface UseStockMovementAdvancedSearchProps {
    currentRoute: string;
    initialFilters?: StockMovementAdvancedFilters;
}

export function useStockMovementAdvancedSearch({ 
    currentRoute, 
    initialFilters = {} 
}: UseStockMovementAdvancedSearchProps) {
    const [filters, setFilters] = useState<StockMovementAdvancedFilters>(initialFilters);
    const [savedFilters, setSavedFilters] = useState<StockMovementSavedFilter[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('stock-movement-saved-filters');
        if (saved) {
            try {
                const parsedFilters = JSON.parse(saved);
                if (Array.isArray(parsedFilters)) {
                    setSavedFilters(parsedFilters);
                }
            } catch (error) {
                console.error('Error parsing saved stock movement filters:', error);
            }
        }
    }, []);

    // Save filters to localStorage
    const saveSavedFilters = useCallback((filters: StockMovementSavedFilter[]) => {
        localStorage.setItem('stock-movement-saved-filters', JSON.stringify(filters));
    }, []);

    // Convert filters to query parameters
    const filtersToQuery = useCallback((filters: StockMovementAdvancedFilters) => {
        const query: Record<string, any> = {};

        // Text filters
        if (filters.globalSearch) query.globalSearch = filters.globalSearch;
        if (filters.referenceNumber) query.referenceNumber = filters.referenceNumber;
        if (filters.reason) query.reason = filters.reason;
        if (filters.notes) query.notes = filters.notes;
        if (filters.productName) query.productName = filters.productName;
        if (filters.productSku) query.productSku = filters.productSku;
        if (filters.warehouseName) query.warehouseName = filters.warehouseName;
        if (filters.userName) query.userName = filters.userName;

        // Array filters
        if (filters.movementTypes && filters.movementTypes.length > 0) {
            query.movementTypes = filters.movementTypes;
        }
        if (filters.statuses && filters.statuses.length > 0) {
            query.statuses = filters.statuses;
        }
        if (filters.productIds && filters.productIds.length > 0) {
            query.productIds = filters.productIds;
        }
        if (filters.warehouseIds && filters.warehouseIds.length > 0) {
            query.warehouseIds = filters.warehouseIds;
        }
        if (filters.userIds && filters.userIds.length > 0) {
            query.userIds = filters.userIds;
        }
        if (filters.relatedDocumentTypes && filters.relatedDocumentTypes.length > 0) {
            query.relatedDocumentTypes = filters.relatedDocumentTypes;
        }

        // Numeric filters
        if (filters.quantityMovedMin !== undefined) query.quantityMovedMin = filters.quantityMovedMin;
        if (filters.quantityMovedMax !== undefined) query.quantityMovedMax = filters.quantityMovedMax;
        if (filters.quantityBeforeMin !== undefined) query.quantityBeforeMin = filters.quantityBeforeMin;
        if (filters.quantityBeforeMax !== undefined) query.quantityBeforeMax = filters.quantityBeforeMax;
        if (filters.quantityAfterMin !== undefined) query.quantityAfterMin = filters.quantityAfterMin;
        if (filters.quantityAfterMax !== undefined) query.quantityAfterMax = filters.quantityAfterMax;
        if (filters.unitCostMin !== undefined) query.unitCostMin = filters.unitCostMin;
        if (filters.unitCostMax !== undefined) query.unitCostMax = filters.unitCostMax;
        if (filters.totalValueMin !== undefined) query.totalValueMin = filters.totalValueMin;
        if (filters.totalValueMax !== undefined) query.totalValueMax = filters.totalValueMax;

        // Date filters
        if (filters.createdAfter) query.createdAfter = filters.createdAfter;
        if (filters.createdBefore) query.createdBefore = filters.createdBefore;
        if (filters.approvedAfter) query.approvedAfter = filters.approvedAfter;
        if (filters.approvedBefore) query.approvedBefore = filters.approvedBefore;

        // Movement direction
        if (filters.movementDirection && filters.movementDirection !== 'all') {
            query.movementDirection = filters.movementDirection;
        }

        // Boolean filters
        if (filters.myMovements !== undefined) query.myMovements = filters.myMovements;
        if (filters.recentMovements !== undefined) query.recentMovements = filters.recentMovements;
        if (filters.pendingApproval !== undefined) query.pendingApproval = filters.pendingApproval;
        if (filters.highValueMovements !== undefined) query.highValueMovements = filters.highValueMovements;
        if (filters.hasApprover !== undefined) query.hasApprover = filters.hasApprover;
        if (filters.hasDocumentReference !== undefined) query.hasDocumentReference = filters.hasDocumentReference;

        return query;
    }, []);

    // Apply search with filters
    const applySearch = useCallback((newFilters: StockMovementAdvancedFilters) => {
        setIsSearching(true);
        setFilters(newFilters);

        const queryParams = filtersToQuery(newFilters);
        
        router.get(currentRoute, queryParams, {
            preserveState: true,
            onFinish: () => setIsSearching(false),
        });
    }, [currentRoute, filtersToQuery]);

    // Remove specific filter
    const removeFilter = useCallback((key: keyof StockMovementAdvancedFilters, value?: any) => {
        const newFilters = { ...filters };
        
        if (Array.isArray(newFilters[key]) && value !== undefined) {
            // For array filters, remove specific value
            newFilters[key] = (newFilters[key] as any[]).filter((item: any) => item !== value);
            if ((newFilters[key] as any[]).length === 0) {
                delete newFilters[key];
            }
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
    const saveFilter = useCallback((name: string, filtersToSave: StockMovementAdvancedFilters) => {
        const newFilter: StockMovementSavedFilter = {
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
    const loadSavedFilter = useCallback((savedFilter: StockMovementSavedFilter) => {
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