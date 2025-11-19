import { User } from "@/types";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Product } from "../Product/IProduct";

export type StatusSO = 
    'draft' | 'pending_approval' | 'approved' | 'confirmed' 
    | 'partially_fulfilled' | 'fully_fulfilled' | 'shipped' 
    | 'delivered' | 'cancelled' | 'closed';

export type PrioritySO = 
    'low' | 'normal' | 'high' | 'urgent';

export type PaymentStatusSO = 
    'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export type ItemStatusSO = 
    'pending' | 'confirmed' | 'allocated' | 'partially_fulfilled' 
    | 'fully_fulfilled' | 'shipped' | 'delivered' | 'cancelled';

export interface SalesOrder {
    id: number;
    so_number: string;
    customer_reference?: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_contact_person?: string;
    status: StatusSO;
    priority: PrioritySO;
    payment_status: PaymentStatusSO;
    warehouse_id: number;
    warehouse: Warehouse;
    created_by: number;
    createdBy?: User; // Relationship object (when loaded)
    created_by_user?: User; // For backward compatibility
    approved_by?: number;
    approvedBy?: User; // Relationship object (when loaded)
    approved_by_user?: User; // For backward compatibility
    fulfilled_by?: number;
    fulfilledBy?: User; // Relationship object (when loaded)
    fulfilled_by_user?: User; // For backward compatibility
    shipped_by?: number;
    shippedBy?: User; // Relationship object (when loaded)
    shipped_by_user?: User; // For backward compatibility
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    requested_delivery_date?: string;
    promised_delivery_date?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    approved_at?: string;
    confirmed_at?: string;
    fulfilled_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    shipping_address?: string;
    shipping_method?: string;
    tracking_number?: string;
    carrier?: string;
    notes?: string;
    customer_notes?: string;
    terms_and_conditions?: string;
    cancellation_reason?: string;
    metadata?: Record<string, any>;
    is_recurring: boolean;
    currency: string;
    payment_terms?: string;
    items_count?: number; // Computed field
    status_label: string; // Accessor
    priority_label: string; // Accessor
    payment_status_label: string; // Accessor
    status_color: string; // Accessor
    priority_color: string; // Accessor
    payment_status_color: string; // Accessor
    formatted_total_amount: string; // Accessor
    days_until_delivery?: number; // Computed field
    is_overdue?: boolean; // Computed field
    items?: SalesOrderItem[];
}

export interface SalesOrderItem {
    id?: number;
    sales_order_id: number;
    product_id: number;
    inventory_id?: number;
    product_sku: string;
    product_name: string;
    product_description?: string;
    quantity_ordered: number;
    quantity_fulfilled: number;
    quantity_shipped: number;
    quantity_pending: number;
    quantity_backordered: number;
    quantity_returned: number;
    unit_price: number;
    line_total: number;
    discount_percentage: number;
    discount_amount: number;
    final_line_total: number;
    item_status: ItemStatusSO;
    requested_delivery_date?: string;
    promised_delivery_date?: string;
    allocated_at?: string;
    fulfilled_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    fulfillment_notes?: string;
    requires_allocation: boolean;
    allocated_quantity: number;
    allocation_expires_at?: string;
    return_reason?: string;
    metadata?: Record<string, any>;
    notes?: string;
    customer_notes?: string;
    created_at?: string;
    updated_at?: string;
    // Computed fields and accessors
    status_label?: string;
    status_color?: string;
    fulfillment_progress?: number;
    remaining_quantity?: number;
    is_fully_fulfilled?: boolean;
    is_partially_fulfilled?: boolean;
    formatted_unit_price?: string;
    formatted_line_total?: string;
    // Relationships
    product?: Product;
    sales_order?: SalesOrder;
    inventory?: any; // Define inventory interface as needed
}

export interface SalesOrderFilters {
    search?: string;
    status?: string;
    priority?: string;
    payment_status?: string;
    warehouse_id?: number;
    customer_name?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface SalesOrderItems {
    product_id: number;
    inventory_id?: number;
    product_sku?: string;
    product_name?: string;
    product_description?: string;
    quantity_ordered: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount?: number;
    line_total: number;
    final_line_total?: number;
    requested_delivery_date?: string;
    notes?: string;
    customer_notes?: string;
    metadata?: Record<string, any>;
    // Relationships
    product?: Product;
}

export interface CreateSalesOrderData {
    // Sales Order main data
    so_number?: string;
    customer_reference?: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_contact_person?: string;
    warehouse_id: number;
    requested_delivery_date?: string;
    promised_delivery_date?: string;
    priority?: PrioritySO;
    payment_status?: PaymentStatusSO;
    currency?: string;
    tax_rate?: number;
    shipping_cost?: number;
    discount_amount?: number;
    shipping_address?: string;
    shipping_method?: string;
    payment_terms?: string;
    notes?: string;
    customer_notes?: string;
    terms_and_conditions?: string;
    metadata?: Record<string, any>;
    is_recurring?: boolean;

    // Items array
    items: SalesOrderItems[];
}