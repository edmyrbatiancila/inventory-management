import { StockMovementStatus, StockMovementType } from "@/types/StockMovement/IStockMovement";
import { StockMovementAdvancedFilters } from "@/types/StockMovement/IStockMovementAdvancedFilters";

export const getInitialAdvancedFilters = (): StockMovementAdvancedFilters => {
    const urlParams = new URLSearchParams(window.location.search);
    const filters: StockMovementAdvancedFilters = {};

    // Parse URL parameters into filter object
    const parseArrayParam = (param: string | null) => param ? param.split(',') : undefined;
    const parseNumberParam = (param: string | null) => param ? parseFloat(param) : undefined;
    const parseBooleanParam = (param: string | null) => param === 'true';

    if (urlParams.get('globalSearch')) filters.globalSearch = urlParams.get('globalSearch')!;
    if (urlParams.get('referenceNumber')) filters.referenceNumber = urlParams.get('referenceNumber')!;
    if (urlParams.get('reason')) filters.reason = urlParams.get('reason')!;
    if (urlParams.get('notes')) filters.notes = urlParams.get('notes')!;

    // Movement types and statuses
    if (urlParams.get('movementTypes')) {
        filters.movementTypes = parseArrayParam(urlParams.get('movementTypes')) as StockMovementType[];
    }
    if (urlParams.get('statuses')) {
        filters.statuses = parseArrayParam(urlParams.get('statuses')) as StockMovementStatus[];
    }

    // Numeric arrays
    if (urlParams.get('productIds')) {
        filters.productIds = parseArrayParam(urlParams.get('productIds'))?.map(Number);
    }
    if (urlParams.get('warehouseIds')) {
        filters.warehouseIds = parseArrayParam(urlParams.get('warehouseIds'))?.map(Number);
    }
    if (urlParams.get('userIds')) {
        filters.userIds = parseArrayParam(urlParams.get('userIds'))?.map(Number);
    }

    // Numeric ranges
    if (urlParams.get('quantityMovedMin')) filters.quantityMovedMin = parseNumberParam(urlParams.get('quantityMovedMin'));

    if (urlParams.get('quantityMovedMax')) filters.quantityMovedMax = parseNumberParam(urlParams.get('quantityMovedMax'));

    if (urlParams.get('totalValueMin')) filters.totalValueMin = parseNumberParam(urlParams.get('totalValueMin'));

    if (urlParams.get('totalValueMax')) filters.totalValueMax = parseNumberParam(urlParams.get('totalValueMax'));

    if (urlParams.get('unitCostMin')) filters.unitCostMin = parseNumberParam(urlParams.get('unitCostMin'));

    if (urlParams.get('unitCostMax')) filters.unitCostMax = parseNumberParam(urlParams.get('unitCostMax'));

    // Dates
    if (urlParams.get('createdAfter')) filters.createdAfter = urlParams.get('createdAfter')!;

    if (urlParams.get('createdBefore')) filters.createdBefore = urlParams.get('createdBefore')!;

    if (urlParams.get('approvedAfter')) filters.approvedAfter = urlParams.get('approvedAfter')!;

    if (urlParams.get('approvedBefore')) filters.approvedBefore = urlParams.get('approvedBefore')!;

    // Movement direction
    if (urlParams.get('movementDirection')) {
            filters.movementDirection = urlParams.get('movementDirection') as 'increase' | 'decrease' | 'all';
    }

    // Quick filters (boolean)
    if (urlParams.get('myMovements')) filters.myMovements = parseBooleanParam(urlParams.get('myMovements'));

    if (urlParams.get('recentMovements')) filters.recentMovements = parseBooleanParam(urlParams.get('recentMovements'));

    if (urlParams.get('pendingApproval')) filters.pendingApproval = parseBooleanParam(urlParams.get('pendingApproval'));

    if (urlParams.get('highValueMovements')) filters.highValueMovements = parseBooleanParam(urlParams.get('highValueMovements'));

    return filters;
}