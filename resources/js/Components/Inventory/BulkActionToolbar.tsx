import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle2, X, XCircle } from "lucide-react";

interface IBulkActionToolbarProps {
    selectedCount: number;
    onApprove: () => void;
    onCancel: () => void;
    onClear: () => void;
    isProcessing?: boolean;
    canApprove?: boolean;
    canCancel?: boolean;
}

const BulkActionToolbar = ({
    selectedCount,
    onApprove,
    onCancel,
    onClear,
    isProcessing = false,
    canApprove = true,
    canCancel = true,
}: IBulkActionToolbarProps) => {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                }}
                className="fixed bottom-6 left-3/4 transform -translate-x-1/2 z-50"
            >
                <motion.div
                    className="bg-gray-100 dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm font-medium">
                                {selectedCount} selected
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClear}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

                        <div className="flex items-center gap-2">
                            {canApprove && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={onApprove}
                                        disabled={isProcessing}
                                        className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-md"
                                        size="sm"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Approve All
                                    </Button>
                                </motion.div>
                            )}

                            {canCancel && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={onCancel}
                                        disabled={isProcessing}
                                        variant="destructive"
                                        size="sm"
                                        className="shadow-md"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel All
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default BulkActionToolbar;