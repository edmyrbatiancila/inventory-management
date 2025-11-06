export interface WarehouseAdvancedFilters {
    // Text Search Filters
    globalSearch?: string;
    name?: string;
    code?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;

    // Contact Filters
    contactPerson?: string;
    phone?: string;
    email?: string;

    // Capacity & Storage Filters
    capacityMin?: number;
    capacityMax?: number;
    
    // Status Filters
    isActive?: boolean;
    isMain?: boolean;

    // Date Filters
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;

    // Location & Zone Filters
    hasZones?: boolean;
    zoneCount?: number;

    // Quick Filters
    myWarehouses?: boolean;
    recentlyUpdated?: boolean;
    newWarehouses?: boolean;
    largeWarehouses?: boolean; // > 1000 capacity
}

export interface WarehouseSavedFilter {
    id: string;
    name: string;
    filters: WarehouseAdvancedFilters;
    createdAt: string;
    usageCount?: number;
}

export interface WarehouseAdvancedSearchProps {
    totalResults: number;
    statusCounts: {
        active: number;
        inactive: number;
        main: number;
        branch: number;
        withZones: number;
    };
    capacityRanges: {
        small: number;    // < 500
        medium: number;   // 500-2000
        large: number;    // > 2000
    };
    searchTime?: number;
}