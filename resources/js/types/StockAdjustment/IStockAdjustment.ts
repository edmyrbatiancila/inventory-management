import { User } from "..";
import { Inventory } from "../Inventory/IInventory";

export interface StockAdjustment {
    id: number;
    inventory_id: number;
    adjustment_type: 'increase' | 'decrease';
    quantity_adjusted: number;
    quantity_before: number;
    quantity_after: number;
    reason: string;
    notes?: string;
    reference_number: string;
    // adjusted_by: number;
    adjusted_at: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    inventory: Inventory;
    adjusted_by: User;
}

export interface StockAdjustmentFilters {
    search?: string;
    inventory_id?: number;
    adjustment_type?: 'increase' | 'decrease';
    adjusted_by?: number;
    date_from?: string;
    date_to?: string;
    sort?: string;
    per_page?: number;
}

export interface StockAdjustmentVolatility {
    count: number;
    total_quantity: number;
}


export interface StockAdjustmentAnalytics {
    total_adjustments: number;
    increases: StockAdjustmentVolatility;
    decreases: StockAdjustmentVolatility;
    recent_adjustments: StockAdjustment[];
}

export interface AdjustmentReasons {
    [key: string]: string;
}