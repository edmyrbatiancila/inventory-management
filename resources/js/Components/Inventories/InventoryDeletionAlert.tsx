import { InventoryDeletionError } from "@/types/Inventory/IInventory";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { AlertTriangle, CheckCircle2, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { router } from "@inertiajs/react";

interface InventoryDeletionAlertProps {
    isOpen: boolean;
    onClose: () => void;
    error: InventoryDeletionError;
}

const InventoryDeletionAlert = ({
    isOpen,
    onClose,
    error
}: InventoryDeletionAlertProps) => {

    const handleEditInventory = () => {
        if (error.inventory_id) {
            router.visit(route('admin.inventories.edit', error.inventory_id));
        }
        onClose();
    };

    const getIcon = () => {
        switch (error.type) {
            case 'reserved_quantity':
                return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            case 'system_error':
                return <AlertTriangle className="w-6 h-6 text-red-600" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-orange-600" />;
        }
    };

    const getHeaderColor = () => {
        switch (error.type) {
            case 'reserved_quantity':
                return 'text-amber-800';
            case 'system_error':
                return 'text-red-800';
            default:
                return 'text-orange-800';
        }
    };

    return (
        <AlertDialog 
            open={isOpen} 
            onOpenChange={onClose}
        >
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <AlertDialogTitle className={`text-lg font-semibold ${getHeaderColor()}`}>
                            {error.title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-gray-600 mt-2">
                        {error.message}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Inventory Details (for reserved quantity errors) */}
                {error.type === 'reserved_quantity' && (
                    <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-medium text-amber-800 mb-2">Inventory Details:</h4>
                        <div className="text-sm text-amber-700 space-y-1">
                            <p><strong>Product:</strong> {error.product_name}</p>
                            <p><strong>Warehouse:</strong> {error.warehouse_name}</p>
                            <p><strong>Reserved Quantity:</strong> {error.reserved_quantity}</p>
                            <p><strong>Available Quantity:</strong> {error.available_quantity}</p>
                        </div>
                    </div>
                )}

                {/* Error Details (for system errors) */}
                {error.type === 'system_error' && error.error_details && (
                    <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                        <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                            {error.error_details}
                        </p>
                    </div>
                )}

                {/* Steps to Resolve */}
                <div className="my-4">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Steps to Resolve:
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        {error.steps.map((step, index) => (
                            <li key={index} className="leading-relaxed">
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    {error.type === 'reserved_quantity' && error.inventory_id && (
                        <Button
                            onClick={handleEditInventory}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Inventory
                        </Button>
                    )}
                    <AlertDialogCancel onClick={onClose}>
                        Close
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default InventoryDeletionAlert;