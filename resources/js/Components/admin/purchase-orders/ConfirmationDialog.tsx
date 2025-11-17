import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { PurchaseOrder } from "@/types/PurchaseOrders/IPurchaseOrder";

type ConfirmationType = 'delete' | 'cancel' | 'approve' | 'send_to_supplier' | 'receive';

interface IConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data?: { reason?: string }) => void;
    type: ConfirmationType;
    purchaseOrder: PurchaseOrder | null;
    isProcessing?: boolean;
}

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    purchaseOrder,
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
        onClose();
    };

    const getTitle = () => {
        switch (type) {
            case 'delete':
                return 'Delete Purchase Order';
            case 'cancel':
                return 'Cancel Purchase Order';
            case 'approve':
                return 'Approve Purchase Order';
            case 'send_to_supplier':
                return 'Send Purchase Order to Supplier';
            case 'receive':
                return 'Receive Purchase Order Items';
            default:
                return 'Confirm Action';
        }
    };

    const getDescription = () => {
        if (!purchaseOrder) return 'Are you sure you want to proceed?';
        
        switch (type) {
            case 'delete':
                return `Are you sure you want to delete purchase order "${purchaseOrder.po_number}"? This action cannot be undone and all associated data will be permanently removed.`;
            case 'cancel':
                return `Are you sure you want to cancel purchase order "${purchaseOrder.po_number}"? This will change the status to cancelled and stop further processing.`;
            case 'approve':
                return `Are you sure you want to approve purchase order "${purchaseOrder.po_number}"? This will change the status to approved and allow it to proceed to the next stage.`;
            case 'send_to_supplier':
                return `Are you sure you want to send purchase order "${purchaseOrder.po_number}" to the supplier? This will notify the supplier and change the status to sent.`;
            case 'receive':
                return `You will be redirected to the receiving page for purchase order "${purchaseOrder.po_number}" where you can specify quantities received for each item.`;
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
                case 'send_to_supplier': return 'Sending...';
                case 'receive': return 'Redirecting...';
                default: return 'Processing...';
            }
        }
        switch (type) {
            case 'delete': return 'Delete Purchase Order';
            case 'cancel': return 'Cancel Purchase Order';
            case 'approve': return 'Approve Purchase Order';
            case 'send_to_supplier': return 'Send to Supplier';
            case 'receive': return 'Go to Receiving Page';
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
            case 'send_to_supplier':
                return `bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 ${baseStyle}`;
            case 'receive':
                return `bg-purple-600 hover:bg-purple-700 focus:ring-purple-600 ${baseStyle}`;
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