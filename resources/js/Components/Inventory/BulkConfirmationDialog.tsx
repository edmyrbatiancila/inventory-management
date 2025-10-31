import { StockTransfer } from "@/types/StockTransfer/IStockTransfer";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { actionConfig } from "@/hooks/stock-adjustments/actionConfig";
import { Spinner } from "../ui/spinner";

interface BulkConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => void;
    action: 'approve' | 'cancel';
    transfers: StockTransfer[];
    isProcessing?: boolean;
}

const BulkConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    action,
    transfers,
    isProcessing
}: BulkConfirmationDialogProps) => {

    const [cancellationReason, setCancellationReason] = useState<string>('');
    const [reasonError, setReasonError] = useState<string>();
    const config = actionConfig[action];
    const Icon = config.icon;

    const handleConfirm = () => {
        if (action === 'cancel' && !cancellationReason.trim()) {
            setReasonError('Cancellation reason is required');
            return;
        }
        
        onConfirm(action === 'cancel' ? cancellationReason : undefined);
    };

    const handleClose = () => {
        setCancellationReason('');
        setReasonError('');
        onClose();
    };

    // const actionConfig = {
    //     approve: {
    //         title: 'Approve Transfers',
    //         description: 'Are you sure you want to approve the following transfers?',
    //         icon: CheckCircle2,
    //         buttonText: 'Approve All',
    //         buttonClass: 'bg-green-600 hover:bg-green-700',
    //     },
    //     cancel: {
    //         title: 'Cancel Transfers',
    //         description: 'Are you sure you want to cancel the following transfers?',
    //         icon: XCircle,
    //         buttonText: 'Cancel All',
    //         buttonClass: 'bg-red-600 hover:bg-red-700',
    //     },
    // };

    

    return (
        <Dialog
            open={isOpen} 
            onOpenChange={handleClose}
        >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5" />
                        {config.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        {config.description}
                    </p> 
                

                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                        <div className="space-y-2">
                        {transfers.map((transfer) => (
                            <motion.div
                                key={transfer.id}
                                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="font-medium text-sm">
                                    {transfer.reference_number}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {transfer.from_warehouse.name} → {transfer.to_warehouse.name}
                                </span>
                            </motion.div>
                        ))}
                        </div>
                    </div>

                    {action === 'cancel' && (
                        <div className="space-y-2">
                                <Label htmlFor="cancellation-reason" className="text-sm font-medium">
                                    Cancellation Reason *
                                </Label>
                                <Textarea
                                    id="cancellation-reason"
                                    value={cancellationReason}
                                    onChange={(e) => {
                                        setCancellationReason(e.target.value);
                                        setReasonError('');
                                    }}
                                    placeholder="Please provide a reason for cancelling these transfers..."
                                    className={`min-h-[80px] ${reasonError ? 'border-red-500' : ''}`}
                                />
                                {reasonError && (
                                    <p className="text-red-500 text-sm">{reasonError}</p>
                                )}
                        </div>
                    )}

                    {action === 'approve' && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Approving transfers will make them eligible for processing. 
                                This action cannot be undone.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className={config.buttonClass}
                    >
                        {isProcessing ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                        ) : (
                            <Icon className="h-4 w-4 mr-2" />
                        )}
                        {isProcessing ? (
                            <>
                                <Spinner />
                                Processing...
                            </>
                        ) : (
                            <>
                                { config.buttonText }
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default BulkConfirmationDialog;