import { User } from "@/types";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Product } from "../Product/IProduct";

export type StatusPO = 
    'draft' | 'pending_approval'
    | 'approved' | 'sent_to_supplier'
    | 'partially_received' | 'fully_received'
    | 'cancelled' | 'closed';

export type PriorityPO = 
    'low' | 'normal' | 'high' | 'urgent';

export interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_reference?: string;
    supplier_name: string;
    supplier_email?: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_contact_person?: string;
    status: StatusPO;
    priority: PriorityPO;
    warehouse_id: number;
    warehouse: Warehouse;
    created_by: number;
    createdBy?: User; // Relationship object (when loaded)
    created_by_user?: User; // For backward compatibility
    approved_by?: number;
    approvedBy?: User; // Relationship object (when loaded) 
    approved_by_user?: User; // For backward compatibility
    received_by?: number;
    receivedBy?: User; // Relationship object (when loaded)
    received_by_user?: User; // For backward compatibility
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    expected_delivery_date?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    approved_at?: string;
    sent_at?: string;
    received_at?: string;
    cancelled_at?: string;
    notes?: string;
    terms_and_conditions?: string;
    cancellation_reason?: string;
    metadata?: Record<string, any>;
    is_recurring: boolean;
    currency: string;
    items_count?: number; // Computed field
    status_label: string; // Accessor
    priority_label: string; // Accessor
    status_color: string; // Accessor
    priority_color: string; // Accessor
    formatted_total_amount: string; // Accessor
    days_until_delivery?: number; // Computed field
    is_overdue?: boolean; // Computed field
    items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id?: number;
    purchase_order_id: number;
    product_id: number;
    product_sku: string;
    product_name: string;
    product_description?: string;
    quantity_ordered: number;
    quantity_received: number;
    quantity_pending: number;
    unit_cost: number;
    line_total: number;
    discount_percentage: number;
    discount_amount: number;
    final_line_total: number;
    item_status: 'pending' | 'partially_received' | 'fully_received' | 'cancelled' | 'backordered';
    expected_delivery_date?: string;
    last_received_at?: string;
    receiving_notes?: string;
    quantity_rejected: number;
    rejection_reason?: string;
    metadata?: Record<string, any>;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    // Computed fields and accessors
    status_label?: string;
    status_color?: string;
    receiving_progress?: number;
    remaining_quantity?: number;
    is_fully_received?: boolean;
    is_partially_received?: boolean;
    formatted_unit_cost?: string;
    formatted_line_total?: string;
    // Relationships
    product?: Product;
    purchase_order?: PurchaseOrder;
}

export interface PurchaseOrderFilters {
    search?: string;
    status?: string;
    priority?: string;
    warehouse_id?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PurchaseOrderItems {
    product_id: number;
    product_sku?: string;
    product_name?: string;
    product_description?: string;
    quantity_ordered: number;
    unit_cost: number;
    discount_percentage: number;
    discount_amount?: number;
    line_total: number;
    final_line_total?: number;
    expected_delivery_date?: string;
    notes?: string;
    metadata?: Record<string, any>;
    // Relationships
    product?: Product;
}

export interface CreatePurchaseOrderData {
    // Purchase Order main data
    po_number?: string;
    supplier_reference?: string;
    supplier_name: string;
    supplier_email?: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_contact_person?: string;
    warehouse_id: number;
    expected_delivery_date?: string;
    priority?: PriorityPO;
    currency?: string;
    tax_rate?: number;
    shipping_cost?: number;
    discount_amount?: number;
    notes?: string;
    terms_and_conditions?: string;
    metadata?: Record<string, any>;
    is_recurring?: boolean;

    // Items array
    items: PurchaseOrderItems[];
}
