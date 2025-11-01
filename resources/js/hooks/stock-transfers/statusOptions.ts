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

export const getStatusSearchColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-500';
        case 'approved': return 'bg-blue-500';
        case 'in_transit': return 'bg-purple-500';
        case 'completed': return 'bg-green-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};