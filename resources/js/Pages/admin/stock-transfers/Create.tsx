import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, ArrowRightLeft, Asterisk, ClipboardList, Package, Split, WarehouseIcon, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Product } from "@/types/Product/IProduct";
import { CreateStockTransferData } from "@/types/StockTransfer/IStockTransfer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Spinner } from "@/Components/ui/spinner";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useInventoryAvailability } from "@/hooks/stock-transfers/useInventoryAvailability";
import { useWarehouseProducts } from "@/hooks/useWarehouseProducts";
import { useEffect } from "react";

interface IStockTransferCreateProps {
    warehouses: Warehouse[];
    products: Product[];
}

const StockTransferCreate = ({
    warehouses,
    products
}: IStockTransferCreateProps) => {

    const { data, setData, post, processing, errors, reset } = useForm<CreateStockTransferData>({
        from_warehouse_id: 0,
        to_warehouse_id: 0,
        product_id: 0,
        quantity_transferred: 1,
        notes: ''
    });

    const { 
        checkInventory, 
        inventoryData, 
        isLoading, 
        error,
        clearInventoryData
    } = useInventoryAvailability();

    const {
        products: availableProducts,
        loading: productsLoading,
        error: productsError,
        fetchProducts,
        clearProducts
    } = useWarehouseProducts();

    // Fetch products when source warehouse changes
    useEffect(() => {
        if (data.from_warehouse_id) {
            // Clear current product selection when warehouse changes
            setData('product_id', 0);
            clearInventoryData();
            
            // Fetch products available in this warehouse
            fetchProducts(data.from_warehouse_id);
        } else {
            // Clear products when no warehouse selected
            clearProducts();
            setData('product_id', 0);
            clearInventoryData();
        }
    }, [data.from_warehouse_id, fetchProducts, clearProducts, clearInventoryData, setData]);

    // Check inventory when both warehouse and product are selected
    useEffect(() => {
        // Clear inventory data when warehouse or product changes
        if (!data.from_warehouse_id || !data.product_id) {
            clearInventoryData();
            return;
        }
        
        if (data.from_warehouse_id && data.product_id) {
            checkInventory(data.from_warehouse_id, data.product_id);
        }
    }, [data.from_warehouse_id, data.product_id, checkInventory, clearInventoryData]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.stock-transfers.store'), {
            // No need to reset form since we're redirecting to edit page
            preserveScroll: true,
        });
    };

    // Helper function to get selected source warehouse details
    const getSelectedFromWarehouse = () => {
        return warehouses.find(warehouse => warehouse.id === data.from_warehouse_id);
    };

    // Helper function to get selected destination warehouse details
    const getSelectedToWarehouse = () => {
        return warehouses.find(warehouse => warehouse.id === data.to_warehouse_id);
    };

    // Helper function to get selected product details from available products
    const getSelectedProduct = () => {
        return availableProducts.find(product => product.id === data.product_id);
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100">
                        <ArrowRightLeft className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Stock Transfer</h2>
                        <p className="text-sm text-gray-600 mt-1">Transfer inventory between warehouses</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Stock Transfer" />
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
                                onClick={() => router.visit(route('admin.stock-transfers.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Stock Transfer List
                            </Button>
                        </div>

                        <form
                            onSubmit={ handleSubmit }
                            className="space-y-8"
                        >
                            {/* Warehouse Selection Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <WarehouseIcon className="w-5 h-5 text-purple-600" />
                                        Warehouse Selection
                                    </CardTitle>
                                    <CardDescription>Select source and destination warehouses for the transfer</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Source Warehouse Selection */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="from_warehouse_id" 
                                                className="flex items-center gap-1"
                                            >
                                                From Warehouse
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Select
                                                value={data.from_warehouse_id.toString() || ""} 
                                                onValueChange={(value) => {
                                                    const newWarehouseId = parseInt(value);
                                                    setData('from_warehouse_id', newWarehouseId);
                                                }}
                                            >
                                                <SelectTrigger className={errors.from_warehouse_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select source warehouse..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {warehouses.filter(w => w.is_active).map((warehouse) => (
                                                    <SelectItem
                                                        key={warehouse.id}
                                                        value={warehouse.id.toString()}
                                                        disabled={warehouse.id === data.to_warehouse_id}
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
                                            <InputError message={errors.from_warehouse_id} />
                                            {getSelectedFromWarehouse() && (
                                                <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                                                    <p className="text-sm text-orange-800">
                                                        <strong>Location:</strong> {getSelectedFromWarehouse()?.city}, {getSelectedFromWarehouse()?.state}
                                                    </p>
                                                    <p className="text-sm text-orange-800">
                                                        <strong>Status:</strong> {getSelectedFromWarehouse()?.is_active ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Destination Warehouse Selection */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="to_warehouse_id" 
                                                className="flex items-center gap-1"
                                            >
                                                To Warehouse
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Select
                                                value={data.to_warehouse_id.toString() || ""} 
                                                onValueChange={(value) => {
                                                    const newWarehouseId = parseInt(value);
                                                    setData('to_warehouse_id', newWarehouseId);
                                                }}
                                            >
                                                <SelectTrigger className={errors.to_warehouse_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select destination warehouse..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {warehouses.filter(w => w.is_active).map((warehouse) => (
                                                    <SelectItem 
                                                        key={warehouse.id}
                                                        value={warehouse.id.toString()}
                                                        disabled={warehouse.id === data.from_warehouse_id}
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
                                            <InputError message={errors.to_warehouse_id} />
                                            {getSelectedToWarehouse() && (
                                                <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                                    <p className="text-sm text-green-800">
                                                        <strong>Location:</strong> {getSelectedToWarehouse()?.city}, {getSelectedToWarehouse()?.state}
                                                    </p>
                                                    <p className="text-sm text-green-800">
                                                        <strong>Status:</strong> {getSelectedToWarehouse()?.is_active ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product & Quantity Selection Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        Product & Quantity Information
                                    </CardTitle>
                                    <CardDescription>Choose the product and specify transfer quantity</CardDescription>
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
                                                value={data.product_id.toString() || ""} 
                                                onValueChange={(value) => {
                                                    const newProductId = parseInt(value);
                                                    setData('product_id', newProductId);
                                                }}
                                                disabled={!data.from_warehouse_id || productsLoading}
                                            >
                                                <SelectTrigger className={errors.product_id ? 'border-red-500' : ''}>
                                                    <SelectValue 
                                                        placeholder={
                                                            !data.from_warehouse_id 
                                                                ? "Select source warehouse first..." 
                                                                : productsLoading 
                                                                    ? "Loading products..." 
                                                                    : availableProducts.length === 0
                                                                        ? "No products available in this warehouse"
                                                                        : "Select product to transfer..."
                                                        } 
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableProducts.map((product) => (
                                                        <SelectItem 
                                                            key={product.id}
                                                            value={product.id.toString()}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{product.name}</span>
                                                                <span className="text-sm text-gray-500">
                                                                    SKU: {product.sku}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.product_id} />
                                            
                                            {/* Products Loading State */}
                                            {productsLoading ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Loading available products...
                                                </div>
                                            ) : null}
                                            
                                            {/* Products Error */}
                                            {productsError ? (
                                                <Alert className="border-red-200 bg-red-50">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-700">
                                                        Failed to load products: {productsError}
                                                    </AlertDescription>
                                                </Alert>
                                            ) : null}
                                            
                                            {/* No Products Available */}
                                            {!productsLoading && !productsError && data.from_warehouse_id && availableProducts.length === 0 ? (
                                                <Alert className="border-yellow-200 bg-yellow-50">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    <AlertDescription className="text-yellow-700">
                                                        <strong>No products available</strong> in the selected warehouse. 
                                                        Please select a different warehouse or ensure inventory is available.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : null}
                                            
                                            {/* Selected Product Info */}
                                            {data.product_id && availableProducts.length > 0 ? (() => {
                                                const selectedProduct = availableProducts.find(p => p.id === data.product_id);
                                                return selectedProduct ? (
                                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Category:</strong> {selectedProduct.category?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Brand:</strong> {selectedProduct.brand?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-blue-800">
                                                            <strong>SKU:</strong> {selectedProduct.sku}
                                                        </p>
                                                    </div>
                                                ) : null;
                                            })() : null}
                                        </div>

                                        {/* Transfer Quantity */}
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity_transferred" className="flex items-center gap-1">
                                                Quantity to Transfer
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input
                                                id="quantity_transferred"
                                                type="number"
                                                min="1"
                                                max="999999"
                                                value={data.quantity_transferred}
                                                onChange={(e) => setData('quantity_transferred', parseInt(e.target.value) || 1)}
                                                placeholder="Enter quantity to transfer..."
                                                className={errors.quantity_transferred ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.quantity_transferred} />
                                            <p className="text-sm text-gray-500">
                                                Quantity to transfer from source to destination warehouse
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stock Availability Check */}
                                    {data.from_warehouse_id && data.product_id ? (
                                        <div 
                                            key={`inventory-${data.from_warehouse_id}-${data.product_id}`}
                                            className="mt-4"
                                        >
                                            {isLoading ? (
                                                <div className="p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-sm text-gray-600">
                                                            Checking inventory availability...
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : error ? (
                                                <Alert className="border-red-200 bg-red-50">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-700">
                                                        Failed to check inventory: {error}
                                                    </AlertDescription>
                                                </Alert>
                                            ) : inventoryData ? (
                                                <Alert className={`${
                                                    inventoryData.has_inventory 
                                                        ? 'border-green-200 bg-green-50' 
                                                        : 'border-red-200 bg-red-50'
                                                }`}>
                                                    {inventoryData.has_inventory ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <AlertDescription className={
                                                        inventoryData.has_inventory 
                                                            ? 'text-green-700' 
                                                            : 'text-red-700'
                                                    }>
                                                        {inventoryData.has_inventory ? (
                                                            <>
                                                                <strong>Available Inventory:</strong> {inventoryData.available_quantity} units
                                                                {data.quantity_transferred > inventoryData.available_quantity ? (
                                                                    <span className="block mt-1 font-medium">
                                                                        ⚠️ Requested quantity ({data.quantity_transferred}) exceeds available stock
                                                                    </span>
                                                                ) : inventoryData.is_sufficient ? (
                                                                    <span className="block mt-1">
                                                                        ✅ Sufficient stock for transfer
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <strong>No Inventory Available</strong>
                                                                <span className="block mt-1">
                                                                    The selected product has no available inventory in the source warehouse. 
                                                                    Stock transfer cannot be created.
                                                                </span>
                                                            </>
                                                        )}
                                                    </AlertDescription>
                                                </Alert>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>

                            {/* Transfer Notes Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5 text-gray-600" />
                                        Additional Information
                                    </CardTitle>
                                    <CardDescription>Optional notes and transfer details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Transfer Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes || ''}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Enter transfer notes, reason, or special instructions..."
                                            rows={4}
                                            maxLength={1000}
                                            className={errors.notes ? 'border-red-500' : ''}
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {(data.notes || '').length}/1000 characters
                                        </div>
                                        <InputError message={errors.notes} />
                                        <p className="text-sm text-gray-500">
                                            Optional notes about the transfer reason, special handling instructions, or other relevant details
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transfer Summary Card */}
                            {data.from_warehouse_id && data.to_warehouse_id && data.product_id && data.quantity_transferred ? (
                                <Card className="border-purple-200 bg-purple-50">
                                    <CardHeader>
                                        <CardTitle className="text-purple-800 flex items-center gap-2">
                                            <ArrowRightLeft className="w-5 h-5" />
                                            Transfer Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-700">From:</span>
                                                    <span className="font-medium text-purple-900">
                                                        {getSelectedFromWarehouse()?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-purple-700">To:</span>
                                                    <span className="font-medium text-purple-900">
                                                        {getSelectedToWarehouse()?.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-700">Product:</span>
                                                    <span className="font-medium text-purple-900">
                                                        {getSelectedProduct()?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-purple-700">Quantity:</span>
                                                    <span className="font-medium text-purple-900">{data.quantity_transferred}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ): null}

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.stock-transfers.index'))}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                        
                                        <Button
                                            type="submit"
                                            disabled={Boolean(
                                                processing || 
                                                !data.from_warehouse_id || 
                                                !data.to_warehouse_id || 
                                                !data.product_id || 
                                                !data.quantity_transferred ||
                                                data.from_warehouse_id === data.to_warehouse_id ||
                                                isLoading ||
                                                (inventoryData?.has_inventory === false) ||
                                                (inventoryData && data.quantity_transferred > inventoryData.available_quantity)
                                            )}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner />
                                                    Creating Transfer...
                                                </>
                                            ) : isLoading ? (
                                                <>
                                                    <Spinner />
                                                    Checking Inventory...
                                                </>
                                            ) : (inventoryData?.has_inventory === false) ? (
                                                <>
                                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                                    No Inventory Available
                                                </>
                                            ) : (inventoryData && data.quantity_transferred > inventoryData.available_quantity) ? (
                                                <>
                                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                                    Insufficient Stock
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                                                    Create Stock Transfer
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

export default StockTransferCreate;