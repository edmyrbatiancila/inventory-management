import { User } from "..";
import { Product } from "../Product/IProduct";
import { Warehouse } from "../Warehouse/IWarehouse";

export type StockTransferStatus = 
    | 'pending' 
    | 'approved' 
    | 'in_transit' 
    | 'completed' 
    | 'cancelled';

export interface StockTransfer {
    id: number;
    from_warehouse_id: number;
    to_warehouse_id: number;
    product_id: number;
    quantity_transferred: number;
    transfer_status: StockTransferStatus;
    reference_number: string;
    // initiated_by: number;
    // approved_by?: number;
    // completed_by?: number;
    notes?: string;
    cancellation_reason?: string;
    initiated_at: string;
    approved_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
    
    // Relationships
    from_warehouse: Warehouse;
    to_warehouse: Warehouse;
    product: Product;
    initiated_by: User;
    approved_by?: User;
    completed_by?: User;

    // Computed attributes
    status_label: string;
    status_color: string;
}

export interface StockTransferFilters {
    search?: string;
    status?: StockTransferStatus;
    warehouse_id?: number;
    product_id?: number;
    per_page?: number;
    sort?: string;
}

export interface CreateStockTransferData {
    from_warehouse_id: number;
    to_warehouse_id: number;
    product_id: number;
    quantity_transferred: number;
    notes?: string;
}

export interface UpdateStockTransferData {
    transfer_status?: StockTransferStatus;
    notes?: string;
    cancellation_reason?: string;
}

