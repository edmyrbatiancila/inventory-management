import { User } from "..";
import { Product } from "../Product/IProduct";
import { Warehouse } from "../Warehouse/IWarehouse";
import { StockMovementStatus, StockMovementType } from "./IStockMovement";

export interface StockMovementAdvancedFilters {
    // Text Search Filters
    globalSearch?: string;
    referenceNumber?: string;
    reason?: string;
    notes?: string;
    productName?: string;
    productSku?: string;
    warehouseName?: string;
    userName?: string;

    // Movement Type and Status Filters
    movementTypes?: StockMovementType[];
    statuses?: StockMovementStatus[];

    // Entity Filters
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

    // Movement Direction
    movementDirection?: 'increase' | 'decrease' | 'all';

    // Document Reference Filters
    relatedDocumentTypes?: string[];

    // Quick Filters
    myMovements?: boolean;
    recentMovements?: boolean;
    pendingApproval?: boolean;
    highValueMovements?: boolean;
    hasApprover?: boolean;
    hasDocumentReference?: boolean;

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

export interface StockMovementAdvancedSearchProps {
    totalResults: number;
    movementTypes: Record<string, number>;
    statusCounts: Record<string, number>;
    directionStats: {
        increases: number;
        decreases: number;
        totalIncreaseQuantity: number;
        totalDecreaseQuantity: number;
    };
    valueStats: {
        totalCount: number;
        totalValue: number;
        averageValue: number;
        maxValue: number;
        minValue: number;
    };
    recentActivity: number;
    topProducts: Array<{
        product_id: number;
        movement_count: number;
        product: Product;
    }>;
    topWarehouses: Array<{
        warehouse_id: number;
        movement_count: number;
        warehouse: Warehouse;
    }>;
}

export interface StockMovementFilterOptions {
    movementTypes: Record<string, string>;
    statuses: Record<string, string>;
    movementDirections: Record<string, string>;
    relatedDocumentTypes: Record<string, string>;
    products: Product[];
    warehouses: Warehouse[];
    users: User[];
}