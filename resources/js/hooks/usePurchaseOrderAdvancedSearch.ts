import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

export interface PurchaseOrderAdvancedFilters {
    search?: string;
    status?: string;
    priority?: string;
    warehouse_id?: number;
    supplier_name?: string;
    po_number?: string;
    total_amount_min?: number;
    total_amount_max?: number;
    created_date_from?: string;
    created_date_to?: string;
    expected_delivery_from?: string;
    expected_delivery_to?: string;
    created_by?: number;
    approved_by?: number;
}

export interface SavedFilter {
    id: string;
    name: string;
    filters: PurchaseOrderAdvancedFilters;
    created_at: string;
}

interface UsePurchaseOrderAdvancedSearchProps {
    currentRoute: string;
    initialFilters?: PurchaseOrderAdvancedFilters;
}

export const usePurchaseOrderAdvancedSearch = ({
    currentRoute,
    initialFilters = {}
}: UsePurchaseOrderAdvancedSearchProps) => {
    const [filters, setFilters] = useState<PurchaseOrderAdvancedFilters>(initialFilters);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
        const saved = localStorage.getItem('purchase_order_saved_filters');
        return saved ? JSON.parse(saved) : [];
    });
    const [isSearching, setIsSearching] = useState(false);

    const applySearch = useCallback((newFilters: PurchaseOrderAdvancedFilters) => {
        setIsSearching(true);
        setFilters(newFilters);

        // Remove empty filters
        const cleanFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, value]) => 
                value !== '' && value !== null && value !== undefined
            )
        );

        router.get(currentRoute, cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            only: ['purchase_orders', 'hasAdvancedFilters'],
            onFinish: () => setIsSearching(false),
        });
    }, [currentRoute]);

    const removeFilter = useCallback((filterKey: string) => {
        const newFilters = { ...filters };
        delete newFilters[filterKey as keyof PurchaseOrderAdvancedFilters];
        applySearch(newFilters);
    }, [filters, applySearch]);

    const clearAllFilters = useCallback(() => {
        setFilters({});
        applySearch({});
    }, [applySearch]);

    const saveFilter = useCallback((name: string) => {
        if (!name.trim()) {
            console.error("Filter name is required");
            return;
        }

        const newFilter: SavedFilter = {
            id: Date.now().toString(),
            name: name.trim(),
            filters: { ...filters },
            created_at: new Date().toISOString(),
        };

        const updatedFilters = [...savedFilters, newFilter];
        setSavedFilters(updatedFilters);
        localStorage.setItem('purchase_order_saved_filters', JSON.stringify(updatedFilters));

        console.log(`Filter "${name}" has been saved successfully.`);
    }, [filters, savedFilters]);

    const loadSavedFilter = useCallback((savedFilter: SavedFilter) => {
        applySearch(savedFilter.filters);
        console.log(`Applied filter "${savedFilter.name}".`);
    }, [applySearch]);

    const deleteSavedFilter = useCallback((filterId: string) => {
        const updatedFilters = savedFilters.filter(f => f.id !== filterId);
        setSavedFilters(updatedFilters);
        localStorage.setItem('purchase_order_saved_filters', JSON.stringify(updatedFilters));
        
        console.log("Saved filter has been deleted.");
    }, [savedFilters]);

    const hasActiveFilters = useCallback(() => {
        return Object.keys(filters).some(key => filters[key as keyof PurchaseOrderAdvancedFilters]);
    }, [filters]);

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
        hasActiveFilters,
    };
};