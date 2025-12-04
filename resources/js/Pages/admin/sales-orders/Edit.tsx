import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building, Calendar, CheckCircle2, FileText, Mail, MapPin, Package, PackagePlus, Phone, Plus, Save, ShoppingBasket, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { SalesOrder, CreateSalesOrderData, SalesOrderItems, PrioritySO } from "@/types/SalesOrders/ISalesOrder";

interface ISalesOrderEditProps extends PageProps {
    sales_order: SalesOrder;
    warehouses: Warehouse[];
    products: Product[];
    statuses: Record<string, string>;
    payment_statuses: Record<string, string>;
    priorities: Record<string, string>;
    defaultCurrency: string;
    can: {
        update: boolean;
        delete: boolean;
        addItems: boolean;
        editItems: boolean;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const SalesOrderEdit = () => {
    const { props } = usePage<ISalesOrderEditProps>();
    const { sales_order, warehouses, products, statuses, payment_statuses, priorities, defaultCurrency, can } = props;

    // Helper function to safely convert to number
    const getNumeric = (value: any, defaultValue: number = 0): number => {
        if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
            return isNaN(parsed) ? defaultValue : parsed;
        }
        return defaultValue;
    };

    // Helper function to safely format price
    const getNumericPrice = (price: any): number => {
        return getNumeric(price, 0);
    };

    // Convert sales order items to the format expected by the form
    const convertSOItemsToFormItems = (): SalesOrderItems[] => {
        if (!sales_order.items || !Array.isArray(sales_order.items)) return [];
        
        return sales_order.items.map(item => ({
            product_id: item.product_id,
            product_sku: item.product_sku,
            product_name: item.product_name,
            product_description: item.product_description,
            quantity_ordered: getNumeric(item.quantity_ordered),
            unit_price: getNumeric(item.unit_price),
            discount_percentage: item.discount_percentage ? getNumeric(item.discount_percentage) * 100 : '', // Convert from decimal to percentage
            discount_amount: getNumeric(item.discount_amount || 0),
            line_total: getNumeric(item.line_total || 0),
            final_line_total: getNumeric(item.final_line_total || item.line_total || 0),
            requested_delivery_date: item.requested_delivery_date
                ? (item.requested_delivery_date.includes('T') 
                    ? new Date(item.requested_delivery_date).toISOString().split('T')[0]
                    : item.requested_delivery_date.split(' ')[0])
                : '',
            notes: item.notes || '',
            customer_notes: item.customer_notes || '',
            metadata: item.metadata || {},
            product: item.product
        }));
    };

    const [items, setItems] = useState<SalesOrderItems[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm<CreateSalesOrderData>({
        so_number: sales_order.so_number || '',
        customer_reference: sales_order.customer_reference || '',
        customer_name: sales_order.customer_name || '',
        customer_email: sales_order.customer_email || '',
        customer_phone: sales_order.customer_phone || '',
        customer_address: sales_order.customer_address || '',
        customer_contact_person: sales_order.customer_contact_person || '',
        warehouse_id: sales_order.warehouse?.id || 0,
        requested_delivery_date: sales_order.requested_delivery_date 
            ? (sales_order.requested_delivery_date.includes('T') 
                ? new Date(sales_order.requested_delivery_date).toISOString().split('T')[0]
                : sales_order.requested_delivery_date.split(' ')[0])
            : '',
        promised_delivery_date: sales_order.promised_delivery_date 
            ? (sales_order.promised_delivery_date.includes('T') 
                ? new Date(sales_order.promised_delivery_date).toISOString().split('T')[0]
                : sales_order.promised_delivery_date.split(' ')[0])
            : '',
        priority: sales_order.priority || 'normal',
        payment_status: sales_order.payment_status || 'pending',
        currency: sales_order.currency || defaultCurrency,
        tax_rate: sales_order.tax_rate ? (sales_order.tax_rate * 100) : '', // Convert from decimal to percentage
        shipping_cost: sales_order.shipping_cost || '',
        discount_amount: sales_order.discount_amount || '',
        shipping_address: sales_order.shipping_address || '',
        shipping_method: sales_order.shipping_method || '',
        payment_terms: sales_order.payment_terms || '',
        notes: sales_order.notes || '',
        customer_notes: sales_order.customer_notes || '',
        terms_and_conditions: sales_order.terms_and_conditions || '',
        is_recurring: sales_order.is_recurring || false,
        metadata: sales_order.metadata || {},
        items: []
    });

    // Initialize items and form data safely
    useEffect(() => {
        try {
            const convertedItems = convertSOItemsToFormItems();
            setItems(convertedItems);
            setData('items', convertedItems.map(item => ({
                product_id: item.product_id,
                quantity_ordered: item.quantity_ordered,
                unit_price: item.unit_price,
                discount_percentage: item.discount_percentage,
                notes: item.notes,
                customer_notes: item.customer_notes,
                line_total: item.line_total
            })));
            setIsDataLoaded(true);
        } catch (error) {
            console.error('Error initializing sales order data:', error);
            setIsDataLoaded(true); // Still set as loaded to show the form
        }
    }, [sales_order]);

    // Add new item to the list
    const addItem = () => {
        if (!can.addItems) {
            toast.error('You cannot add items to this sales order in its current status.');
            return;
        }

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
        if (!can.editItems) {
            toast.error('You cannot remove items from this sales order in its current status.');
            return;
        }

        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        updateFormItems(updatedItems);
    };

    // Update item in the list
    const updateItem = (index: number, field: string, value: any) => {
        if (!can.editItems) {
            toast.error('You cannot edit items in this sales order in its current status.');
            return;
        }

        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        // Calculate line totals when quantity or unit price changes
        if (field === 'quantity_ordered' || field === 'unit_price' || field === 'discount_percentage') {
            const quantity = parseFloat(updatedItems[index].quantity_ordered.toString()) || 0;
            const unitPrice = parseFloat(updatedItems[index].unit_price.toString()) || 0;
            const discountPercentage = parseFloat(updatedItems[index].discount_percentage.toString() || '0') || 0;
            
            const subtotal = quantity * unitPrice;
            const discountAmount = subtotal * (discountPercentage / 100);
            updatedItems[index].discount_amount = discountAmount;
            updatedItems[index].line_total = subtotal;
            updatedItems[index].final_line_total = subtotal - discountAmount;
        }

        // Add product details if product_id changes
        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                updatedItems[index].product = selectedProduct;
                updatedItems[index].product_sku = selectedProduct.sku;
                updatedItems[index].product_name = selectedProduct.name;
                updatedItems[index].unit_price = getNumericPrice(selectedProduct.price);
                
                // Recalculate line total with the new unit price
                const quantity = updatedItems[index].quantity_ordered;
                const unitPrice = getNumericPrice(selectedProduct.price);
                const discountPercentage = parseFloat(updatedItems[index].discount_percentage.toString() || '0') || 0;
                const subtotal = quantity * unitPrice;
                const discountAmount = subtotal * (discountPercentage / 100);
                updatedItems[index].discount_amount = discountAmount;
                updatedItems[index].line_total = subtotal;
                updatedItems[index].final_line_total = subtotal - discountAmount;
            }
        }

        setItems(updatedItems);
        updateFormItems(updatedItems);
    };

    // Update form data with items
    const updateFormItems = (itemsList: SalesOrderItems[]) => {
        const formattedItems = itemsList.map(item => ({
            product_id: item.product_id,
            quantity_ordered: item.quantity_ordered,
            unit_price: item.unit_price,
            discount_percentage: item.discount_percentage,
            notes: item.notes,
            customer_notes: item.customer_notes,
            line_total: item.line_total
        }));

        setData('items', formattedItems);
    };

    // Helper function to safely format price
    const formatPrice = (price: any): string => {
        if (typeof price === 'number') {
            return price.toFixed(2);
        }
        if (typeof price === 'string') {
            const parsed = parseFloat(price.replace(/[^0-9.-]/g, ''));
            return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
        }
        return '0.00';
    };

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = items.reduce((total, item) => {
            return total + (item.final_line_total || 0);
        }, 0);

        const taxRate = parseFloat(data.tax_rate?.toString() || '0') / 100;
        const taxAmount = subtotal * taxRate;
        const shippingCost = parseFloat(data.shipping_cost?.toString() || '0');
        const discountAmount = parseFloat(data.discount_amount?.toString() || '0');

        return {
            subtotal,
            taxAmount,
            shippingCost,
            discountAmount,
            total: subtotal + taxAmount + shippingCost - discountAmount
        };
    };

    const totals = calculateTotals();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update form data with current items before submission
        setData('items', items);
        
        put(route('admin.sales-orders.update', sales_order.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sales order updated successfully!');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Please check the form for errors.');
            }
        });
    };

    // Helper function to get selected warehouse details
    const getSelectedWarehouse = () => {
        return warehouses.find(w => w.id === data.warehouse_id);
    };

    // Show flash messages
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    if (!isDataLoaded) {
        return (
            <Authenticated>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center min-h-64">
                            <div className="text-lg text-gray-600">Loading sales order data...</div>
                        </div>
                    </div>
                </div>
            </Authenticated>
        );
    }

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <ShoppingBasket className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">
                            Edit Sales Order #{sales_order.so_number}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Edit an existing sales order in your system
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Sales Order #${sales_order.so_number}`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                Back to Sales Orders
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Sales Order Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Sales Order Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="so_number">Sales Order Number *</Label>
                                            <Input
                                                id="so_number"
                                                type="text"
                                                value={data.so_number}
                                                onChange={(e) => setData('so_number', e.target.value)}
                                                disabled={!can.update}
                                                placeholder="SO-2025-001"
                                            />
                                            {errors.so_number && <div className="text-red-500 text-sm">{errors.so_number}</div>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_reference">Customer Reference</Label>
                                            <Input
                                                id="customer_reference"
                                                type="text"
                                                value={data.customer_reference}
                                                onChange={(e) => setData('customer_reference', e.target.value)}
                                                disabled={!can.update}
                                                placeholder="Customer's reference number"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warehouse_id">Warehouse *</Label>
                                            <Select
                                                value={data.warehouse_id.toString()}
                                                onValueChange={(value) => setData('warehouse_id', parseInt(value))}
                                                disabled={!can.update}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <Building className="w-4 h-4" />
                                                                {warehouse.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.warehouse_id && <div className="text-red-500 text-sm">{errors.warehouse_id}</div>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={data.priority}
                                                onValueChange={(value) => setData('priority', value as any)}
                                                disabled={!can.update}
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
                                                disabled={!can.update}
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
                                                type="text"
                                                value={data.currency}
                                                onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                                disabled={!can.update}
                                                placeholder="USD"
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_name">Customer Name *</Label>
                                            <Input
                                                id="customer_name"
                                                type="text"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                disabled={!can.update}
                                                placeholder="Customer Name"
                                            />
                                            {errors.customer_name && <div className="text-red-500 text-sm">{errors.customer_name}</div>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_contact_person">Contact Person</Label>
                                            <Input
                                                id="customer_contact_person"
                                                type="text"
                                                value={data.customer_contact_person}
                                                onChange={(e) => setData('customer_contact_person', e.target.value)}
                                                disabled={!can.update}
                                                placeholder="Contact Person Name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    id="customer_email"
                                                    type="email"
                                                    value={data.customer_email}
                                                    onChange={(e) => setData('customer_email', e.target.value)}
                                                    disabled={!can.update}
                                                    className="pl-10"
                                                    placeholder="customer@company.com"
                                                />
                                            </div>
                                            {errors.customer_email && <div className="text-red-500 text-sm">{errors.customer_email}</div>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    id="customer_phone"
                                                    type="tel"
                                                    value={data.customer_phone}
                                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                                    disabled={!can.update}
                                                    className="pl-10"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_address">Address</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                            <Textarea
                                                id="customer_address"
                                                value={data.customer_address}
                                                onChange={(e) => setData('customer_address', e.target.value)}
                                                disabled={!can.update}
                                                className="pl-10"
                                                placeholder="Customer address..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery & Schedule */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Delivery & Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="requested_delivery_date">Requested Delivery Date</Label>
                                            <Input
                                                id="requested_delivery_date"
                                                type="date"
                                                value={data.requested_delivery_date}
                                                onChange={(e) => setData('requested_delivery_date', e.target.value)}
                                                disabled={!can.update}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="promised_delivery_date">Promised Delivery Date</Label>
                                            <Input
                                                id="promised_delivery_date"
                                                type="date"
                                                value={data.promised_delivery_date}
                                                onChange={(e) => setData('promised_delivery_date', e.target.value)}
                                                disabled={!can.update}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="shipping_method">Shipping Method</Label>
                                            <Input
                                                id="shipping_method"
                                                type="text"
                                                value={data.shipping_method}
                                                onChange={(e) => setData('shipping_method', e.target.value)}
                                                disabled={!can.update}
                                                placeholder="Standard, Express, Overnight, etc."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment_terms">Payment Terms</Label>
                                            <Input
                                                id="payment_terms"
                                                type="text"
                                                value={data.payment_terms}
                                                onChange={(e) => setData('payment_terms', e.target.value)}
                                                disabled={!can.update}
                                                placeholder="Net 30, COD, etc."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="shipping_address">Shipping Address</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                            <Textarea
                                                id="shipping_address"
                                                value={data.shipping_address}
                                                onChange={(e) => setData('shipping_address', e.target.value)}
                                                disabled={!can.update}
                                                className="pl-10"
                                                placeholder="Shipping address (if different from customer address)..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sales Order Items */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Sales Order Items
                                    </CardTitle>
                                    {can.addItems && (
                                        <Button type="button" onClick={addItem} className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add Item
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {items.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>SKU</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead>Unit Price</TableHead>
                                                        <TableHead>Discount %</TableHead>
                                                        <TableHead>Line Total</TableHead>
                                                        <TableHead>Delivery Date</TableHead>
                                                        <TableHead>Notes</TableHead>
                                                        {can.editItems && <TableHead>Actions</TableHead>}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Select
                                                                    value={item.product_id.toString()}
                                                                    onValueChange={(value) => updateItem(index, 'product_id', parseInt(value))}
                                                                    disabled={!can.editItems}
                                                                >
                                                                    <SelectTrigger className="w-48">
                                                                        <SelectValue placeholder="Select product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map((product) => (
                                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-medium">{product.name}</span>
                                                                                    <span className="text-sm text-gray-500">{product.sku}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-sm text-gray-600">{item.product_sku}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={item.quantity_ordered}
                                                                    onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 1)}
                                                                    disabled={!can.editItems}
                                                                    min="1"
                                                                    className="w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={item.unit_price}
                                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                                    disabled={!can.editItems}
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={item.discount_percentage}
                                                                    onChange={(e) => updateItem(index, 'discount_percentage', e.target.value)}
                                                                    disabled={!can.editItems}
                                                                    min="0"
                                                                    max="100"
                                                                    placeholder="0.00"
                                                                    className="w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-medium">
                                                                    ${formatPrice(item.final_line_total)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="date"
                                                                    value={item.requested_delivery_date}
                                                                    onChange={(e) => updateItem(index, 'requested_delivery_date', e.target.value)}
                                                                    disabled={!can.editItems}
                                                                    className="w-36"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={item.notes}
                                                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                                    disabled={!can.editItems}
                                                                    placeholder="Item notes"
                                                                    className="w-32"
                                                                />
                                                            </TableCell>
                                                            {can.editItems && (
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeItem(index)}
                                                                        disabled={!can.editItems}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No items added yet.</p>
                                            {can.addItems && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addItem}
                                                    className="mt-4 flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Your First Item
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Totals */}
                                    {items.length > 0 && (
                                        <div className="mt-6 border-t pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <Label>Tax Rate (%)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.tax_rate}
                                                        onChange={(e) => setData('tax_rate', e.target.value)}
                                                        disabled={!can.update}
                                                        placeholder="0.00"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Shipping Cost</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.shipping_cost}
                                                        onChange={(e) => setData('shipping_cost', e.target.value)}
                                                        disabled={!can.update}
                                                        placeholder="0.00"
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Order Discount</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.discount_amount}
                                                        onChange={(e) => setData('discount_amount', e.target.value)}
                                                        disabled={!can.update}
                                                        placeholder="0.00"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <div className="w-64 space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Subtotal:</span>
                                                        <span>${formatPrice(totals.subtotal)}</span>
                                                    </div>
                                                    {totals.taxAmount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span>Tax:</span>
                                                            <span>${formatPrice(totals.taxAmount)}</span>
                                                        </div>
                                                    )}
                                                    {totals.shippingCost > 0 && (
                                                        <div className="flex justify-between">
                                                            <span>Shipping:</span>
                                                            <span>${formatPrice(totals.shippingCost)}</span>
                                                        </div>
                                                    )}
                                                    {totals.discountAmount > 0 && (
                                                        <div className="flex justify-between">
                                                            <span>Discount:</span>
                                                            <span>-${formatPrice(totals.discountAmount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                                        <span>Total:</span>
                                                        <span>${formatPrice(totals.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notes & Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes & Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Internal Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            disabled={!can.update}
                                            placeholder="Internal notes (not visible to customer)..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_notes">Customer Notes</Label>
                                        <Textarea
                                            id="customer_notes"
                                            value={data.customer_notes}
                                            onChange={(e) => setData('customer_notes', e.target.value)}
                                            disabled={!can.update}
                                            placeholder="Notes visible to customer..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                                        <Textarea
                                            id="terms_and_conditions"
                                            value={data.terms_and_conditions}
                                            onChange={(e) => setData('terms_and_conditions', e.target.value)}
                                            disabled={!can.update}
                                            placeholder="Terms and conditions..."
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.sales-orders.index'))}
                                        >
                                            Cancel
                                        </Button>
                                        {can.update && (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                {processing ? 'Updating...' : 'Update Sales Order'}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </motion.div>
                </div>
            </div>
        </Authenticated>
    );
}

export default SalesOrderEdit;