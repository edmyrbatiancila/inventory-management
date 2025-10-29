import Authenticated from "@/Layouts/AuthenticatedLayout";
import { StockTransfer } from "@/types/StockTransfer/IStockTransfer";
import { Head, router } from "@inertiajs/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { containerVariants, headerVariants } from "@/utils/animationVarians";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, Clock, Edit, FileText, Hash, MapPin, MoreHorizontal, Package, Truck, User, WarehouseIcon, XCircle } from "lucide-react";
import { Separator } from "@/Components/ui/separator";
import { Badge } from "@/Components/ui/badge";
import { getStatusBadgeColor } from "@/hooks/stock-transfers/statusBadgeColor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { formatDate } from "@/utils/date";

interface IStockTransferViewProps {
    transfer: StockTransfer;
    canApprove: boolean;
    canMarkInTransit: boolean;
    canComplete: boolean;
    canCancel: boolean;
}

const StockTransferView = ({ 
    transfer, 
    canApprove, 
    canMarkInTransit, 
    canComplete, 
    canCancel 
}: IStockTransferViewProps) => {

    const getTimelineIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'in_transit':
                return <Truck className="w-5 h-5 text-purple-600" />;
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-blue-600" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-600" />;
        }
    };

    const handleEdit = () => {
        router.visit(route('admin.stock-transfers.edit', transfer.id));
    };

    const handleApprove = () => {
        router.patch(route('admin.stock-transfers.approve', transfer.id), {}, {
            onSuccess: () => toast.success('Transfer approved successfully'),
            onError: () => toast.error('Failed to approve transfer')
        });
    };

    const handleMarkInTransit = () => {
        router.patch(route('admin.stock-transfers.mark-in-transit', transfer.id), {}, {
            onSuccess: () => toast.success('Transfer marked as in transit'),
            onError: () => toast.error('Failed to update transfer status')
        });
    };

    const handleComplete = () => {
        router.patch(route('admin.stock-transfers.complete', transfer.id), {}, {
            onSuccess: () => toast.success('Transfer completed successfully'),
            onError: () => toast.error('Failed to complete transfer')
        });
    };

    const handleCancel = () => {
        // This might need a modal for cancellation reason
        router.patch(route('admin.stock-transfers.cancel', transfer.id), {}, {
            onSuccess: () => toast.success('Transfer cancelled'),
            onError: () => toast.error('Failed to cancel transfer')
        });
    };

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
                            onClick={() => router.visit(route('admin.stock-transfers.index'))}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Stock Transfers
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
                                    Transfer {transfer.reference_number}
                                </h1>
                                <p className="text-muted-foreground">
                                    View transfer details and manage status
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge className={getStatusBadgeColor(transfer.transfer_status)}>
                            {transfer.transfer_status.replace('_', ' ').toUpperCase()}
                        </Badge>

                        <div className="flex items-center gap-2">
                            {/* Primary Actions */}
                            {canApprove && (
                                <Button 
                                    onClick={handleApprove}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                </Button>
                            )}

                            {canMarkInTransit && (
                                <Button 
                                    onClick={handleMarkInTransit}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Mark In Transit
                                </Button>
                            )}

                            {canComplete && (
                                <Button 
                                    onClick={handleComplete}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Complete
                                </Button>
                            )}

                            {/* Secondary Actions */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={ handleEdit }>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Transfer
                                    </DropdownMenuItem>
                                    {canCancel && (
                                        <DropdownMenuItem 
                                            onClick={handleCancel}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Cancel Transfer
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </motion.div>
            }
        >
            <Head title={`Stock Transfer - ${transfer.reference_number}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Content - Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Transfer Overview Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Transfer Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">
                                                    Reference Number
                                                </Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Hash className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-mono text-sm">
                                                        {transfer.reference_number}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">
                                                    Transfer Status
                                                </Label>
                                                <div className="mt-1">
                                                    <Badge className={getStatusBadgeColor(transfer.transfer_status)}>
                                                        {getTimelineIcon(transfer.transfer_status)}
                                                        <span className="ml-2">
                                                            {transfer.transfer_status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Quantity Transferred
                                                </label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Package className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-2xl font-bold text-primary">
                                                        {transfer.quantity_transferred}
                                                    </span>
                                                    <span className="text-muted-foreground">units</span>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">
                                                    Initiated Date
                                                </Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span>{formatDate(transfer.initiated_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Source & Destination Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5" />
                                        Source & Destination
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                                        {/* From Warehouse */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <WarehouseIcon className="w-4 h-4" />
                                                From Warehouse
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <h3 className="font-semibold text-lg">
                                                    {transfer.from_warehouse.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Code: {transfer.from_warehouse.code}
                                                </p>
                                                <div className="flex items-start gap-2 mt-2">
                                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {transfer.from_warehouse.full_address || 
                                                            `${transfer.from_warehouse.city}, ${transfer.from_warehouse.state}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex justify-center">
                                            <div className="p-3 bg-primary/10 rounded-full">
                                                <ArrowRight className="w-6 h-6 text-primary" />
                                            </div>
                                        </div>

                                        {/* To Warehouse */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <WarehouseIcon className="w-4 h-4" />
                                                To Warehouse
                                            </div>
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <h3 className="font-semibold text-lg">
                                                    {transfer.to_warehouse.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Code: {transfer.to_warehouse.code}
                                                </p>
                                                <div className="flex items-start gap-2 mt-2">
                                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {transfer.to_warehouse.full_address || 
                                                            `${transfer.to_warehouse.city}, ${transfer.to_warehouse.state}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    {/* Product Information */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Package className="w-4 h-4" />
                                            Product Details
                                        </div>
                                        <div className="p-4 bg-primary/5 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {transfer.product.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        SKU: {transfer.product.sku}
                                                    </p>
                                                    {transfer.product.category && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Category: {transfer.product.category.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary">
                                                        {transfer.quantity_transferred}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        units transferred
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            
                            {/* Timeline & Status History Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Timeline & Status History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">

                                        {/* Initiated */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Initiated</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {formatDate(transfer.initiated_at)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    by {transfer.initiated_by.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Approved */}
                                        {transfer.approved_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Approved</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {formatDate(transfer.approved_at)}
                                                        </Badge>
                                                    </div>
                                                    {transfer.approved_by && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            by {transfer.approved_by.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* In Transit */}
                                        {transfer.transfer_status === 'in_transit' || transfer.transfer_status === 'completed' ? (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-purple-100 rounded-full">
                                                    <Truck className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">In Transit</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            In Progress
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Transfer is currently in transit
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Completed */}
                                        {transfer.completed_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Completed</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {formatDate(transfer.completed_at)}
                                                        </Badge>
                                                    </div>
                                                    {transfer.completed_by && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            by {transfer.completed_by.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cancelled */}
                                        {transfer.cancelled_at && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-red-100 rounded-full">
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Cancelled</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {formatDate(transfer.cancelled_at)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Transfer was cancelled
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pending State */}
                                        {transfer.transfer_status === 'pending' && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-yellow-100 rounded-full">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-medium">Pending Approval</span>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Waiting for approval to proceed
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information Card */}
                            {(transfer.notes || transfer.cancellation_reason) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Additional Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {transfer.notes && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Notes
                                                </label>
                                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                                    <p className="text-sm">{transfer.notes}</p>
                                                </div>
                                            </div>
                                        )}

                                        {transfer.cancellation_reason && (
                                            <div>
                                                <label className="text-sm font-medium text-destructive">
                                                    Cancellation Reason
                                                </label>
                                                <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                                                    <p className="text-sm text-destructive">{transfer.cancellation_reason}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default StockTransferView;