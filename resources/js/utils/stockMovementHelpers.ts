import { router } from "@inertiajs/react";

// Pure utility functions for stock movement operations
export const stockMovementUtils = {
    // Handle search with debounce
    handleSearch: (
        value: string,
        sort: string,
        setSearch: (value: string) => void,
        setIsSearching: (loading: boolean) => void,
        debounceRef: React.MutableRefObject<NodeJS.Timeout | null>
    ) => {
        setSearch(value);
        setIsSearching(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            router.get(
                route('admin.stock-movements.index'), 
                { search: value, sort }, 
                { preserveState: true, replace: true }
            );
            setIsSearching(false);
        }, 500);
    },

    // Handle sort change
    handleSort: (
        value: string,
        search: string,
        setSort: (value: string) => void
    ) => {
        setSort(value);

        router.get(
            route('admin.stock-movements.index'), 
            { search, sort: value }, 
            { preserveState: true, replace: true }
        );
    },

    // Clear all filters
    clearFilters: (
        setSearch: (value: string) => void,
        setSort: (value: string) => void
    ) => {
        setSearch('');
        setSort('newest');

        router.get(
            route('admin.stock-movements.index'), 
            {}, 
            { preserveState: true, replace: true }
        );
    }
};

// Alternative: Individual exported functions (if you prefer)
export const handleStockMovementSearch = stockMovementUtils.handleSearch;
export const handleStockMovementSort = stockMovementUtils.handleSort;
export const clearStockMovementFilters = stockMovementUtils.clearFilters;