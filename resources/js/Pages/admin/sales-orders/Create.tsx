import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, ShoppingBasket, Plus, Trash2, Package, User, MapPin, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { useState, useEffect } from "react";
import { CreateSalesOrderData, SalesOrderItems, StatusSO, PrioritySO, PaymentStatusSO } from "@/types/SalesOrders/ISalesOrder";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Product } from "@/types/Product/IProduct";
import { Spinner } from "@/Components/ui/spinner";

interface ISalesOrderCreateProps {
    warehouses: Warehouse[];
    products: Product[];
    statuses: Record<StatusSO, string>;
    payment_statuses: Record<PaymentStatusSO, string>;
    priorities: Record<PrioritySO, string>;
    defaultCurrency: string;
    nextSoNumber: string;
}

const SalesOrderCreate = ({
    warehouses,
    products,
    statuses,
    payment_statuses,
    priorities,
    defaultCurrency,
    nextSoNumber
}: ISalesOrderCreateProps) => {

    const [items, setItems] = useState<SalesOrderItems[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<CreateSalesOrderData>({
        so_number: nextSoNumber,
        customer_reference: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_contact_person: '',
        warehouse_id: 0,
        requested_delivery_date: '',
        promised_delivery_date: '',
        priority: 'normal',
        payment_status: 'pending',
        currency: defaultCurrency,
        tax_rate: '',
        shipping_cost: '',
        discount_amount: '',
        shipping_address: '',
        shipping_method: '',
        payment_terms: '',
        notes: '',
        customer_notes: '',
        terms_and_conditions: '',
        metadata: {},
        is_recurring: false,
        items: []
    });

    // Add new item to the list
    const addItem = () => {
        const newItem: SalesOrderItems = {
            product_id: 0,
            product_sku: '',
            product_name: '',
            product_description: '',
            quantity_ordered: 1,
            unit_price: 0,
            discount_percentage: '',
            discount_amount: 0,
            line_total: 0,
            final_line_total: 0,
            requested_delivery_date: '',
            notes: '',
            customer_notes: '',
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
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Auto-populate product details when product is selected
        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    product_sku: selectedProduct.sku,
                    product_name: selectedProduct.name,
                    unit_price: parseFloat((selectedProduct.price?.toString() || '0'))
                };
            }
        }

        // Calculate line totals when quantity or unit price changes
        if (field === 'quantity_ordered' || field === 'unit_price' || field === 'discount_percentage') {
            const quantity = parseFloat(updatedItems[index].quantity_ordered.toString()) || 0;
            const unitPrice = parseFloat(updatedItems[index].unit_price.toString()) || 0;
            const discountPercentage = parseFloat(updatedItems[index].discount_percentage.toString() || '0') || 0;
            
            const lineTotal = quantity * unitPrice;
            const discountAmount = lineTotal * (discountPercentage / 100);
            const finalLineTotal = lineTotal - discountAmount;

            updatedItems[index] = {
                ...updatedItems[index],
                line_total: lineTotal,
                discount_amount: discountAmount,
                final_line_total: finalLineTotal
            };
        }

        setItems(updatedItems);
        updateFormItems(updatedItems);
    };

    // Update form data with items
    const updateFormItems = (itemsList: SalesOrderItems[]) => {
        setData('items', itemsList);
        
        // Auto-calculate totals
        const totals = calculateTotals(itemsList);
        setData(prev => ({
            ...prev,
            items: itemsList
        }));
    };

    // Calculate totals
    const calculateTotals = (itemsList: SalesOrderItems[] = items) => {
        const subtotal = itemsList.reduce((sum, item) => sum + (item.final_line_total || 0), 0);
        const taxRate = parseFloat(data.tax_rate?.toString() || '0') || 0;
        const shippingCost = parseFloat(data.shipping_cost?.toString() || '0') || 0;
        const discountAmount = parseFloat(data.discount_amount?.toString() || '0') || 0;
        
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount + shippingCost - discountAmount;
        
        return { subtotal, taxAmount, total };
    };

    const totals = calculateTotals();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.sales-orders.store'), {
            onSuccess: () => reset()
        });
    };

    // Helper function to get selected warehouse details
    const getSelectedWarehouse = () => {
        return warehouses.find(w => w.id === data.warehouse_id);
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <ShoppingBasket className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Sales Order</h2>
                        <p className="text-sm text-gray-600 mt-1">Create a new sales order for customer fulfillment</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Sales Order" />
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
                                onClick={() => router.visit(route('admin.sales-orders.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Sales Order List
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Sales Order Information Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        <CardTitle>Sales Order Information</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Basic information about the sales order
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="so_number">SO Number</Label>
                                            <Input
                                                id="so_number"
                                                value={data.so_number}
                                                onChange={(e) => setData('so_number', e.target.value)}
                                                placeholder="Auto-generated if empty"
                                            />
                                            {errors.so_number && (
                                                <p className="text-sm text-red-600">{errors.so_number}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_reference">Customer Reference</Label>
                                            <Input
                                                id="customer_reference"
                                                value={data.customer_reference}
                                                onChange={(e) => setData('customer_reference', e.target.value)}
                                                placeholder="Customer's PO number"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warehouse_id">Warehouse *</Label>
                                            <Select
                                                value={data.warehouse_id.toString()}
                                                onValueChange={(value) => setData('warehouse_id', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            {warehouse.name} ({warehouse.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.warehouse_id && (
                                                <p className="text-sm text-red-600">{errors.warehouse_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={data.priority}
                                                onValueChange={(value) => setData('priority', value as any)}
                                            >
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
                                            <Label htmlFor="payment_status">Payment Status</Label>
                                            <Select
                                                value={data.payment_status}
                                                onValueChange={(value) => setData('payment_status', value as any)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(payment_statuses).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Input
                                                id="currency"
                                                value={data.currency}
                                                onChange={(e) => setData('currency', e.target.value)}
                                                placeholder="USD"
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-green-600" />
                                        <CardTitle>Customer Information</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Customer details for this sales order
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_name">Customer Name *</Label>
                                            <Input
                                                id="customer_name"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                placeholder="Customer or company name"
                                                required
                                            />
                                            {errors.customer_name && (
                                                <p className="text-sm text-red-600">{errors.customer_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_email">Customer Email</Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                value={data.customer_email}
                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                placeholder="customer@example.com"
                                            />
                                            {errors.customer_email && (
                                                <p className="text-sm text-red-600">{errors.customer_email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_phone">Customer Phone</Label>
                                            <Input
                                                id="customer_phone"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_contact_person">Contact Person</Label>
                                            <Input
                                                id="customer_contact_person"
                                                value={data.customer_contact_person}
                                                onChange={(e) => setData('customer_contact_person', e.target.value)}
                                                placeholder="Primary contact name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_address">Customer Address</Label>
                                        <Textarea
                                            id="customer_address"
                                            value={data.customer_address}
                                            onChange={(e) => setData('customer_address', e.target.value)}
                                            placeholder="Customer's billing address"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Information Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-orange-600" />
                                        <CardTitle>Delivery Information</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Delivery dates and shipping details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="requested_delivery_date">Requested Delivery Date</Label>
                                            <Input
                                                id="requested_delivery_date"
                                                type="date"
                                                value={data.requested_delivery_date}
                                                onChange={(e) => setData('requested_delivery_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="promised_delivery_date">Promised Delivery Date</Label>
                                            <Input
                                                id="promised_delivery_date"
                                                type="date"
                                                value={data.promised_delivery_date}
                                                onChange={(e) => setData('promised_delivery_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="shipping_method">Shipping Method</Label>
                                            <Input
                                                id="shipping_method"
                                                value={data.shipping_method}
                                                onChange={(e) => setData('shipping_method', e.target.value)}
                                                placeholder="Standard, Express, Overnight"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment_terms">Payment Terms</Label>
                                            <Input
                                                id="payment_terms"
                                                value={data.payment_terms}
                                                onChange={(e) => setData('payment_terms', e.target.value)}
                                                placeholder="Net 30, Net 15, COD"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address">Shipping Address</Label>
                                        <Textarea
                                            id="shipping_address"
                                            value={data.shipping_address}
                                            onChange={(e) => setData('shipping_address', e.target.value)}
                                            placeholder="Complete shipping address (if different from customer address)"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sales Order Items */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-purple-600" />
                                            <CardTitle>Sales Order Items</CardTitle>
                                        </div>
                                        <Button 
                                            type="button" 
                                            onClick={addItem}
                                            className="flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Item
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Products and quantities for this sales order
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {items.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No items added yet. Click "Add Item" to get started.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium">Item #{index + 1}</h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Product *</Label>
                                                            <Select
                                                                value={item.product_id.toString()}
                                                                onValueChange={(value) => updateItem(index, 'product_id', parseInt(value))}
                                                            >
                                                                <SelectTrigger>
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
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Quantity *</Label>
                                                            <Input
                                                                type="number"
                                                                value={item.quantity_ordered}
                                                                onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 1)}
                                                                min="1"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Unit Price *</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                                min="0"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Discount %</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={item.discount_percentage}
                                                                onChange={(e) => updateItem(index, 'discount_percentage', e.target.value)}
                                                                min="0"
                                                                max="100"
                                                                placeholder="0.00"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Line Total</Label>
                                                            <Input
                                                                type="text"
                                                                value={`${data.currency || 'USD'} ${item.final_line_total?.toFixed(2) || '0.00'}`}
                                                                readOnly
                                                                className="bg-gray-50"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Delivery Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={item.requested_delivery_date}
                                                                onChange={(e) => updateItem(index, 'requested_delivery_date', e.target.value)}
                                                                min={new Date().toISOString().split('T')[0]}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Internal Notes</Label>
                                                            <Textarea
                                                                value={item.notes}
                                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                                placeholder="Internal notes for this item"
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Customer Notes</Label>
                                                            <Textarea
                                                                value={item.customer_notes}
                                                                onChange={(e) => updateItem(index, 'customer_notes', e.target.value)}
                                                                placeholder="Notes visible to customer"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.items && (
                                        <p className="text-sm text-red-600 mt-2">{errors.items}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Financial Information */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <CardTitle>Financial Information</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Taxes, shipping costs, and totals
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                            <Input
                                                id="tax_rate"
                                                type="number"
                                                step="0.01"
                                                value={data.tax_rate}
                                                onChange={(e) => setData('tax_rate', e.target.value)}
                                                min="0"
                                                max="100"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="shipping_cost">Shipping Cost</Label>
                                            <Input
                                                id="shipping_cost"
                                                type="number"
                                                step="0.01"
                                                value={data.shipping_cost}
                                                onChange={(e) => setData('shipping_cost', e.target.value)}
                                                min="0"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="discount_amount">Order Discount</Label>
                                            <Input
                                                id="discount_amount"
                                                type="number"
                                                step="0.01"
                                                value={data.discount_amount}
                                                onChange={(e) => setData('discount_amount', e.target.value)}
                                                min="0"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Totals Summary */}
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">{data.currency || 'USD'} {totals.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax ({parseFloat(data.tax_rate?.toString() || '0') || 0}%):</span>
                                            <span className="font-medium">{data.currency || 'USD'} {totals.taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping:</span>
                                            <span className="font-medium">{data.currency || 'USD'} {(parseFloat(data.shipping_cost?.toString() || '0') || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount:</span>
                                            <span className="font-medium text-red-600">-{data.currency || 'USD'} {(parseFloat(data.discount_amount?.toString() || '0') || 0).toFixed(2)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-blue-600">{data.currency || 'USD'} {totals.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                    <CardDescription>
                                        Notes and terms for this sales order
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Internal Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Internal notes about this sales order"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_notes">Customer Notes</Label>
                                        <Textarea
                                            id="customer_notes"
                                            value={data.customer_notes}
                                            onChange={(e) => setData('customer_notes', e.target.value)}
                                            placeholder="Notes that will be visible to the customer"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                                        <Textarea
                                            id="terms_and_conditions"
                                            value={data.terms_and_conditions}
                                            onChange={(e) => setData('terms_and_conditions', e.target.value)}
                                            placeholder="Terms and conditions for this sales order"
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.sales-orders.index'))}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || items.length === 0}
                                    className="flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBasket className="w-4 h-4" />
                                            Create Sales Order
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </Authenticated>
    );
}

export default SalesOrderCreate;