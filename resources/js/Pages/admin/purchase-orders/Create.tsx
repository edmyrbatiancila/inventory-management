import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, PackagePlus, Plus, Trash2, Calendar, Building, User, Phone, Mail, MapPin, FileText, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Product } from "@/types/Product/IProduct";
import { CreatePurchaseOrderData, PriorityPO, PurchaseOrderItems, StatusPO } from "@/types/PurchaseOrders/IPurchaseOrder";
import { useState } from "react";
import { Spinner } from "@/Components/ui/spinner";

interface IPurchaseOrderCreateProps {
    warehouses: Warehouse[];
    products: Product[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    defaultCurrency: string;
    nextPoNumber: string;
}


const PurchaseOrderCreate = ({
    warehouses,
    products,
    statuses,
    priorities,
    defaultCurrency,
    nextPoNumber
}: IPurchaseOrderCreateProps) => {

    const [items, setItems] = useState<PurchaseOrderItems[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<CreatePurchaseOrderData>({
        po_number: nextPoNumber,
        supplier_reference: '',
        supplier_name: '',
        supplier_email: '',
        supplier_phone: '',
        supplier_address: '',
        supplier_contact_person: '',
        warehouse_id: 0,
        expected_delivery_date: '',
        priority: 'normal',
        currency: defaultCurrency,
        tax_rate: 0,
        shipping_cost: 0,
        discount_amount: 0,
        notes: '',
        terms_and_conditions: '',
        is_recurring: false,
        metadata: {},
        items: []
    });

    // Add new item to the list
    const addItem = () => {
        const newItem: PurchaseOrderItems = {
            product_id: 0,
            product_sku: '',
            product_name: '',
            product_description: '',
            quantity_ordered: 1,
            unit_cost: 0,
            discount_percentage: 0,
            discount_amount: 0,
            line_total: 0,
            final_line_total: 0,
            expected_delivery_date: '',
            notes: '',
            metadata: {}
        };
        setItems([...items, newItem]);
    };

    // Remove item from the list
    const removeItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        updateFormItems(updatedItems);
    };

    // Update item in the list
    const updateItem = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        // Calculate line total when quantity or unit_cost changes
        if (field === 'quantity_ordered' || field === 'unit_cost' || field === 'discount_percentage') {
            const quantity = updatedItems[index].quantity_ordered;
            const unitCost = updatedItems[index].unit_cost;
            const discount = updatedItems[index].discount_percentage || 0;
            const subtotal = quantity * unitCost;
            const discountAmount = subtotal * (discount / 100);
            updatedItems[index].line_total = subtotal - discountAmount;
        }

        // Add product details if product_id changes
        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                updatedItems[index].product = selectedProduct;
                updatedItems[index].unit_cost = selectedProduct.price || 0;
                // Recalculate line total
                const quantity = updatedItems[index].quantity_ordered;
                const unitCost = updatedItems[index].unit_cost;
                const discount = updatedItems[index].discount_percentage || 0;
                const subtotal = quantity * unitCost;
                const discountAmount = subtotal * (discount / 100);
                updatedItems[index].line_total = subtotal - discountAmount;
            }
        }

        setItems(updatedItems);
        updateFormItems(updatedItems);
    };

    // Update form data with items
    const updateFormItems = (itemsList: PurchaseOrderItems[]) => {
        const formattedItems = itemsList.map(item => ({
            product_id: item.product_id,
            quantity_ordered: item.quantity_ordered,
            unit_cost: item.unit_cost,
            discount_percentage: item.discount_percentage,
            notes: item.notes,
            line_total: item.line_total
        }));

        setData('items', formattedItems);
    };

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
        return {
            subtotal,
            itemCount: items.length
        };
    };

    const totals = calculateTotals();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.purchase-orders.store'), {
            preserveScroll: true,
        });
    };

    // Helper function to get selected warehouse details
    const getSelectedWarehouse = () => {
        return warehouses.find(warehouse => warehouse.id === data.warehouse_id);
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <PackagePlus className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Purchase Order</h2>
                        <p className="text-sm text-gray-600 mt-1">Create a new purchase order for procurement</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Purchase Order" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => router.visit(route('admin.purchase-orders.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Purchase Order List
                            </Button>
                        </div>

                        <form 
                            onSubmit={handleSubmit} 
                            className="space-y-8"
                        >
                            {/* Purchase Order Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Purchase Order Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="po_number">PO Number</Label>
                                            <Input
                                                id="po_number"
                                                value={data.po_number}
                                                onChange={(e) => setData('po_number', e.target.value)}
                                                placeholder="Auto-generated"
                                                className={errors.po_number ? 'border-red-500' : ''}
                                            />
                                            {errors.po_number && (
                                                <p className="text-sm text-red-500">{errors.po_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warehouse_id">Warehouse</Label>
                                            <Select value={data.warehouse_id.toString()} onValueChange={(value) => setData('warehouse_id', parseInt(value))}>
                                                <SelectTrigger className={errors.warehouse_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <Building className="w-4 h-4" />
                                                                <span>{warehouse.name} ({warehouse.code})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.warehouse_id && (
                                                <p className="text-sm text-red-500">{errors.warehouse_id}</p>
                                            )}
                                            {getSelectedWarehouse() && (
                                                <p className="text-sm text-gray-600">
                                                    Address: {getSelectedWarehouse()?.address}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select value={data.priority || 'normal'} onValueChange={(value) => setData('priority', value as any)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(priorities).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="expected_delivery_date"
                                                    type="date"
                                                    value={data.expected_delivery_date}
                                                    onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Supplier Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Supplier Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier_name">Supplier Name *</Label>
                                            <Input
                                                id="supplier_name"
                                                value={data.supplier_name}
                                                onChange={(e) => setData('supplier_name', e.target.value)}
                                                placeholder="Enter supplier name"
                                                className={errors.supplier_name ? 'border-red-500' : ''}
                                            />
                                            {errors.supplier_name && (
                                                <p className="text-sm text-red-500">{errors.supplier_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="supplier_contact_person">Contact Person</Label>
                                            <Input
                                                id="supplier_contact_person"
                                                value={data.supplier_contact_person}
                                                onChange={(e) => setData('supplier_contact_person', e.target.value)}
                                                placeholder="Contact person name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="supplier_email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="supplier_email"
                                                    type="email"
                                                    value={data.supplier_email}
                                                    onChange={(e) => setData('supplier_email', e.target.value)}
                                                    placeholder="supplier@example.com"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="supplier_phone">Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="supplier_phone"
                                                    value={data.supplier_phone}
                                                    onChange={(e) => setData('supplier_phone', e.target.value)}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="supplier_address">Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Textarea
                                                    id="supplier_address"
                                                    value={data.supplier_address}
                                                    onChange={(e) => setData('supplier_address', e.target.value)}
                                                    placeholder="Complete supplier address"
                                                    className="pl-10"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purchase Order Items Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Purchase Order Items ({items.length})
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            onClick={addItem}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Item
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {items.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No items added yet. Click "Add Item" to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead>Unit Cost</TableHead>
                                                        <TableHead>Discount %</TableHead>
                                                        <TableHead>Line Total</TableHead>
                                                        <TableHead>Notes</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Select
                                                                    value={item.product_id.toString()}
                                                                    onValueChange={(value) => updateItem(index, 'product_id', parseInt(value))}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map((product) => (
                                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                                {product.name} ({product.sku})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity_ordered}
                                                                    onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 0)}
                                                                    className="w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={item.unit_cost}
                                                                    onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                    value={item.discount_percentage}
                                                                    onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-medium">
                                                                    ₱{item.line_total.toFixed(2)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={item.notes}
                                                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                                    placeholder="Item notes"
                                                                    className="w-32"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => removeItem(index)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {/* Totals Summary */}
                                            <div className="mt-4 flex justify-end">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between gap-8">
                                                            <span>Items:</span>
                                                            <span>{totals.itemCount}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-8 font-medium border-t pt-2">
                                                            <span>Subtotal:</span>
                                                            <span>₱{totals.subtotal.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {errors.items && (
                                        <p className="text-sm text-red-500 mt-2">{errors.items}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Internal Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Internal notes (not visible to supplier)"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                                        <Textarea
                                            id="terms_and_conditions"
                                            value={data.terms_and_conditions}
                                            onChange={(e) => setData('terms_and_conditions', e.target.value)}
                                            placeholder="Purchase order terms and conditions"
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.purchase-orders.index'))}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={processing || items.length === 0}
                                        className="min-w-[140px]"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <PackagePlus className="w-4 h-4 mr-2" />
                                                Create Purchase Order
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </form>
                    </motion.div>
                </div>
            </div>
        </Authenticated>
    );
}

export default PurchaseOrderCreate;