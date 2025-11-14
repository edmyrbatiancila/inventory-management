import { User } from "@/types";
import { Warehouse } from "@/types/Warehouse/IWarehouse";

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
    supplier_name: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_contact_person?: string;
    status: StatusPO;
    priority: PriorityPO;
    warehouse: Warehouse;
    created_by: User;
    approved_by?: User;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    expected_delivery_date?: string;
    created_at: string;
    updated_at: string;
    approved_at?: string;
    sent_at?: string;
    received_at?: string;
    cancelled_at?: string;
    notes?: string;
    terms_and_conditions?: string;
    cancellation_reason?: string;
    items_count: number;
    status_label: string;
    priority_label: string;
    status_color: string;
    priority_color: string;
    formatted_total_amount: string;
    days_until_delivery?: number;
    is_overdue: boolean;
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
    quantity_ordered: number;
    unit_cost: number;
    discount_percentage?: number;
    notes?: string;
}

export interface CreatePurchaseOrderData {
    // Purchase Order main data
    po_number?: string;
    supplier_name: string;
    supplier_email?: string;
    supplier_phone?: string;
    supplier_address?: string;
    supplier_contact_person?: string;
    warehouse_id: number;
    expected_delivery_date?: string;
    priority?: string;
    currency?: string;
    notes?: string;
    terms_and_conditions?: string;

    // Items array
    items: PurchaseOrderItems[];
}
