import InputError from "@/Components/InputError";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Separator } from "@/Components/ui/separator";
import { Spinner } from "@/Components/ui/spinner";
import { Textarea } from "@/Components/ui/textarea";
import { getStatusBadgeColor } from "@/hooks/stock-transfers/statusBadgeColor";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { StockTransfer, UpdateStockTransferData } from "@/types/StockTransfer/IStockTransfer";
import { containerVariants, headerVariants } from "@/utils/animationVarians";
import { formatDate } from "@/utils/date";
import { Head, router, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Calendar, FileText, Hash, Info, Package, Save, WarehouseIcon } from "lucide-react";
import { toast } from "sonner";

interface IStockTransferEditProps {
    transfer: StockTransfer;
}

const StockTransferEdit = ({
    transfer
}: IStockTransferEditProps) => {

    const { data, setData, put, processing, errors, reset } = useForm<UpdateStockTransferData>({
        transfer_status: transfer.transfer_status,
        notes: transfer.notes || '',
        cancellation_reason: transfer.cancellation_reason || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // If cancelling, ensure cancellation reason is provided
        if (data.transfer_status === 'cancelled' && !data.cancellation_reason.trim()) {
            toast.error('Cancellation reason is required when cancelling a transfer');
            return;
        }

        put(route('admin.stock-transfers.update', transfer.id), {
            onSuccess: () => {
                toast.success('Stock transfer updated successfully');
                router.visit(route('admin.stock-transfers.show', transfer.id));
            },
            onError: () => {
                toast.error('Failed to update stock transfer');
            },
            preserveScroll: true,
        });
    };

    // Get available status transitions based on current status
    const getAvailableStatuses = () => {
        const statuses = [
            { value: transfer.transfer_status, label: transfer.transfer_status.replace('_', ' ').toUpperCase(), current: true }
        ];

        switch (transfer.transfer_status) {
            case 'pending':
                statuses.push(
                    { value: 'approved', label: 'APPROVED', current: false },
                    { value: 'cancelled', label: 'CANCELLED', current: false }
                );
                break;
            case 'approved':
                statuses.push(
                    { value: 'in_transit', label: 'IN TRANSIT', current: false },
                    { value: 'cancelled', label: 'CANCELLED', current: false }
                );
                break;
            case 'in_transit':
                statuses.push(
                    { value: 'completed', label: 'COMPLETED', current: false },
                    { value: 'cancelled', label: 'CANCELLED', current: false }
                );
                break;
        }

        return statuses;
    };

    const availableStatuses = getAvailableStatuses();

    // Check if transfer can be edited
    const canEdit = !['completed', 'cancelled'].includes(transfer.transfer_status);

    return (
        <Authenticated
            header={
                <motion.div
                    className="flex items-center justify-between"
                    initial="hidden"
                    animate="visible"
                    variants={headerVariants}
                >
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(route('admin.stock-transfers.show', transfer.id))}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Transfer Details
                        </Button>
                        <Separator 
                            orientation="vertical" 
                            className="h-6"
                        />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Edit Transfer {transfer.reference_number}
                                </h1>
                                <p className="text-muted-foreground">
                                    Update transfer status and details
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge className={getStatusBadgeColor(transfer.transfer_status)}>
                            {transfer.transfer_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>
                </motion.div>
            }
        >
            <Head title={`Edit Transfer - ${transfer.reference_number}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Edit Form - Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Edit Restriction Alert */}
                            {!canEdit && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        This transfer cannot be edited because it has been {transfer.transfer_status}.
                                        Only pending, approved, and in-transit transfers can be modified.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Status Change Info */}
                            {canEdit && (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertDescription>
                                        You can update the transfer status and add notes. Once a transfer is completed or cancelled, it cannot be modified further.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Edit Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Update Transfer Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleSubmit} 
                                        className="space-y-6"
                                    >

                                        {/* Status Update */}
                                        <div className="space-y-2">
                                            <Label htmlFor="transfer_status">
                                                Transfer Status <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.transfer_status}
                                                onValueChange={(value) => setData('transfer_status', value as any)}
                                                disabled={!canEdit}
                                            >
                                                <SelectTrigger className={errors.transfer_status ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {availableStatuses.map((status) => (
                                                    <SelectItem
                                                        key={status.value} 
                                                        value={status.value}
                                                        className={status.current ? 'bg-muted' : ''}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Badge 
                                                                variant="outline" 
                                                                className={`text-xs ${getStatusBadgeColor(status.value as any)}`}
                                                            >
                                                                {status.label}
                                                            </Badge>
                                                            {status.current && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    (Current)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.transfer_status} />
                                        </div>

                                        {/* Cancellation Reason (shown when status is cancelled) */}
                                        {data.transfer_status === 'cancelled' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="cancellation_reason">
                                                    Cancellation Reason <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    id="cancellation_reason"
                                                    value={data.cancellation_reason}
                                                    onChange={(e) => setData('cancellation_reason', e.target.value)}
                                                    placeholder="Please provide a reason for cancelling this transfer..."
                                                    rows={3}
                                                    className={errors.cancellation_reason ? 'border-red-500' : ''}
                                                    disabled={!canEdit}
                                                />
                                                {errors.cancellation_reason && (
                                                    <p className="text-sm text-destructive">{errors.cancellation_reason}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Additional Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Add any additional notes about this transfer..."
                                                rows={4}
                                                className={errors.notes ? 'border-red-500' : ''}
                                                disabled={!canEdit}
                                            />
                                            {errors.notes && (
                                                <p className="text-sm text-destructive">{errors.notes}</p>
                                            )}
                                        </div>

                                        {/* Form Actions */}
                                        {canEdit && (
                                            <div className="flex items-center justify-end gap-3 pt-6 border-t">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => router.visit(route('admin.stock-transfers.show', transfer.id))}
                                                    disabled={processing}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex items-center gap-2"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Spinner />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            Update Transfer
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Transfer Information - Right Column */}
                        <div className="space-y-6">
                            
                            {/* Current Transfer Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Transfer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Reference Number
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Hash className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">
                                                    {transfer.reference_number}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Current Status
                                        </label>
                                        <div className="mt-1">
                                            <Badge className={getStatusBadgeColor(transfer.transfer_status)}>
                                                {transfer.transfer_status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Quantity
                                        </label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Package className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-semibold">
                                                {transfer.quantity_transferred} units
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Initiated Date
                                        </label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {formatDate(transfer.initiated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Source & Destination Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5" />
                                        Transfer Route
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    
                                    {/* From Warehouse */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <WarehouseIcon className="w-4 h-4" />
                                            From
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <h4 className="font-medium">{transfer.from_warehouse.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {transfer.from_warehouse.city}, {transfer.from_warehouse.state}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex justify-center">
                                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                    </div>

                                    {/* To Warehouse */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <WarehouseIcon className="w-4 h-4" />
                                            To
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <h4 className="font-medium">{transfer.to_warehouse.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {transfer.to_warehouse.city}, {transfer.to_warehouse.state}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Product Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-medium">{transfer.product.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {transfer.product.sku}
                                            </p>
                                            {transfer.product.category && (
                                                <p className="text-sm text-muted-foreground">
                                                    Category: {transfer.product.category.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default StockTransferEdit;