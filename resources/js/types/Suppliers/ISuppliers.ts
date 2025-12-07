export interface SupplierContactInfo {
    contact_person?: string;
    contact_title?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    website?: string;
}

export interface SupplierAddress {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province?: string;
    postal_code?: string;
    country: string;
    full_address: string;
}

export interface SupplierBusinessInfo {
    tax_id?: string;
    registration_number?: string;
    business_description?: string;
    certifications?: string[];
    established_year?: number;
}

export interface SupplierFinancialInfo {
    payment_terms: string;
    payment_terms_label: string;
    currency: string;
    credit_limit: number;
    current_balance: number;
    payment_method?: string;
}

export interface SupplierPerfMetrics {
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
}

export interface SupplierOpInfo {
    standard_lead_time?: number;
    rush_order_lead_time?: number;
    minimum_order_value?: number;
    shipping_methods?: string[];
    product_categories?: string[];
}

export interface SupplierCompliance {
    tax_exempt: boolean;
    required_documents?: string[];
    insurance_expiry?: string;
}

export interface SupplierContractInfo {
    type?: string;
    type_label?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
}

export interface SupplierMeta {
    tags?: string[];
    internal_notes?: string;
    special_instructions?: string;
    last_order_date?: string;
    last_contact_date?: string;
}

export interface SupplierRelationships {
    contact_logs_count: number;
    recent_contact_logs?: any[];
    created_by?: {
        id: number;
        name: string;
    };
}

export interface SupplierPermissions {
    can_edit: boolean;
    can_delete: boolean;
    can_create_order: boolean;
}

export interface SupplierTimestamps {
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
}

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
    contact_info: SupplierContactInfo;
    address: SupplierAddress;
    business_info: SupplierBusinessInfo;
    financial_info: SupplierFinancialInfo;
    performance_metrics: SupplierPerfMetrics;
    operational_info: SupplierOpInfo;
    compliance: SupplierCompliance;
    contract_info: SupplierContractInfo;
    meta: SupplierMeta;
    relationships: SupplierRelationships;
    permissions: SupplierPermissions;
    timestamps: SupplierTimestamps;
}

export interface SupplierFilters {
    search?: string;
    status?: string;
    type?: string;
    country?: string;
    min_rating?: string;
}

export interface SupplierConstants {
    supplier_types: Record<string, string>;
    statuses: Record<string, string>;
    payment_terms: Record<string, string>;
    payment_methods: Record<string, string>;
    contract_types: Record<string, string>;
}