import { StockMovement } from "@/types/StockMovement/IStockMovement";

export const getValueDisplay = (movement: StockMovement) => {
    if (movement.total_value !== null && movement.total_value !== undefined) {
        const value = typeof movement.total_value === 'string' 
            ? parseFloat(movement.total_value) 
            : movement.total_value;
        return isNaN(value) || value === 0 ? '-' : `₱${value.toFixed(2)}`;
    }

    return '-';
};