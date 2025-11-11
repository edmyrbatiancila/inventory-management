import { User } from "..";
import { Product } from "../Product/IProduct";
import { Warehouse } from "../Warehouse/IWarehouse";

export type StockMovementType = 
    | 'adjustment_increase' 
    | 'adjustment_decrease'
    | 'transfer_in' 
    | 'transfer_out'
    | 'purchase_receive' 
    | 'sale_fulfill'
    | 'return_customer' 
    | 'return_supplier'
    | 'damage_write_off' 
    | 'expiry_write_off';

export type StockMovementStatus = 
    | 'pending' 
    | 'approved' 
    | 'rejected' 
    | 'applied';

export interface StockMovement {
    id: number;
    product_id: number;
    warehouse_id: number;
    user_id: number;
    reference_number: string;
    movement_type: StockMovementType;
    quantity_before: number;
    quantity_moved: number;
    quantity_after: number;
    unit_cost: number | null;
    total_value: number | null;
    reason: string | null;
    notes: string | null;
    metadata: Record<string, any> | null;
    related_document_type: string | null;
    related_document_id: number | null;
    status: StockMovementStatus;
    approved_by: number | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;

    // Relationships
    product: Product;
    warehouse: Warehouse;
    user: User;
    approvedBy?: User;

    // Computed attributes
    formatted_movement_type: string;
    absolute_quantity: number;
    is_increase: boolean;
    is_decrease: boolean;
    status_label: string;
    status_color: string;
}

export interface StockMovementFilters {
    search?: string;
    movement_types?: StockMovementType[];
    status?: StockMovementStatus;
    product_id?: number;
    warehouse_id?: number;
    user_id?: number;
    date_from?: string;
    date_to?: string;
    quantity_min?: number;
    quantity_max?: number;
    value_min?: number;
    value_max?: number;
    per_page?: number;
    sort?: string;
}

export interface CreateStockMovementData {
    product_id: number;
    warehouse_id: number;
    movement_type: StockMovementType;
    quantity_moved: number;
    unit_cost?: number;
    reason?: string;
    notes?: string;
    related_document_type?: string;
    related_document_id?: number;
    metadata?: Record<string, any>;
}

export interface UpdateStockMovementData {
    reason?: string;
    notes?: string;
    status?: StockMovementStatus;
    approved_by?: number;
    approved_at?: string;
}

export interface StockMovementSearchStats {
    totalMovements: number;
    movementTypes: Record<string, number>;
    statusCounts: {
        pending: number;
        approved: number;
        applied: number;
        rejected: number;
    };
    valueAnalysis: {
        valueIn: number;
        valueOut: number;
        netValue: number;
        avgValue: number;
    };
    quantityAnalysis: {
        quantityIn: number;
        quantityOut: number;
        netQuantity: number;
        avgQuantity: number;
    };
    generatedAt: string;
}

export interface StockMovementAnalytics {
    totalMovements: number;
    pendingApprovals: number;
    todaysMovements: number;
    totalValue: number;
    recentActivity: Array<{
        id: number;
        type: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
    }>;
}

export interface StockMovementAdvancedSearchProps {
    totalResults: number;
    statusCounts: {
        pending: number;
        approved: number;
        applied: number;
        rejected: number;
    };
    movementTypeCounts: Record<string, number>;
    valueRanges: {
        low: number;      // < $100
        medium: number;   // $100-$1000
        high: number;     // > $1000
    };
    searchTime?: number;
}

export interface AdvancedFilters {
    globalSearch?: string;
    movementTypes?: StockMovementType[];
    statuses?: StockMovementStatus[];
    productIds?: number[];
    warehouseIds?: number[];
    userIds?: number[];
    dateRange?: {
        from?: string;
        to?: string;
    };
    quantityRange?: {
        min?: number;
        max?: number;
    };
    valueRange?: {
        min?: number;
        max?: number;
    };
    approvalStatus?: 'approved' | 'pending' | 'rejected';
    relatedDocumentType?: string;
}

export interface SavedFilter {
    id: string;
    name: string;
    filters: AdvancedFilters;
    isDefault?: boolean;
    createdAt: string;
}

// Bulk Operations
export interface BulkActionData {
    action: 'approve' | 'reject' | 'delete';
    ids: number[];
    reason?: string;
}

export interface BulkOperationResult {
    success: boolean;
    message: string;
    processed: number;
    failed: number;
    errors?: string[];
}

// Movement Type Helper
export const MovementTypeLabels: Record<StockMovementType, string> = {
    adjustment_increase: 'Adjustment (Increase)',
    adjustment_decrease: 'Adjustment (Decrease)',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    purchase_receive: 'Purchase Receive',
    sale_fulfill: 'Sale Fulfill',
    return_customer: 'Customer Return',
    return_supplier: 'Supplier Return',
    damage_write_off: 'Damage Write-off',
    expiry_write_off: 'Expiry Write-off',
};

export const MovementTypeColors: Record<StockMovementType, string> = {
    adjustment_increase: 'bg-green-100 text-green-800',
    adjustment_decrease: 'bg-red-100 text-red-800',
    transfer_in: 'bg-blue-100 text-blue-800',
    transfer_out: 'bg-orange-100 text-orange-800',
    purchase_receive: 'bg-emerald-100 text-emerald-800',
    sale_fulfill: 'bg-purple-100 text-purple-800',
    return_customer: 'bg-yellow-100 text-yellow-800',
    return_supplier: 'bg-cyan-100 text-cyan-800',
    damage_write_off: 'bg-red-100 text-red-800',
    expiry_write_off: 'bg-gray-100 text-gray-800',
};

export const StatusLabels: Record<StockMovementStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    applied: 'Applied',
};

export const StatusColors: Record<StockMovementStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    applied: 'bg-green-100 text-green-800',
};

export interface StockMovementAdvancedFilters {
    // Text Search Filters
    globalSearch?: string;
    referenceNumber?: string;
    reason?: string;
    notes?: string;

    // Movement Type Filters
    movementTypes?: StockMovementType[];

    // Status Filters
    statuses?: StockMovementStatus[];

    // Product & Warehouse Filters
    productIds?: number[];
    warehouseIds?: number[];
    userIds?: number[];

    // Quantity Filters
    quantityMovedMin?: number;
    quantityMovedMax?: number;
    quantityBeforeMin?: number;
    quantityBeforeMax?: number;
    quantityAfterMin?: number;
    quantityAfterMax?: number;

    // Value Filters
    unitCostMin?: number;
    unitCostMax?: number;
    totalValueMin?: number;
    totalValueMax?: number;

    // Date Filters
    createdAfter?: string;
    createdBefore?: string;
    approvedAfter?: string;
    approvedBefore?: string;

    // Related Document Filters
    relatedDocumentTypes?: string[];
    relatedDocumentId?: number;

    // Direction Filters
    movementDirection?: 'increase' | 'decrease' | 'both';

    // Quick Filters
    myMovements?: boolean;
    recentMovements?: boolean;
    pendingApproval?: boolean;
    highValue?: boolean;
    largeQuantity?: boolean;

    // Sorting and Pagination
    sort?: string;
    per_page?: number;
}

export interface StockMovementSavedFilter {
    id: string;
    name: string;
    filters: StockMovementAdvancedFilters;
    createdAt: string;
    usageCount?: number;
}

export interface StockMovementAdvancedSearchStats {
    totalResults: number;
    movementTypeCounts: Record<StockMovementType, number>;
    statusCounts: Record<StockMovementStatus, number>;
    directionCounts: {
        increases: number;
        decreases: number;
    };
    valueSummary: {
        totalValue: number;
        averageValue: number;
        maxValue: number;
        minValue: number;
    };
    quantitySummary: {
        totalQuantity: number;
        averageQuantity: number;
        maxQuantity: number;
        minQuantity: number;
    };
    dateRange: {
        earliest: string;
        latest: string;
    };
}