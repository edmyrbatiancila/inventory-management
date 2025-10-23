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