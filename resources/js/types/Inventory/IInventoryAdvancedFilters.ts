export interface InventoryAdvancedFilters {
    // Text Search Filters
    globalSearch?: string;
    productName?: string;
    productSku?: string;
    warehouseName?: string;
    warehouseCode?: string;
    notes?: string;

    // Product Filters
    productIds?: number[];
    categoryIds?: number[];
    brandIds?: number[];

    // Warehouse Filters
    warehouseIds?: number[];
    warehouseIsActive?: boolean;

    // Quantity Filters
    quantityOnHandMin?: number;
    quantityOnHandMax?: number;
    quantityReservedMin?: number;
    quantityReservedMax?: number;
    quantityAvailableMin?: number;
    quantityAvailableMax?: number;

    // Stock Status Filters
    stockStatus?: ('healthy' | 'low' | 'critical' | 'out_of_stock')[];
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    hasReservedStock?: boolean;

    // Date Filters
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;

    // Value Filters
    stockValueMin?: number;
    stockValueMax?: number;

    // Quick Filters
    myInventories?: boolean;
    recentlyUpdated?: boolean;
    newInventories?: boolean;
    highValueInventories?: boolean;
}

export interface InventorySavedFilter {
    id: string;
    name: string;
    filters: InventoryAdvancedFilters;
    createdAt: string;
    usageCount?: number;
}

export interface InventoryAdvancedSearchProps {
    totalResults: number;
    stockCounts: {
        healthy: number;
        low: number;
        outOfStock: number;
        withReservation: number;
        highValue: number;
    };
    quantityRanges: {
        zero: number;
        low: number;     // 1-50
        medium: number;  // 51-200
        high: number;    // 200+
    };
    searchTime?: number;
}