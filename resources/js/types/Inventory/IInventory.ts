import { Product } from "../Product/IProduct";
import { Warehouse } from "../Warehouse/IWarehouse";

export interface Inventory {
    id: number;
    product_id: number;
    warehouse_id: number;
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_available: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    product: Product;
    warehouse: Warehouse;
}

export interface InventoryDeletionError {
    type: 'reserved_quantity' | 'unknown_error' | 'system_error';
    title: string;
    message: string;
    inventory_id?: number;
    product_name?: string;
    warehouse_name?: string;
    reserved_quantity?: number;
    available_quantity?: number;
    steps: string[];
    error_details?: string;
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

export interface InventoryAnalytics {
    inventory_id: number;
    stock_status: 'healthy' | 'low' | 'critical' | 'out_of_stock';
    stock_percentage: number;
    days_until_stockout?: number;
    reorder_suggested: boolean;
    stock_value: number;
    turnover_rate?: number;
}

export interface InventoryWithAnalytics extends Inventory {
    analytics?: InventoryAnalytics;
    is_low_stock: boolean;
    stock_status: string;
}