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