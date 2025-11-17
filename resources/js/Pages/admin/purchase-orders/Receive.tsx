import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PurchaseOrder } from "@/types/PurchaseOrders/IPurchaseOrder";
import { headerVariants, containerVariants, cardVariants, itemVariants } from "@/utils/animationVarians";
import { statusConfig, priorityConfig } from "@/utils/purchase-orders/statusConfig";
import { motion } from "framer-motion";
import { 
    PackagePlus, 
    Package,
    ArrowLeft,
    CheckCircle,
    Save,
    AlertTriangle
} from "lucide-react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useState, useEffect } from "react";
import { PageProps } from "@/types";
import { toast } from "sonner";

interface IPurchaseOrderReceiveProps extends PageProps {
    purchase_order: PurchaseOrder;
    can: {
        receive: boolean;
    };
}

interface ReceiveItemData {
    item_id: number;
    quantity_received: number;
    notes: string;
}

const PurchaseOrderReceive = () => {
    const { props } = usePage<IPurchaseOrderReceiveProps>();
    const { purchase_order, can } = props;
    
    const [receiveItems, setReceiveItems] = useState<ReceiveItemData[]>([]);

    const { data, setData, post, processing, errors } = useForm<{
        items: ReceiveItemData[];
    }>({
        items: []
    });

    // Initialize receive items state
    useEffect(() => {
        if (purchase_order.items) {
            const initialItems = purchase_order.items
                .filter(item => item.id !== undefined)
                .map(item => ({
                    item_id: item.id!,
                    quantity_received: 0,
                    notes: ''
                }));
            setReceiveItems(initialItems);
            setData('items', initialItems);
        }
    }, [purchase_order.items]);

    const updateReceiveItem = (itemId: number, field: 'quantity_received' | 'notes', value: number | string) => {
        const updatedItems = receiveItems.map(item => 
            item.item_id === itemId 
                ? { ...item, [field]: value }
                : item
        );
        setReceiveItems(updatedItems);
        setData('items', updatedItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter items with quantity received > 0
        const itemsToReceive = data.items.filter(item => item.quantity_received > 0);
        
        if (itemsToReceive.length === 0) {
            toast.error('Please specify at least one item with quantity received.');
            return;
        }

        post(route('admin.purchase-orders.receive.submit', purchase_order.id), {
            onSuccess: () => {
                toast.success('Items received successfully!');
            },
            onError: () => {
                toast.error('Failed to receive items. Please try again.');
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getTotalReceivingValue = () => {
        if (!purchase_order.items) return 0;
        
        return receiveItems.reduce((total, receiveItem) => {
            const originalItem = purchase_order.items!.find(item => item.id === receiveItem.item_id);
            return total + (originalItem?.unit_cost || 0) * receiveItem.quantity_received;
        }, 0);
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
                        <motion.div
                            className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Package className="w-8 h-8 text-purple-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Receive Items
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
                        <Link href={route('admin.purchase-orders.show', purchase_order.id)}>
                            <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Purchase Order
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.div>
            }
        >
            <Head title={`Receive Items - ${purchase_order.po_number}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Purchase Order Summary */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PackagePlus className="w-5 h-5" />
                                    Purchase Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">PO Number</Label>
                                        <p className="text-lg font-semibold text-gray-900">{purchase_order.po_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            <Badge className={(statusConfig as any)[purchase_order.status]?.color}>
                                                {(statusConfig as any)[purchase_order.status]?.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Supplier</Label>
                                        <p className="text-sm text-gray-900">{purchase_order.supplier_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Total Value</Label>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatCurrency(purchase_order.total_amount)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Receiving Form */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Receive Items
                                </CardTitle>
                                <CardDescription>
                                    Enter the quantity received for each item. Only items with quantity greater than 0 will be processed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {purchase_order.items && purchase_order.items.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[300px]">Product</TableHead>
                                                        <TableHead className="text-right">Qty Ordered</TableHead>
                                                        <TableHead className="text-right">Qty Pending</TableHead>
                                                        <TableHead className="text-right">Unit Cost</TableHead>
                                                        <TableHead className="text-right w-[150px]">Qty Received</TableHead>
                                                        <TableHead className="w-[200px]">Notes</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {purchase_order.items.map((item, index) => {
                                                        const receiveItem = receiveItems.find(ri => ri.item_id === item.id);
                                                        const maxReceivable = item.quantity_pending || item.quantity_ordered;
                                                        
                                                        return (
                                                            <TableRow key={item.id} className="hover:bg-gray-50">
                                                                <TableCell>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">
                                                                            {item.product?.name || item.product_name}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            SKU: {item.product?.sku || item.product_sku}
                                                                        </p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {item.quantity_ordered}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {maxReceivable}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(item.unit_cost)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        max={maxReceivable}
                                                                        value={receiveItem?.quantity_received || 0}
                                                                        onChange={(e) => {
                                                                            if (item.id) {
                                                                                updateReceiveItem(
                                                                                    item.id, 
                                                                                    'quantity_received', 
                                                                                    parseInt(e.target.value) || 0
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="text-right"
                                                                        placeholder="0"
                                                                    />
                                                                    {errors[`items.${index}.quantity_received`] && (
                                                                        <p className="text-sm text-red-500 mt-1">
                                                                            {errors[`items.${index}.quantity_received`]}
                                                                        </p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Textarea
                                                                        value={receiveItem?.notes || ''}
                                                                        onChange={(e) => {
                                                                            if (item.id) {
                                                                                updateReceiveItem(
                                                                                    item.id, 
                                                                                    'notes', 
                                                                                    e.target.value
                                                                                );
                                                                            }
                                                                        }}
                                                                        placeholder="Receiving notes..."
                                                                        rows={2}
                                                                        className="resize-none"
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No items found in this purchase order.</p>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    <div className="border-t pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Receiving Summary</h3>
                                                <p className="text-sm text-gray-600">
                                                    Total items to receive: {receiveItems.filter(item => item.quantity_received > 0).length}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total receiving value:</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {formatCurrency(getTotalReceivingValue())}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button
                                                type="submit"
                                                disabled={processing || receiveItems.filter(item => item.quantity_received > 0).length === 0}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {processing ? (
                                                    <>Processing...</>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Receive Items
                                                    </>
                                                )}
                                            </Button>
                                            <Link href={route('admin.purchase-orders.show', purchase_order.id)}>
                                                <Button type="button" variant="outline">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
};

export default PurchaseOrderReceive;