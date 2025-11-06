import { useCallback, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { WarehouseAdvancedFilters, WarehouseSavedFilter } from '@/types/Warehouse/IWarehouseAdvancedFilters';

interface UseWarehouseAdvancedSearchProps {
    currentRoute: string;
    initialFilters?: WarehouseAdvancedFilters;
}

export function useWarehouseAdvancedSearch({ currentRoute, initialFilters = {} }: UseWarehouseAdvancedSearchProps) {
    const [filters, setFilters] = useState<WarehouseAdvancedFilters>(initialFilters);
    const [savedFilters, setSavedFilters] = useState<WarehouseSavedFilter[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load saved filters from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('warehouse-saved-filters');
        if (saved) {
            try {
                const parsedFilters = JSON.parse(saved);
                setSavedFilters(parsedFilters);
            } catch (error) {
                console.error('Error loading saved warehouse filters:', error);
                localStorage.removeItem('warehouse-saved-filters');
            }
        }
    }, []);

    // Save filters to localStorage
    const saveSavedFilters = useCallback((filters: WarehouseSavedFilter[]) => {
        setSavedFilters(filters);
        localStorage.setItem('warehouse-saved-filters', JSON.stringify(filters));
    }, []);

    // Convert filters to query parameters for warehouse search
    const filtersToQuery = useCallback((filters: WarehouseAdvancedFilters) => {
        const query: Record<string, any> = {};

        // Text searches
        if (filters.globalSearch) query.global_search = filters.globalSearch;
        if (filters.name) query.name = filters.name;
        if (filters.code) query.code = filters.code;
        if (filters.description) query.description = filters.description;
        if (filters.address) query.address = filters.address;
        if (filters.city) query.city = filters.city;
        if (filters.state) query.state = filters.state;
        if (filters.country) query.country = filters.country;
        if (filters.postalCode) query.postal_code = filters.postalCode;

        // Contact filters
        if (filters.contactPerson) query.contact_person = filters.contactPerson;
        if (filters.phone) query.phone = filters.phone;
        if (filters.email) query.email = filters.email;

        // Capacity ranges
        if (filters.capacityMin !== undefined) query.capacity_min = filters.capacityMin;
        if (filters.capacityMax !== undefined) query.capacity_max = filters.capacityMax;

        // Status filters
        if (filters.isActive !== undefined) query.is_active = filters.isActive;
        if (filters.isMain !== undefined) query.is_main = filters.isMain;

        // Date ranges
        if (filters.createdAfter) query.created_after = filters.createdAfter;
        if (filters.createdBefore) query.created_before = filters.createdBefore;
        if (filters.updatedAfter) query.updated_after = filters.updatedAfter;
        if (filters.updatedBefore) query.updated_before = filters.updatedBefore;

        // Location filters
        if (filters.hasZones !== undefined) query.has_zones = filters.hasZones;
        if (filters.zoneCount !== undefined) query.zone_count = filters.zoneCount;

        // Quick filters
        if (filters.myWarehouses) query.my_warehouses = filters.myWarehouses;
        if (filters.recentlyUpdated) query.recently_updated = filters.recentlyUpdated;
        if (filters.newWarehouses) query.new_warehouses = filters.newWarehouses;
        if (filters.largeWarehouses) query.large_warehouses = filters.largeWarehouses;

        return query;
    }, []);

    // Apply search with filters
    const applySearch = useCallback((newFilters: WarehouseAdvancedFilters) => {
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
    const removeFilter = useCallback((key: keyof WarehouseAdvancedFilters, value?: any) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        applySearch(newFilters);
    }, [filters, applySearch]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        applySearch({});
    }, [applySearch]);

    // Save current filter combination
    const saveFilter = useCallback((name: string, filtersToSave: WarehouseAdvancedFilters) => {
        const newSavedFilter: WarehouseSavedFilter = {
            id: Date.now().toString(),
            name,
            filters: filtersToSave,
            createdAt: new Date().toISOString(),
        };
        
        const updatedFilters = [...savedFilters, newSavedFilter];
        saveSavedFilters(updatedFilters);
    }, [savedFilters, saveSavedFilters]);

    // Load saved filter
    const loadSavedFilter = useCallback((savedFilter: WarehouseSavedFilter) => {
        const updatedFilters = savedFilters.map(f => 
            f.id === savedFilter.id 
                ? { ...f, usageCount: (f.usageCount || 0) + 1 }
                : f
        );
        saveSavedFilters(updatedFilters);
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