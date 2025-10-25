import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Asterisk, ClipboardList, Package, Save, WarehouseIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Product } from "@/types/Product/IProduct";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";

interface ICreateInventoryProps {
    products: Product[];
    warehouses: Warehouse[];
}

const CreateInventory = ({
    products,
    warehouses
}: ICreateInventoryProps) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        warehouse_id: '',
        quantity_on_hand: '0',
        quantity_reserved: '0',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.inventories.store'), {
            // No need to reset form since we're redirecting to edit page
            preserveScroll: true,
        });
    };

    // Helper function to get selected product details
    const getSelectedProduct = () => {
        return products.find(product => product.id.toString() === data.product_id);
    };

    // Helper function to get selected warehouse details
    const getSelectedWarehouse = () => {
        return warehouses.find(warehouse => warehouse.id.toString() === data.warehouse_id);
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <ClipboardList className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Inventory</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new inventory item</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Inventory" />
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
                                onClick={() => router.visit(route('admin.inventories.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Inventory List
                            </Button>
                        </div>

                        <form
                            onSubmit={ handleSubmit }
                            className="space-y-8"
                        >
                            {/* Product & Warehouse Selection Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="flex items-center gap-2" />
                                        Product & Location Selection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Product Selection */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="product_id"
                                                className="flex items-center gap-1"
                                            >
                                                Product
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Select
                                                value={data.product_id}
                                                onValueChange={(value) => setData('product_id', value)}
                                            >
                                                <SelectTrigger className={errors.product_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem
                                                        key={ product.id }
                                                        value={ product.id.toString() }
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{product.name}</span>
                                                            <span className="text-sm text-gray-500">
                                                                SKU: {product.sku || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={ errors.product_id } />
                                        {getSelectedProduct() && (
                                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Category:</strong> {getSelectedProduct()?.category?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-blue-800">
                                                    <strong>Brand:</strong> {getSelectedProduct()?.brand?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-blue-800">
                                                    <strong>Min Stock Level:</strong> {getSelectedProduct()?.min_stock_level || 0}
                                                </p>
                                            </div>
                                        )}
                                        </div>

                                        {/* Warehouse Selection */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="warehouse_id"
                                                className="flex items-center gap-1"
                                            >
                                                Warehouse
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Select
                                                value={data.warehouse_id}
                                                onValueChange={(value) => setData('warehouse_id', value)}
                                            >
                                                <SelectTrigger className={errors.warehouse_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem
                                                        key={ warehouse.id }
                                                        value={ warehouse.id.toString() }
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{warehouse.name}</span>
                                                            <span className="text-sm text-gray-500">
                                                                Code: {warehouse.code}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.warehouse_id} />
                                        {getSelectedWarehouse() && (
                                            <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm text-green-800">
                                                    <strong>Location:</strong> {getSelectedWarehouse()?.city}, {getSelectedWarehouse()?.state}
                                                </p>
                                                <p className="text-sm text-green-800">
                                                    <strong>Status:</strong> {getSelectedWarehouse()?.is_active ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quantity Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5" />
                                        Quantity Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Quantity on Hand */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="quantity_on_hand"
                                                className="flex items-center gap-1"
                                            >
                                                Quantity On Hand
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input 
                                                id="quantity_on_hand"
                                                type="number"
                                                min="0"
                                                value={data.quantity_on_hand}
                                                onChange={(e) => setData('quantity_on_hand', e.target.value)}
                                                placeholder="Enter quantity on hand"
                                                className={errors.quantity_on_hand ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.quantity_on_hand} />
                                            <p className="text-sm text-gray-500">
                                                Total physical inventory count
                                            </p>
                                        </div>

                                        {/* Quantity Reserved */}
                                        <div className="space-y-2">
                                            <Label 
                                                htmlFor="quantity_reserved"
                                                className="flex items-center gap-1"
                                            >
                                                Quantity Reserved
                                            </Label>
                                            <Input 
                                                id="quantity_reserved"
                                                type="number"
                                                min="0"
                                                value={data.quantity_reserved}
                                                onChange={(e) => setData('quantity_reserved', e.target.value)}
                                                placeholder="Enter reserved quantity"
                                                className={errors.quantity_reserved ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.quantity_reserved} />
                                            <p className="text-sm text-gray-500">
                                                Quantity reserved for pending orders (optional)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Calculated Available Quantity Display */}
                                    {data.quantity_on_hand && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">Available Quantity:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {(parseInt(data.quantity_on_hand) || 0) - (parseInt(data.quantity_reserved) || 0)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Calculated as: On Hand - Reserved
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <WarehouseIcon className="w-5 h-5" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Notes
                                        </Label>
                                        <Textarea 
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Enter any additional notes about this inventory..."
                                            rows={4}
                                            className={errors.notes ? 'border-red-500' : ''}
                                        />
                                        <InputError message={errors.notes} />
                                        <p className="text-sm text-gray-500">
                                            Optional notes about the inventory item, location, or condition
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.inventories.index'))}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                        
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.product_id || !data.warehouse_id || !data.quantity_on_hand}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Create Inventory
                                                </>
                                            )}
                                        </Button>
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

export default CreateInventory;