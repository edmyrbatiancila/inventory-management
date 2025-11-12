import { Activity, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export const getMovementIcon = (movementType: string, quantityMoved: number) => {
        if (movementType.includes('increase') || movementType === 'transfer_in' || movementType === 'purchase_receive' || movementType === 'return_customer') {
            return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
        } else if (movementType.includes('decrease') || movementType === 'transfer_out' || movementType === 'sale_fulfill' || movementType.includes('write_off')) {
            return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
        }
        
        return <Activity className="w-4 h-4 text-blue-600" />;
};