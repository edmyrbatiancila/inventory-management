import { StockTransferStatus } from "./StockTransfer/IStockTransfer";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface User {
    id: number;
    name: string;
    email: string;
    type: string;
};

export interface Category {
    id: number;
    name: string;
    description: string;
    created_at: string;
};

export interface Brand {
    id: number;
    name: string;
    description: string;
    slug: string;
    logo_url?: string;
    logo?: File | null;
    website_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface AdvancedFilters {
     // Text Search
    globalSearch?: string;
    referenceNumber?: string;
    notes?: string;
    
    // Status & Workflow
    statuses?: StockTransferStatus[];
    
    // Location & Product
    fromWarehouseIds?: number[];
    toWarehouseIds?: number[];
    productIds?: number[];
    
    // Quantity & Value
    quantityMin?: number;
    quantityMax?: number;
    
    // Date Ranges
    createdAfter?: string;
    createdBefore?: string;
    initiatedAfter?: string;
    initiatedBefore?: string;
    completedAfter?: string;
    completedBefore?: string;
    
    // User Actions
    initiatedByIds?: number[];
    approvedByIds?: number[];
    
    // Special Filters
    isUrgent?: boolean;
    isOverdue?: boolean;
    hasNotes?: boolean;
    myTransfers?: boolean;
}

export interface SavedFilter {
    id: string;
    name: string;
    filters: AdvancedFilters;
    createdAt: string;
    usageCount: number;
}

// Supplier Types
export interface Supplier {
    id: number;
    supplier_code: string;
    company_name: string;
    trade_name?: string;
    display_name: string;
    supplier_type: string;
    supplier_type_label: string;
    status: string;
    status_label: string;
    status_badge_color: string;
    contact_info: {
        contact_person?: string;
        contact_title?: string;
        email?: string;
        phone?: string;
        mobile?: string;
        fax?: string;
        website?: string;
    };
    address: {
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state_province?: string;
        postal_code?: string;
        country: string;
        full_address: string;
    };
    business_info: {
        tax_id?: string;
        registration_number?: string;
        business_description?: string;
        certifications?: string[];
        established_year?: number;
    };
    financial_info: {
        payment_terms: string;
        currency: string;
        credit_limit: number;
        current_balance: number;
        payment_method?: string;
    };
    performance_metrics: {
        overall_rating: number;
        quality_rating: number;
        delivery_rating: number;
        service_rating: number;
        total_orders: number;
        total_order_value: number;
        average_order_value: number;
        on_time_delivery_percentage: number;
        quality_issues_count: number;
        performance_score: number;
    };
    dates: {
        created_at: string;
        updated_at: string;
        last_order_date?: string;
        last_contact_date?: string;
        contract_start_date?: string;
        contract_end_date?: string;
    };
    permissions: {
        can_edit: boolean;
        can_delete: boolean;
        can_view: boolean;
    };
    relationships: {
        created_by?: User;
        updated_by?: User;
        contact_logs_count: number;
        purchase_orders_count: number;
    };
}
