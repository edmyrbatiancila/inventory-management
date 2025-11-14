import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building, Calendar, CheckCircle2, FileText, Mail, MapPin, Package, PackagePlus, Phone, Plus, Save, Trash2, User } from "lucide-react";
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
import { PurchaseOrder, CreatePurchaseOrderData, PurchaseOrderItems } from "@/types/PurchaseOrders/IPurchaseOrder";

interface IPurchaseOrderEditProps extends PageProps {
    purchase_order: PurchaseOrder;
    warehouses: Warehouse[];
    products: Product[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    defaultCurrency: string;
    can: {
        update: boolean;
        delete: boolean;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const PurchaseOrderEdit = () => {
    const { props } = usePage<IPurchaseOrderEditProps>();
    const { purchase_order, warehouses, products, statuses, priorities, defaultCurrency, can } = props;

    // Convert purchase order items to the format expected by the form
    const convertPOItemsToFormItems = (): PurchaseOrderItems[] => {
        if (!purchase_order.items || !Array.isArray(purchase_order.items)) return [];
        
        return purchase_order.items.map(item => ({
            product_id: item.product_id,
            quantity_ordered: getNumeric(item.quantity_ordered),
            unit_cost: getNumeric(item.unit_cost),
            discount_percentage: getNumeric(item.discount_percentage || 0),
            notes: item.notes || '',
            line_total: getNumeric(item.final_line_total || item.line_total || 0),
            product: item.product
        }));
    };

    const [items, setItems] = useState<PurchaseOrderItems[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm<CreatePurchaseOrderData>({
        po_number: purchase_order.po_number || '',
        supplier_name: purchase_order.supplier_name || '',
        supplier_email: purchase_order.supplier_email || '',
        supplier_phone: purchase_order.supplier_phone || '',
        supplier_address: purchase_order.supplier_address || '',
        supplier_contact_person: purchase_order.supplier_contact_person || '',
        warehouse_id: purchase_order.warehouse?.id || 0,
        expected_delivery_date: purchase_order.expected_delivery_date || '',
        priority: purchase_order.priority || 'normal',
        currency: defaultCurrency,
        notes: purchase_order.notes || '',
        terms_and_conditions: purchase_order.terms_and_conditions || '',
        items: []
    });

    // Initialize items and form data safely
    useEffect(() => {
        try {
            const convertedItems = convertPOItemsToFormItems();
            setItems(convertedItems);
            setData('items', convertedItems.map(item => ({
                product_id: item.product_id,
                quantity_ordered: item.quantity_ordered,
                unit_cost: item.unit_cost,
                discount_percentage: item.discount_percentage,
                notes: item.notes,
                line_total: item.line_total
            })));
            setIsDataLoaded(true);
        } catch (error) {
            console.error('Error initializing purchase order data:', error);
            setIsDataLoaded(true); // Still set as loaded to show the form
        }
    }, [purchase_order]);

    // Add new item to the list
    const addItem = () => {
        const newItem: PurchaseOrderItems = {
            product_id: 0,
            quantity_ordered: 1,
            unit_cost: 0,
            discount_percentage: 0,
            notes: '',
            line_total: 0
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
            const quantity = field === 'quantity_ordered' ? parseFloat(value) || 0 : updatedItems[index].quantity_ordered;
            const unitCost = field === 'unit_cost' ? parseFloat(value) || 0 : updatedItems[index].unit_cost;
            const discountPercentage = field === 'discount_percentage' ? parseFloat(value) || 0 : updatedItems[index].discount_percentage;
            
            const subtotal = quantity * unitCost;
            const discountAmount = subtotal * (discountPercentage / 100);
            updatedItems[index].line_total = subtotal - discountAmount;
        }

        // Add product details if product_id changes
        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                updatedItems[index].product = selectedProduct;
                updatedItems[index].unit_cost = getNumericPrice(selectedProduct.price);
                // Recalculate line total with the new unit cost
                const quantity = updatedItems[index].quantity_ordered;
                const unitCost = getNumericPrice(selectedProduct.price);
                const discountPercentage = updatedItems[index].discount_percentage;
                const subtotal = quantity * unitCost;
                const discountAmount = subtotal * (discountPercentage / 100);
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

    // Helper function to safely format price
    const formatPrice = (price: any): string => {
        if (typeof price === 'number') {
            return price.toFixed(2);
        }
        if (typeof price === 'string' && !isNaN(parseFloat(price))) {
            return parseFloat(price).toFixed(2);
        }
        return '0.00';
    };

    // Helper function to safely get numeric price
    const getNumericPrice = (price: any): number => {
        if (typeof price === 'number') {
            return price;
        }
        if (typeof price === 'string' && !isNaN(parseFloat(price))) {
            return parseFloat(price);
        }
        return 0;
    };

    // Helper function to safely format any numeric value
    const formatNumeric = (value: any): string => {
        if (typeof value === 'number') {
            return value.toFixed(2);
        }
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            return parseFloat(value).toFixed(2);
        }
        return '0.00';
    };

    // Helper function to safely get numeric value
    const getNumeric = (value: any): number => {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            return parseFloat(value);
        }
        return 0;
    };

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + getNumeric(item.line_total), 0);
        return {
            subtotal,
            total: subtotal
        };
    };

    const totals = calculateTotals();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.purchase-orders.update', purchase_order.id));
    };

    // Helper function to get selected warehouse details
    const getSelectedWarehouse = () => {
        return warehouses.find(warehouse => warehouse.id === data.warehouse_id);
    };

    useEffect(() => {
        if (props.flash && props.flash.success) {
            toast.success(props.flash.success, {
                duration: 4000,
                style: { fontWeight: 'bold', fontSize: '1.1rem' },
                icon: <CheckCircle2 className="text-green-600 w-6 h-6" />,
            });
        }

        if (props.flash && props.flash.error) {
            toast.error(props.flash.error, {
                description: 'Please try again or contact support if the problem persists.',
                duration: 4000,
                style: { fontWeight: 'bold', fontSize: '1.1rem' },
            });
        }
    }, [props.flash]);

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <PackagePlus className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">
                            Edit Purchase Order #{purchase_order.po_number}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Edit an existing purchase order for procurement
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Purchase Order #${purchase_order.po_number}`} />
            
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
                                onClick={() => router.visit(route('admin.purchase-orders.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Purchase Orders
                            </Button>
                        </div>

                        {!isDataLoaded ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading purchase order data...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : !can.update ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4">
                                        You don't have permission to edit this purchase order, or it cannot be edited in its current status.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.purchase-orders.show', purchase_order.id))}
                                    >
                                        View Purchase Order
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Purchase Order Details Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Purchase Order Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* PO Number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="po_number">PO Number</Label>
                                                <Input
                                                    id="po_number"
                                                    value={data.po_number}
                                                    onChange={(e) => setData('po_number', e.target.value)}
                                                    placeholder="Auto-generated"
                                                    readOnly
                                                    className="bg-gray-50"
                                                />
                                                {errors.po_number && <p className="text-sm text-red-600">{errors.po_number}</p>}
                                            </div>

                                            {/* Priority */}
                                            <div className="space-y-2">
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
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
                                                {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
                                            </div>

                                            {/* Expected Delivery Date */}
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
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                                {errors.expected_delivery_date && <p className="text-sm text-red-600">{errors.expected_delivery_date}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Supplier Information Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="w-5 h-5" />
                                            Supplier Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Supplier Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="supplier_name">Supplier Name *</Label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="supplier_name"
                                                        value={data.supplier_name}
                                                        onChange={(e) => setData('supplier_name', e.target.value)}
                                                        placeholder="Enter supplier company name"
                                                        className="pl-10"
                                                        required
                                                    />
                                                </div>
                                                {errors.supplier_name && <p className="text-sm text-red-600">{errors.supplier_name}</p>}
                                            </div>

                                            {/* Supplier Email */}
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
                                                {errors.supplier_email && <p className="text-sm text-red-600">{errors.supplier_email}</p>}
                                            </div>

                                            {/* Supplier Phone */}
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
                                                {errors.supplier_phone && <p className="text-sm text-red-600">{errors.supplier_phone}</p>}
                                            </div>

                                            {/* Contact Person */}
                                            <div className="space-y-2">
                                                <Label htmlFor="supplier_contact_person">Contact Person</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="supplier_contact_person"
                                                        value={data.supplier_contact_person}
                                                        onChange={(e) => setData('supplier_contact_person', e.target.value)}
                                                        placeholder="John Doe"
                                                        className="pl-10"
                                                    />
                                                </div>
                                                {errors.supplier_contact_person && <p className="text-sm text-red-600">{errors.supplier_contact_person}</p>}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier_address">Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Textarea
                                                    id="supplier_address"
                                                    value={data.supplier_address}
                                                    onChange={(e) => setData('supplier_address', e.target.value)}
                                                    placeholder="Full supplier address including city, state, and postal code"
                                                    className="pl-10 min-h-[80px]"
                                                />
                                            </div>
                                            {errors.supplier_address && <p className="text-sm text-red-600">{errors.supplier_address}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Warehouse Selection Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Delivery Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="warehouse_id">Destination Warehouse *</Label>
                                            <Select
                                                value={data.warehouse_id.toString()}
                                                onValueChange={(value) => setData('warehouse_id', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            <div>
                                                                <div className="font-medium">{warehouse.name}</div>
                                                                <div className="text-sm text-gray-500">{warehouse.address}</div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.warehouse_id && <p className="text-sm text-red-600">{errors.warehouse_id}</p>}

                                            {/* Show selected warehouse details */}
                                            {getSelectedWarehouse() && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <h4 className="font-medium text-blue-900 mb-2">Selected Warehouse Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="font-medium text-blue-700">Name:</span>
                                                            <span className="ml-2 text-blue-600">{getSelectedWarehouse()?.name}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-blue-700">Code:</span>
                                                            <span className="ml-2 text-blue-600">{getSelectedWarehouse()?.code}</span>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <span className="font-medium text-blue-700">Address:</span>
                                                            <span className="ml-2 text-blue-600">{getSelectedWarehouse()?.address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Items Section */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="w-5 h-5" />
                                                Order Items
                                            </CardTitle>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addItem}
                                                className="flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Item
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {errors.items && <p className="text-sm text-red-600 mb-4">{errors.items}</p>}
                                        
                                        {items.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">No items added yet</p>
                                                <p className="text-sm">Click "Add Item" to start building your purchase order</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[30%]">Product</TableHead>
                                                            <TableHead className="w-[12%]">Quantity</TableHead>
                                                            <TableHead className="w-[15%]">Unit Cost</TableHead>
                                                            <TableHead className="w-[12%]">Discount %</TableHead>
                                                            <TableHead className="w-[15%]">Line Total</TableHead>
                                                            <TableHead className="w-[16%]">Actions</TableHead>
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
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select product" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {products.map((product) => (
                                                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                                                    <div>
                                                                                        <div className="font-medium">{product.name}</div>
                                                                                        <div className="text-sm text-gray-500">
                                                                                            SKU: {product.sku} | Price: ₱{formatPrice(product.price)}
                                                                                        </div>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {errors[`items.${index}.product_id`] && (
                                                                        <p className="text-xs text-red-600 mt-1">
                                                                            {errors[`items.${index}.product_id`]}
                                                                        </p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.quantity_ordered}
                                                                        onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 0)}
                                                                        className="w-full"
                                                                    />
                                                                    {errors[`items.${index}.quantity_ordered`] && (
                                                                        <p className="text-xs text-red-600 mt-1">
                                                                            {errors[`items.${index}.quantity_ordered`]}
                                                                        </p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="relative">
                                                                        <span className="absolute left-2 top-2 text-gray-500">₱</span>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            value={item.unit_cost}
                                                                            onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                                                            className="pl-6"
                                                                        />
                                                                    </div>
                                                                    {errors[`items.${index}.unit_cost`] && (
                                                                        <p className="text-xs text-red-600 mt-1">
                                                                            {errors[`items.${index}.unit_cost`]}
                                                                        </p>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            step="0.1"
                                                                            value={item.discount_percentage}
                                                                            onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                                                            className="pr-6"
                                                                        />
                                                                        <span className="absolute right-2 top-2 text-gray-500">%</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">
                                                                        ₱{formatNumeric(item.line_total)}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeItem(index)}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                        Remove
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {/* Order Summary */}
                                        {items.length > 0 && (
                                            <div className="mt-6 border-t pt-6">
                                                <div className="flex justify-end">
                                                    <div className="w-80">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span>Subtotal:</span>
                                                                <span>₱{formatNumeric(totals.subtotal)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                                <span>Total:</span>
                                                                <span>₱{formatNumeric(totals.total)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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
                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Internal Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Internal notes (not visible to supplier)"
                                                className="min-h-[100px]"
                                            />
                                            {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                        </div>

                                        {/* Terms and Conditions */}
                                        <div className="space-y-2">
                                            <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                                            <Textarea
                                                id="terms_and_conditions"
                                                value={data.terms_and_conditions}
                                                onChange={(e) => setData('terms_and_conditions', e.target.value)}
                                                placeholder="Terms and conditions for this purchase order"
                                                className="min-h-[100px]"
                                            />
                                            {errors.terms_and_conditions && <p className="text-sm text-red-600">{errors.terms_and_conditions}</p>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.purchase-orders.show', purchase_order.id))}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || items.length === 0}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {processing ? 'Updating...' : 'Update Purchase Order'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </Authenticated>
    );
}

export default PurchaseOrderEdit;