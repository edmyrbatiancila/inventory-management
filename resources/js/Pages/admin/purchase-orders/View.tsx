import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PurchaseOrder } from "@/types/PurchaseOrders/IPurchaseOrder";
import { headerVariants, containerVariants, cardVariants, itemVariants } from "@/utils/animationVarians";
import { statusConfig, priorityConfig } from "@/utils/purchase-orders/statusConfig";
import { motion } from "framer-motion";
import { 
    PackagePlus, 
    Edit3, 
    Trash2, 
    CheckCircle, 
    Send, 
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
    Truck,
    AlertTriangle,
    Check,
    Eye,
    ArrowLeft
} from "lucide-react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { useState } from "react";
import { PageProps } from "@/types";

interface IPurchaseOrderViewProps extends PageProps {
    purchase_order: PurchaseOrder;
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
        approve: boolean;
        send: boolean;
        receive: boolean;
        cancel: boolean;
    };
}

const PurchaseOrderView = () => {
    const { props } = usePage<IPurchaseOrderViewProps>();
    const { purchase_order, statuses, priorities, can } = props;
    
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleEdit = () => {
        router.visit(route('admin.purchase-orders.edit', purchase_order.id));
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this purchase order?')) {
            setIsProcessing('delete');
            router.delete(route('admin.purchase-orders.destroy', purchase_order.id), {
                onFinish: () => setIsProcessing(null)
            });
        }
    };

    const handleApprove = () => {
        if (window.confirm('Are you sure you want to approve this purchase order?')) {
            setIsProcessing('approve');
            router.post(route('admin.purchase-orders.approve', purchase_order.id), {}, {
                onFinish: () => setIsProcessing(null)
            });
        }
    };

    const handleSendToSupplier = () => {
        if (window.confirm('Are you sure you want to send this purchase order to the supplier?')) {
            setIsProcessing('send');
            router.post(route('admin.purchase-orders.send-to-supplier', purchase_order.id), {}, {
                onFinish: () => setIsProcessing(null)
            });
        }
    };

    const handleCancel = () => {
        const reason = window.prompt('Please provide a reason for cancellation:');
        if (reason) {
            setIsProcessing('cancel');
            router.post(route('admin.purchase-orders.cancel', purchase_order.id), {
                reason
            }, {
                onFinish: () => setIsProcessing(null)
            });
        }
    };

    const handleReceive = () => {
        router.visit(route('admin.purchase-orders.receive', purchase_order.id));
    };

    const getStatusIcon = (status: string) => {
        return (statusConfig as any)[status]?.icon || FileText;
    };

    const getPriorityIcon = (priority: string) => {
        switch(priority) {
            case 'urgent': return AlertTriangle;
            case 'high': return AlertTriangle;
            case 'normal': return Clock;
            case 'low': return Clock;
            default: return Clock;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const StatusIcon = getStatusIcon(purchase_order.status);
    const PriorityIcon = getPriorityIcon(purchase_order.priority);

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
                            <PackagePlus className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Purchase Order Details
                            </motion.h2>
                            <motion.p
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                {purchase_order.po_number} - {purchase_order.supplier_name}
                            </motion.p>
                        </div>
                    </div>
                    
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Link href={route('admin.purchase-orders.index')}>
                            <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Purchase Orders
                                </Button>
                            </motion.div>
                        </Link>
                        {can.approve && (
                            <Button
                                onClick={handleApprove}
                                disabled={isProcessing !== null}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {isProcessing === 'approve' ? 'Approving...' : 'Approve'}
                            </Button>
                        )}
                        
                        {can.send && (
                            <Button
                                onClick={handleSendToSupplier}
                                disabled={isProcessing !== null}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isProcessing === 'send' ? 'Sending...' : 'Send to Supplier'}
                            </Button>
                        )}
                        
                        {can.receive && (
                            <Button
                                onClick={handleReceive}
                                disabled={isProcessing !== null}
                                className="bg-purple-600 hover:bg-purple-700"
                                size="sm"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Receive Items
                            </Button>
                        )}
                        
                        {can.update && (
                            <Button
                                onClick={handleEdit}
                                disabled={isProcessing !== null}
                                variant="outline"
                                size="sm"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        
                        {can.cancel && (
                            <Button
                                onClick={handleCancel}
                                disabled={isProcessing !== null}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-2" />
                                {isProcessing === 'cancel' ? 'Cancelling...' : 'Cancel'}
                            </Button>
                        )}
                        
                        {can.delete && (
                            <Button
                                onClick={handleDelete}
                                disabled={isProcessing !== null}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                size="sm"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isProcessing === 'delete' ? 'Deleting...' : 'Delete'}
                            </Button>
                        )}
                    </motion.div>
                </motion.div>
            }
        >
            <Head title={`Purchase Order - ${purchase_order.po_number}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Status and Priority Summary */}
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        variants={itemVariants}
                    >
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <StatusIcon className="w-8 h-8 text-blue-600" />
                                    <Badge className={(statusConfig as any)[purchase_order.status]?.color}>
                                        {(statusConfig as any)[purchase_order.status]?.label}
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

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <PriorityIcon className="w-8 h-8 text-orange-600" />
                                    <Badge className={(priorityConfig as any)[purchase_order.priority]?.color}>
                                        {(priorityConfig as any)[purchase_order.priority]?.label}
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

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <DollarSign className="w-8 h-8 text-green-600" />
                                    <span className="text-2xl font-bold text-green-700">
                                        {formatCurrency(purchase_order.total_amount)}
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

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Package className="w-8 h-8 text-purple-600" />
                                    <span className="text-2xl font-bold text-purple-700">
                                        {purchase_order.items?.length || 0}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-lg">Items</CardTitle>
                                <CardDescription className="mt-1">
                                    Total line items
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Purchase Order Information */}
                        <motion.div variants={itemVariants}>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Purchase Order Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">PO Number</label>
                                            <p className="text-lg font-semibold text-gray-900">{purchase_order.po_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Created Date</label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(purchase_order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {purchase_order.expected_delivery_date && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Expected Delivery Date
                                            </label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(purchase_order.expected_delivery_date).toLocaleDateString()}
                                                {purchase_order.is_overdue && (
                                                    <Badge variant="destructive" className="ml-2">Overdue</Badge>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                            <Building2 className="w-4 h-4" />
                                            Warehouse
                                        </label>
                                        <p className="text-sm text-gray-900">{purchase_order.warehouse.name}</p>
                                        {purchase_order.warehouse.address && (
                                            <p className="text-xs text-gray-500">{purchase_order.warehouse.address}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            Created By
                                        </label>
                                        <p className="text-sm text-gray-900">{purchase_order.createdBy?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{purchase_order.createdBy?.email || ''}</p>
                                    </div>

                                    {purchase_order.approvedBy && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Check className="w-4 h-4" />
                                                Approved By
                                            </label>
                                            <p className="text-sm text-gray-900">{purchase_order.approvedBy.name}</p>
                                            {purchase_order.approved_at && (
                                                <p className="text-xs text-gray-500">
                                                    {new Date(purchase_order.approved_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Supplier Information */}
                        <motion.div variants={itemVariants}>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="w-5 h-5" />
                                        Supplier Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Supplier Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{purchase_order.supplier_name}</p>
                                    </div>

                                    {purchase_order.supplier_contact_person && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Contact Person</label>
                                            <p className="text-sm text-gray-900">{purchase_order.supplier_contact_person}</p>
                                        </div>
                                    )}

                                    {purchase_order.supplier_email && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </label>
                                            <a 
                                                href={`mailto:${purchase_order.supplier_email}`}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {purchase_order.supplier_email}
                                            </a>
                                        </div>
                                    )}

                                    {purchase_order.supplier_phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                Phone
                                            </label>
                                            <a 
                                                href={`tel:${purchase_order.supplier_phone}`}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {purchase_order.supplier_phone}
                                            </a>
                                        </div>
                                    )}

                                    {purchase_order.supplier_address && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Address
                                            </label>
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                {purchase_order.supplier_address}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Order Items */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Order Items ({purchase_order.items?.length || 0})
                                </CardTitle>
                                <CardDescription>
                                    Detailed breakdown of all items in this purchase order
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {purchase_order.items && purchase_order.items.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[300px]">Product</TableHead>
                                                    <TableHead className="text-right">SKU</TableHead>
                                                    <TableHead className="text-right">Qty Ordered</TableHead>
                                                    <TableHead className="text-right">Unit Cost</TableHead>
                                                    <TableHead className="text-right">Discount</TableHead>
                                                    <TableHead className="text-right">Line Total</TableHead>
                                                    {purchase_order.status !== 'draft' && (
                                                        <TableHead className="text-center">Status</TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {purchase_order.items.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-gray-50">
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {item.product?.name || item.product_name}
                                                                </p>
                                                                {item.product?.category && (
                                                                    <p className="text-sm text-gray-500">
                                                                        {item.product.category.name}
                                                                    </p>
                                                                )}
                                                                {item.notes && (
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {item.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                {item.product?.sku || item.product_sku}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {item.quantity_ordered}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(item.unit_cost)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {item.discount_percentage ? (
                                                                <span className="text-green-600">
                                                                    -{item.discount_percentage}%
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            {formatCurrency(item.line_total)}
                                                        </TableCell>
                                                        {purchase_order.status !== 'draft' && (
                                                            <TableCell className="text-center">
                                                                <Badge 
                                                                    variant={(item.quantity_received || 0) === item.quantity_ordered ? "default" : "secondary"}
                                                                    className="text-xs"
                                                                >
                                                                    {(item.quantity_received || 0) === item.quantity_ordered ? 'Received' : 
                                                                     (item.quantity_received || 0) > 0 ? 'Partial' : 'Pending'}
                                                                </Badge>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No items found in this purchase order.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Summary */}
                    <motion.div variants={itemVariants} className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(purchase_order.subtotal)}</span>
                                        </div>
                                        
                                        {purchase_order.discount_amount > 0 && (
                                            <div className="flex justify-between items-center text-green-600">
                                                <span>Discount:</span>
                                                <span>-{formatCurrency(purchase_order.discount_amount)}</span>
                                            </div>
                                        )}
                                        
                                        {purchase_order.tax_amount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-medium">{formatCurrency(purchase_order.tax_amount)}</span>
                                            </div>
                                        )}
                                        
                                        {purchase_order.shipping_cost > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Shipping:</span>
                                                <span className="font-medium">{formatCurrency(purchase_order.shipping_cost)}</span>
                                            </div>
                                        )}
                                        
                                        <Separator />
                                        
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-green-600">{formatCurrency(purchase_order.total_amount)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {purchase_order.notes && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Notes</label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                        {purchase_order.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {purchase_order.terms_and_conditions && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Terms & Conditions</label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                                        {purchase_order.terms_and_conditions}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default PurchaseOrderView;