import Authenticated from "@/Layouts/AuthenticatedLayout";
import { SalesOrder } from "@/types/SalesOrders/ISalesOrder";
import { headerVariants, containerVariants, cardVariants, itemVariants } from "@/utils/animationVarians";
import { motion } from "framer-motion";
import { 
    ShoppingBasket, 
    Edit3, 
    Trash2, 
    CheckCircle, 
    Truck, 
    X, 
    MapPin, 
    User, 
    Calendar,
    FileText,
    Package,
    DollarSign,
    Clock,
    Building2,
    Mail,
    Phone,
    AlertTriangle,
    Check,
    Eye,
    ArrowLeft,
    Receipt,
    Send,
    PackageCheck
} from "lucide-react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { useState } from "react";
import { PageProps } from "@/types";
import ConfirmationDialog from "@/Components/admin/sales-orders/ConfirmationDialog";

interface ISalesOrderViewProps extends PageProps {
    sales_order: SalesOrder;
    statuses: Record<string, string>;
    payment_statuses: Record<string, string>;
    priorities: Record<string, string>;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
        approve: boolean;
        confirm: boolean;
        fulfill: boolean;
        ship: boolean;
        deliver: boolean;
        cancel: boolean;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const SalesOrderView = () => {
    const { props } = usePage<ISalesOrderViewProps>();
    const { sales_order, statuses, payment_statuses, priorities, can } = props;
    
    const [confirmationDialog, setConfirmationDialog] = useState<{
        isOpen: boolean;
        type: 'delete' | 'cancel' | 'approve' | 'confirm' | 'fulfill' | 'ship' | 'deliver';
        isProcessing: boolean;
    }>({
        isOpen: false,
        type: 'delete',
        isProcessing: false
    });

    const handleEdit = () => {
        router.visit(route('admin.sales-orders.edit', sales_order.id));
    };

    // Dialog open handlers
    const openDeleteDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'delete',
            isProcessing: false
        });
    };

    const openCancelDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'cancel',
            isProcessing: false
        });
    };

    const openApproveDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'approve',
            isProcessing: false
        });
    };

    const openConfirmDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'confirm',
            isProcessing: false
        });
    };

    const openFulfillDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'fulfill',
            isProcessing: false
        });
    };

    const openShipDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'ship',
            isProcessing: false
        });
    };

    const openDeliverDialog = () => {
        setConfirmationDialog({
            isOpen: true,
            type: 'deliver',
            isProcessing: false
        });
    };

    // Close confirmation dialog
    const closeConfirmationDialog = () => {
        setConfirmationDialog(prev => ({
            ...prev,
            isOpen: false
        }));
    };

    // Handle confirmation action
    const handleConfirmAction = (data?: { reason?: string }) => {
        const { type } = confirmationDialog;
        
        setConfirmationDialog(prev => ({
            ...prev,
            isProcessing: true
        }));

        let routeName = '';
        let routeParams: any = { salesOrder: sales_order.id };

        switch (type) {
            case 'delete':
                routeName = 'admin.sales-orders.destroy';
                break;
            case 'cancel':
                routeName = 'admin.sales-orders.cancel';
                routeParams.reason = data?.reason || 'Cancelled by user';
                break;
            case 'approve':
                routeName = 'admin.sales-orders.approve';
                break;
            case 'confirm':
                routeName = 'admin.sales-orders.confirm';
                break;
            case 'fulfill':
                routeName = 'admin.sales-orders.fulfill';
                break;
            case 'ship':
                routeName = 'admin.sales-orders.ship';
                break;
            case 'deliver':
                routeName = 'admin.sales-orders.deliver';
                break;
        }

        const method = type === 'delete' ? 'delete' : 'post';

        router[method](route(routeName, routeParams), {
            data: type === 'cancel' ? { reason: data?.reason } : {},
            onSuccess: () => {
                closeConfirmationDialog();
            },
            onError: () => {
                setConfirmationDialog(prev => ({
                    ...prev,
                    isProcessing: false
                }));
            }
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return Clock;
            case 'pending_approval': return Eye;
            case 'approved': return Check;
            case 'confirmed': return CheckCircle;
            case 'partially_fulfilled': return Package;
            case 'fully_fulfilled': return PackageCheck;
            case 'shipped': return Truck;
            case 'delivered': return CheckCircle;
            case 'cancelled': return X;
            case 'closed': return FileText;
            default: return FileText;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return AlertTriangle;
            case 'high': return AlertTriangle;
            default: return Clock;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: sales_order.currency || 'USD'
        }).format(amount);
    };

    const StatusIcon = getStatusIcon(sales_order.status);
    const PriorityIcon = getPriorityIcon(sales_order.priority);

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
                        <motion.div
                            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ShoppingBasket className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Sales Order Details
                            </motion.h2>
                            <motion.p
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                {sales_order.so_number} - {sales_order.customer_name}
                            </motion.p>
                        </div>
                    </div>

                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Link href={route('admin.sales-orders.index')}>
                            <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Sales Orders
                                </Button>
                            </motion.div>
                        </Link>

                        {can.approve && (
                            <Button
                                onClick={openApproveDialog}
                                disabled={confirmationDialog.isProcessing}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                            </Button>
                        )}

                        {can.confirm && (
                            <Button
                                onClick={openConfirmDialog}
                                disabled={confirmationDialog.isProcessing}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Confirm
                            </Button>
                        )}

                        {can.fulfill && (
                            <Button
                                onClick={openFulfillDialog}
                                disabled={confirmationDialog.isProcessing}
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Fulfill
                            </Button>
                        )}

                        {can.ship && (
                            <Button
                                onClick={openShipDialog}
                                disabled={confirmationDialog.isProcessing}
                                className="bg-indigo-600 hover:bg-indigo-700"
                                size="sm"
                            >
                                <Truck className="w-4 h-4 mr-2" />
                                Ship
                            </Button>
                        )}

                        {can.deliver && (
                            <Button
                                onClick={openDeliverDialog}
                                disabled={confirmationDialog.isProcessing}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                            >
                                <PackageCheck className="w-4 h-4 mr-2" />
                                Mark as Delivered
                            </Button>
                        )}
                        
                        {can.update && (
                            <Button
                                onClick={handleEdit}
                                disabled={confirmationDialog.isProcessing}
                                variant="outline"
                                size="sm"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        
                        {can.cancel && (
                            <Button
                                onClick={openCancelDialog}
                                disabled={confirmationDialog.isProcessing}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                        
                        {can.delete && (
                            <Button
                                onClick={openDeleteDialog}
                                disabled={confirmationDialog.isProcessing}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                size="sm"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </motion.div>
                </motion.div>
            }
        >
            <Head title={`Sales Order #${sales_order.so_number}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Status and Priority Summary */}
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={itemVariants}
                    >
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <StatusIcon className="w-8 h-8 text-blue-600" />
                                    <Badge 
                                        variant={sales_order.status === 'delivered' ? 'default' : 
                                                sales_order.status === 'cancelled' ? 'destructive' : 'secondary'}
                                        className="text-sm font-semibold"
                                    >
                                        {statuses[sales_order.status] || sales_order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg">Status</CardTitle>
                                <CardDescription className="mt-1">
                                    Current order status
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <DollarSign className="w-8 h-8 text-green-600" />
                                    <Badge 
                                        variant={sales_order.payment_status === 'paid' ? 'default' : 
                                                sales_order.payment_status === 'overdue' ? 'destructive' : 'secondary'}
                                        className="text-sm font-semibold"
                                    >
                                        {payment_statuses[sales_order.payment_status] || sales_order.payment_status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg">Payment Status</CardTitle>
                                <CardDescription className="mt-1">
                                    Payment processing status
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <PriorityIcon className="w-8 h-8 text-orange-600" />
                                    <Badge 
                                        variant={sales_order.priority === 'urgent' ? 'destructive' : 
                                                sales_order.priority === 'high' ? 'default' : 'secondary'}
                                        className="text-sm font-semibold"
                                    >
                                        {priorities[sales_order.priority] || sales_order.priority}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg">Priority</CardTitle>
                                <CardDescription className="mt-1">
                                    Order priority level
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Receipt className="w-8 h-8 text-purple-600" />
                                    <span className="text-2xl font-bold text-purple-700">
                                        {formatCurrency(sales_order.total_amount)}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg">Total Amount</CardTitle>
                                <CardDescription className="mt-1">
                                    Order total value
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sales Order Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Customer Information */}
                        <motion.div variants={cardVariants}>
                            <Card className="h-fit">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <CardTitle className="flex items-center gap-2 text-blue-900">
                                        <User className="w-6 h-6" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                                        <p className="text-sm font-medium">{sales_order.customer_name}</p>
                                    </div>
                                    {sales_order.customer_email && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                                            <p className="text-sm font-medium flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {sales_order.customer_email}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {sales_order.customer_phone && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                            <p className="text-sm font-medium flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {sales_order.customer_phone}
                                            </p>
                                        </div>
                                    )}
                                    {sales_order.customer_contact_person && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                                            <p className="text-sm font-medium">{sales_order.customer_contact_person}</p>
                                        </div>
                                    )}
                                </div>
                                {sales_order.customer_address && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                                        <p className="text-sm font-medium flex items-start gap-1">
                                            <MapPin className="w-3 h-3 mt-0.5" />
                                            {sales_order.customer_address}
                                        </p>
                                    </div>
                                )}
                                {sales_order.customer_reference && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Reference</label>
                                        <p className="text-sm font-medium">{sales_order.customer_reference}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                        {/* Order Details */}
                        <motion.div variants={cardVariants}>
                            <Card className="h-fit">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <CardTitle className="flex items-center gap-2 text-green-900">
                                        <FileText className="w-6 h-6" />
                                        Order Details
                                    </CardTitle>
                                </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Sales Order Number</label>
                                        <p className="text-sm font-medium">{sales_order.so_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
                                        <p className="text-sm font-medium flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {sales_order.warehouse?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                                        <p className="text-sm font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(sales_order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Created By</label>
                                        <p className="text-sm font-medium">{sales_order.createdBy?.name}</p>
                                    </div>
                                </div>
                                {sales_order.requested_delivery_date && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Requested Delivery</label>
                                            <p className="text-sm font-medium">{new Date(sales_order.requested_delivery_date).toLocaleDateString()}</p>
                                        </div>
                                        {sales_order.promised_delivery_date && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Promised Delivery</label>
                                                <p className="text-sm font-medium">{new Date(sales_order.promised_delivery_date).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {sales_order.approvedBy && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                                            <p className="text-sm font-medium">{sales_order.approvedBy.name}</p>
                                        </div>
                                        {sales_order.approved_at && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Approved Date</label>
                                                <p className="text-sm font-medium">{new Date(sales_order.approved_at).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                    {/* Shipping Information */}
                    {(sales_order.shipping_address || sales_order.shipping_method || sales_order.tracking_number) && (
                        <motion.div variants={cardVariants} className="lg:col-span-2">
                            <Card>
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                                    <CardTitle className="flex items-center gap-2 text-purple-900">
                                        <Truck className="w-6 h-6" />
                                        Shipping Information
                                    </CardTitle>
                                </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {sales_order.shipping_address && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Shipping Address</label>
                                            <p className="text-sm font-medium">{sales_order.shipping_address}</p>
                                        </div>
                                    )}
                                    {sales_order.shipping_method && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Shipping Method</label>
                                            <p className="text-sm font-medium">{sales_order.shipping_method}</p>
                                        </div>
                                    )}
                                    {sales_order.tracking_number && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                                            <p className="text-sm font-medium">{sales_order.tracking_number}</p>
                                        </div>
                                    )}
                                </div>
                                {sales_order.shippedBy && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Shipped By</label>
                                            <p className="text-sm font-medium">{sales_order.shippedBy.name}</p>
                                        </div>
                                        {sales_order.shipped_at && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Shipped Date</label>
                                                <p className="text-sm font-medium">{new Date(sales_order.shipped_at).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                    {/* Order Items */}
                    <motion.div variants={cardVariants} className="lg:col-span-2">
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                                <CardTitle className="flex items-center gap-2 text-orange-900">
                                    <Package className="w-6 h-6" />
                                    Order Items ({sales_order.items?.length || 0} items)
                                </CardTitle>
                            </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-center">Qty Ordered</TableHead>
                                        <TableHead className="text-center">Qty Fulfilled</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Discount</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales_order.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.product_name}</p>
                                                    {item.product_description && (
                                                        <p className="text-sm text-muted-foreground">{item.product_description}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{item.product_sku}</TableCell>
                                            <TableCell className="text-center">{item.quantity_ordered}</TableCell>
                                            <TableCell className="text-center">{item.quantity_fulfilled}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">
                                                {item.discount_percentage > 0 ? `${item.discount_percentage}%` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.line_total)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.item_status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>

                    {/* Financial Summary */}
                    <motion.div variants={cardVariants}>
                        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
                            <CardHeader className="bg-gradient-to-r from-emerald-100 to-green-100">
                                <CardTitle className="flex items-center gap-2 text-emerald-900">
                                    <DollarSign className="w-6 h-6" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Subtotal:</span>
                                    <span className="text-sm">{formatCurrency(sales_order.subtotal)}</span>
                                </div>
                                {sales_order.discount_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Discount:</span>
                                        <span className="text-sm text-green-600">-{formatCurrency(sales_order.discount_amount)}</span>
                                    </div>
                                )}
                                {sales_order.tax_amount > 0 && sales_order.tax_rate && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Tax ({(sales_order.tax_rate * 100).toFixed(2)}%):</span>
                                        <span className="text-sm">{formatCurrency(sales_order.tax_amount)}</span>
                                    </div>
                                )}
                                {sales_order.shipping_cost && sales_order.shipping_cost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">Shipping:</span>
                                        <span className="text-sm">{formatCurrency(sales_order.shipping_cost)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-lg font-bold">Total Amount:</span>
                                    <span className="text-lg font-bold">{formatCurrency(sales_order.total_amount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                    {/* Notes and Terms */}
                    {(sales_order.notes || sales_order.customer_notes || sales_order.terms_and_conditions || sales_order.payment_terms) && (
                        <motion.div variants={cardVariants}>
                            <Card>
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <FileText className="w-6 h-6" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                            <CardContent className="space-y-4">
                                {sales_order.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Internal Notes</label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{sales_order.notes}</p>
                                    </div>
                                )}
                                {sales_order.customer_notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Customer Notes</label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{sales_order.customer_notes}</p>
                                    </div>
                                )}
                                {sales_order.payment_terms && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{sales_order.payment_terms}</p>
                                    </div>
                                )}
                                {sales_order.terms_and_conditions && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Terms and Conditions</label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{sales_order.terms_and_conditions}</p>
                                    </div>
                                )}
                            </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Confirmation Dialog */}
            {confirmationDialog.isOpen && (
                <ConfirmationDialog
                    isOpen={confirmationDialog.isOpen}
                    type={confirmationDialog.type}
                    isProcessing={confirmationDialog.isProcessing}
                    salesOrder={sales_order}
                    onConfirm={handleConfirmAction}
                    onCancel={closeConfirmationDialog}
                />
            )}
        </Authenticated>
    );
}

export default SalesOrderView;