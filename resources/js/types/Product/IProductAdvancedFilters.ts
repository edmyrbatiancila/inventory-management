export interface ProductAdvancedFilters {
    // Text Search Filters
    globalSearch?: string;
    name?: string;
    sku?: string;
    description?: string;
    barcode?: string;

    // Category & Brand Filters
    categoryIds?: number[];
    brandIds?: number[];

    // Price Range Filters
    priceMin?: number;
    priceMax?: number;
    costPriceMin?: number;
    costPriceMax?: number;

    // Stock Level Filters
    minStockMin?: number;
    minStockMax?: number;
    maxStockMin?: number;
    maxStockMax?: number;

    // Status Filters
    isActive?: boolean;
    trackQuantity?: boolean;

    // Date Filters
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;

    // Stock Status Filters
    hasInventory?: boolean;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    isOverstock?: boolean;

    // Quick Filters
    myProducts?: boolean; // If you track who created products
    recentlyUpdated?: boolean;
    newProducts?: boolean;
    expensiveProducts?: boolean; // > $100 for example
}

export interface ProductSavedFilter {
    id: string;
    name: string;
    filters: ProductAdvancedFilters;
    createdAt: string;
}