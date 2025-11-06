export interface Warehouse {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    full_address?: string;
}

export interface WarehouseFilters {
    search?:string;
    is_active?: boolean;
    city?: string;
    country?: string;
    sort?: string;
    per_page?: number;
}

export interface WarehouseWithRelations extends Warehouse {
    inventories_count?: number;
    products_count?: number;
    total_stock?: number;
    full_address?: string; // This matches the getFullAddressAttribute in your model
}

export interface WarehouseAnalytics {
    warehouse_id: number;
    warehouse_name: string;
    total_products: number;
    total_stock: number;
    total_reserved: number;
    total_available: number;
    utilization_rate: number;
}

export interface WarehouseWithAnalytics extends Warehouse {
    inventories_count?: number;
    total_stock?: number;
}

export interface WarehouseAdvancedSearchProps {
    totalResults: number;
    statusCounts: {
        active: number;
        inactive: number;
        main: number;
        branch: number;
        withPhone?: number;
        withEmail?: number;
        withZones?: number;
    };
    capacityRanges: {
        small: number;    // < 500
        medium: number;   // 500-2000
        large: number;    // > 2000
    };
    searchTime?: number;
}