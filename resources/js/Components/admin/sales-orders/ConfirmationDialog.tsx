import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { SalesOrder } from "@/types/SalesOrders/ISalesOrder";

type ConfirmationType = 'delete' | 'cancel' | 'approve' | 'confirm' | 'fulfill' | 'ship' | 'deliver';

interface IConfirmationDialogProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: (data?: { reason?: string }) => void;
    type: ConfirmationType;
    salesOrder: SalesOrder | null;
    isProcessing?: boolean;
}

const ConfirmationDialog = ({
    isOpen,
    onCancel,
    onConfirm,
    type,
    salesOrder,
    isProcessing = false
}: IConfirmationDialogProps) => {
    const [reason, setReason] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleConfirm = () => {
        // Validation for cancel action
        if (type === 'cancel') {
            if (!reason.trim()) {
                setError('Cancellation reason is required.');
                return;
            }
            onConfirm({ reason: reason.trim() });
        } else {
            onConfirm();
        }
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onCancel();
    };

    const getTitle = () => {
        switch (type) {
            case 'delete':
                return 'Delete Sales Order';
            case 'cancel':
                return 'Cancel Sales Order';
            case 'approve':
                return 'Approve Sales Order';
            case 'confirm':
                return 'Confirm Sales Order';
            case 'fulfill':
                return 'Fulfill Sales Order';
            case 'ship':
                return 'Ship Sales Order';
            case 'deliver':
                return 'Mark as Delivered';
            default:
                return 'Confirm Action';
        }
    };

    const getDescription = () => {
        if (!salesOrder) return 'Are you sure you want to proceed?';
        
        switch (type) {
            case 'delete':
                return `Are you sure you want to delete sales order "${salesOrder.so_number}"? This action cannot be undone and all associated data will be permanently removed.`;
            case 'cancel':
                return `Are you sure you want to cancel sales order "${salesOrder.so_number}"? This will change the status to cancelled and stop further processing.`;
            case 'approve':
                return `Are you sure you want to approve sales order "${salesOrder.so_number}"? This will change the status to approved and allow it to proceed to the next stage.`;
            case 'confirm':
                return `Are you sure you want to confirm sales order "${salesOrder.so_number}"? This will confirm the order and begin the fulfillment process.`;
            case 'fulfill':
                return `You will be redirected to the fulfillment page for sales order "${salesOrder.so_number}" where you can specify quantities fulfilled for each item.`;
            case 'ship':
                return `Are you sure you want to mark sales order "${salesOrder.so_number}" as shipped? This will update the status and allow tracking.`;
            case 'deliver':
                return `Are you sure you want to mark sales order "${salesOrder.so_number}" as delivered? This will complete the order lifecycle.`;
            default:
                return 'Are you sure you want to proceed?';
        }
    };

    const getActionButtonText = () => {
        if (isProcessing) {
            switch (type) {
                case 'delete': return 'Deleting...';
                case 'cancel': return 'Cancelling...';
                case 'approve': return 'Approving...';
                case 'confirm': return 'Confirming...';
                case 'fulfill': return 'Redirecting...';
                case 'ship': return 'Updating...';
                case 'deliver': return 'Updating...';
                default: return 'Processing...';
            }
        }
        switch (type) {
            case 'delete': return 'Delete Sales Order';
            case 'cancel': return 'Cancel Sales Order';
            case 'approve': return 'Approve Sales Order';
            case 'confirm': return 'Confirm Sales Order';
            case 'fulfill': return 'Go to Fulfillment Page';
            case 'ship': return 'Mark as Shipped';
            case 'deliver': return 'Mark as Delivered';
            default: return 'Confirm';
        }
    };

    const getActionButtonStyle = () => {
        const baseStyle = "focus:ring-2 focus:ring-offset-2";
        switch (type) {
            case 'delete':
                return `bg-red-600 hover:bg-red-700 focus:ring-red-600 ${baseStyle}`;
            case 'cancel':
                return `bg-orange-600 hover:bg-orange-700 focus:ring-orange-600 ${baseStyle}`;
            case 'approve':
                return `bg-green-600 hover:bg-green-700 focus:ring-green-600 ${baseStyle}`;
            case 'confirm':
                return `bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 ${baseStyle}`;
            case 'fulfill':
                return `bg-purple-600 hover:bg-purple-700 focus:ring-purple-600 ${baseStyle}`;
            case 'ship':
                return `bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600 ${baseStyle}`;
            case 'deliver':
                return `bg-green-600 hover:bg-green-700 focus:ring-green-600 ${baseStyle}`;
            default:
                return `bg-gray-600 hover:bg-gray-700 focus:ring-gray-600 ${baseStyle}`;
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {getDescription()}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                {type === 'cancel' && (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cancellation-reason" className="text-sm font-medium">
                                Cancellation Reason <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="cancellation-reason"
                                placeholder="Please provide a reason for cancellation..."
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error) setError(''); // Clear error when user starts typing
                                }}
                                className={error ? 'border-red-500 focus:ring-red-500' : ''}
                                disabled={isProcessing}
                            />
                            {error && (
                                <p className="text-sm text-red-600 mt-1">{error}</p>
                            )}
                        </div>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleClose} disabled={isProcessing}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={getActionButtonStyle()}
                        disabled={isProcessing}
                    >
                        {getActionButtonText()}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ConfirmationDialog;