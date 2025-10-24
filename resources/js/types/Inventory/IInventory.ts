import { Product } from "../Product/IProduct";
import { Warehouse } from "../Warehouse/IWarehouse";

export interface Inventory {
    id: number;
    product_id: number;
    warehouse_id: number;
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_available: number;
    created_at: string;
    updated_at: string;
    
    // Relationships
    product: Product;
    warehouse: Warehouse;
}

export interface InventoryFilters {
    search?: string;
    product_id?: number;
    warehouse_id?: number;
    low_stock?: boolean;
    out_of_stock?: boolean;
    sort?: string;
    per_page?: number;
}