import { Brand, Category } from "..";

export interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    barcode?: string;
    slug: string;
    price: number;
    cost_price?: number;
    min_stock_level: number;
    max_stock_level?: number;
    images?: string[];
    specifications?: Record<string, any>;
    is_active: boolean;
    track_quantity: boolean;
    category_id: number;
    brand_id: number;
    created_at: string;
    updated_at: string;
    
    // Relationships
    category: Category;
    brand: Brand;
    inventories_count: number;
}

export interface ProductFilters {
    search?: string;
    category_id?: number;
    brand_id?: number;
    is_active?: boolean;
    per_page?: number;
    sort?: string;
}

export interface ProductLocations {
    warehouse_id: number;
    warehouse_name: string;
    quantity_on_hand: number;
    quantity_reserved: number;
    quantity_available: number;
    is_low_stock: boolean;
}

export interface ProductStockSummary {
    product_id: number;
    product_name: string;
    total_stock: number;
    total_reserved: number;
    total_available: number;
    min_stock_level: number;
    max_stock_level?: number;
    is_low_stock: boolean;
    locations: ProductLocations[];
}

export interface ProductCurrentStock {
    total_on_hand: number;
    total_reserved: number;
    total_available: number;
    stock_value: number;
}

export interface ProductStockLevels {
    min_level: number;
    max_level?: number;
    reorder_needed: boolean;
    overstock: boolean;
}

export interface ProductRecentActivity {
    stock_in: number;
    stock_out: number;
    adjustments: number;
    net_movement: number;
    movement_count: number;
}

export interface ProductAnalytics {
    product_id: number;
    current_stock: ProductCurrentStock;
    stock_levels: ProductStockLevels;
    recent_activity: ProductRecentActivity;
    locations: number;
    last_movement?: string;
}