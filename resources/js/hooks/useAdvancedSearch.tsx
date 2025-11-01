// resources/js/hooks/useAdvancedSearch.tsx

import { useState, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AdvancedFilters, SavedFilter } from '@/types';
// import { AdvancedFilters, SavedFilter } from '@/Components/Inventory/AdvancedSearchDialog';

interface UseAdvancedSearchProps {
    currentRoute: string;
    initialFilters?: AdvancedFilters;
}

export function useAdvancedSearch({ currentRoute, initialFilters = {} }: UseAdvancedSearchProps) {
    const [filters, setFilters] = useState<AdvancedFilters>(initialFilters);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('stock-transfer-saved-filters');
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to parse saved filters:', error);
            }
        }
    }, []);

    // Save filters to localStorage
    const saveSavedFilters = useCallback((filters: SavedFilter[]) => {
        setSavedFilters(filters);
        localStorage.setItem('stock-transfer-saved-filters', JSON.stringify(filters));
    }, []);

    // Convert filters to query parameters
    const filtersToQuery = useCallback((filters: AdvancedFilters) => {
        const query: Record<string, any> = {};

        // Text filters
        if (filters.globalSearch) query.global_search = filters.globalSearch;
        if (filters.referenceNumber) query.reference_number = filters.referenceNumber;
        if (filters.notes) query.notes = filters.notes;

        // Array filters
        if (filters.statuses?.length) query.statuses = filters.statuses.join(',');
        if (filters.fromWarehouseIds?.length) query.from_warehouses = filters.fromWarehouseIds.join(',');
        if (filters.toWarehouseIds?.length) query.to_warehouses = filters.toWarehouseIds.join(',');
        if (filters.productIds?.length) query.products = filters.productIds.join(',');

        // Number filters
        if (filters.quantityMin !== undefined) query.quantity_min = filters.quantityMin;
        if (filters.quantityMax !== undefined) query.quantity_max = filters.quantityMax;

        // Date filters
        if (filters.createdAfter) query.created_after = filters.createdAfter;
        if (filters.createdBefore) query.created_before = filters.createdBefore;
        if (filters.initiatedAfter) query.initiated_after = filters.initiatedAfter;
        if (filters.initiatedBefore) query.initiated_before = filters.initiatedBefore;

        // Boolean filters
        if (filters.isUrgent) query.is_urgent = '1';
        if (filters.isOverdue) query.is_overdue = '1';
        if (filters.hasNotes) query.has_notes = '1';
        if (filters.myTransfers) query.my_transfers = '1';

        return query;
    }, []);

    // Apply search with filters
    const applySearch = useCallback((newFilters: AdvancedFilters) => {
        setFilters(newFilters);
        setIsSearching(true);

        const query = filtersToQuery(newFilters);
        
        router.get(currentRoute, query, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsSearching(false),
        });
    }, [currentRoute, filtersToQuery]);

    // Remove specific filter
    const removeFilter = useCallback((key: keyof AdvancedFilters, value?: any) => {
        const newFilters = { ...filters };
        
        if (value !== undefined && Array.isArray(newFilters[key])) {
            // Remove specific value from array
            const arrayKey = key as keyof Pick<AdvancedFilters, 'statuses' | 'fromWarehouseIds' | 'toWarehouseIds' | 'productIds'>;
            newFilters[arrayKey] = (newFilters[arrayKey] as any[])?.filter(item => item !== value);
            if ((newFilters[arrayKey] as any[])?.length === 0) {
                delete newFilters[arrayKey];
            }
        } else {
            // Remove entire filter
            delete newFilters[key];
        }

        applySearch(newFilters);
    }, [filters, applySearch]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        applySearch({});
    }, [applySearch]);

    // Save current filter combination
    const saveFilter = useCallback((name: string, filtersToSave: AdvancedFilters) => {
        const newSavedFilter: SavedFilter = {
            id: Date.now().toString(),
            name,
            filters: filtersToSave,
            createdAt: new Date().toISOString().split('T')[0],
            usageCount: 0,
        };

        const updatedSavedFilters = [...savedFilters, newSavedFilter];
        saveSavedFilters(updatedSavedFilters);
    }, [savedFilters, saveSavedFilters]);

    // Load saved filter
    const loadSavedFilter = useCallback((savedFilter: SavedFilter) => {
        // Increment usage count
        const updatedSavedFilters = savedFilters.map(sf => 
            sf.id === savedFilter.id 
                ? { ...sf, usageCount: sf.usageCount + 1 }
                : sf
        );
        saveSavedFilters(updatedSavedFilters);

        // Apply the filter
        applySearch(savedFilter.filters);
    }, [savedFilters, saveSavedFilters, applySearch]);

    // Delete saved filter
    const deleteSavedFilter = useCallback((filterId: string) => {
        const updatedSavedFilters = savedFilters.filter(sf => sf.id !== filterId);
        saveSavedFilters(updatedSavedFilters);
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