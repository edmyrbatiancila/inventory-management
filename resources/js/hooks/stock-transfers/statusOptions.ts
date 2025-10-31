import { StockTransferStatus } from "@/types/StockTransfer/IStockTransfer";

export const statusOptions: { value: StockTransferStatus; label: string; color: string }[] = [
    { 
        value: 'pending', 
        label: 'Pending', 
        color: 'bg-yellow-500' 
    },
    { 
        value: 'approved', 
        label: 'Approved', 
        color: 'bg-blue-500' 
    },
    { 
        value: 'in_transit', 
        label: 'In Transit', 
        color: 'bg-purple-500' 
    },
    { 
        value: 'completed', 
        label: 'Completed', 
        color: 'bg-green-500' 
    },
    { 
        value: 'cancelled', 
        label: 'Cancelled', 
        color: 'bg-red-500' 
    },
];