import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Asterisk, ClipboardList, Plus, Save, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Inventory } from "@/types/Inventory/IInventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import InputError from "@/Components/InputError";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Spinner } from "@/Components/ui/spinner";

interface IStockAdjustmentCreateProps {
    inventories: Inventory[];
    reasons: Record<string, string>;
}

const StockAdjustmentCreate = ({
    inventories,
    reasons
}: IStockAdjustmentCreateProps) => {

    const { data, setData, post, processing, errors, reset } = useForm({
        inventory_id: '',
        adjustment_type: '',
        quantity_adjusted: '1',
        reason: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.stock-adjustments.store'), {
            // No need to reset form since we're redirecting to edit page
            preserveScroll: true,
        });
    };

    // Helper function to get selected inventory details
    const getSelectedInventory = () => {
        return inventories.find(inventory => inventory.id.toString() === data.inventory_id);
    };

    // Helper function to calculate projected stock
    const getProjectedStock = () => {
        const selectedInventory = getSelectedInventory();
        if (!selectedInventory || !data.quantity_adjusted || !data.adjustment_type) return null;
        
        const currentStock = selectedInventory.quantity_on_hand;
        const adjustment = parseInt(data.quantity_adjusted);
        
        return data.adjustment_type === 'increase' 
            ? currentStock + adjustment 
            : currentStock - adjustment;
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Stock Adjustment</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new stock adjustment</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Stock Adjustment" />
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
                                onClick={() => router.visit(route('admin.stock-adjustments.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Stock Adjustment List
                            </Button>
                        </div>

                        <form
                            onSubmit={ handleSubmit }
                            className="space-y-8"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="flex items-center gap-2" />
                                        Inventory Selection
                                    </CardTitle>
                                    <CardDescription>Select the product and warehouse combination</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Label 
                                        htmlFor="inventory_id"
                                        className="flex items-center gap-1"
                                    >
                                        Product @ Warehouse
                                        <Asterisk className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Select
                                        value={data.inventory_id} 
                                        onValueChange={(value) => setData('inventory_id', value)}
                                    >
                                        <SelectTrigger className={errors.inventory_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select product and warehouse..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {inventories.map((inventory) => (
                                            <SelectItem 
                                                key={inventory.id}
                                                value={inventory.id.toString()}
                                            >
                                                <div className="flex flex-col">
                                                    <span>
                                                        {inventory.product.name} @ {inventory.warehouse.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Current Stock: {inventory.quantity_on_hand} | SKU: {inventory.product.sku}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.inventory_id} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Adjustment Type</CardTitle>
                                    <CardDescription>Choose whether to increase or decrease stock</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <RadioGroup
                                        value={data.adjustment_type} 
                                        onValueChange={(value) => setData('adjustment_type', value)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="increase" id="increase" />
                                            <Label htmlFor="increase" className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                                Increase Stock
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="decrease" id="decrease" />
                                            <Label htmlFor="decrease" className="flex items-center gap-2">
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                                Decrease Stock
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={errors.adjustment_type} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quantity to Adjust</CardTitle>
                                    <CardDescription>Enter the amount to adjust</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Label 
                                        htmlFor="quantity_adjusted"
                                        className="flex items-center gap-1">
                                        Quantity
                                        <Asterisk className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Input
                                        id="quantity_adjusted"
                                        type="number"
                                        min="1"
                                        value={data.quantity_adjusted}
                                        onChange={(e) => setData('quantity_adjusted', e.target.value)}
                                        placeholder="Enter quantity..."
                                    />
                                    <InputError message={ errors.quantity_adjusted } />
                                    
                                    {/* Show current stock preview if inventory is selected */}
                                    {data.inventory_id && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                            Current Stock: {getSelectedInventory()?.quantity_on_hand || 0}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Adjustment Reason</CardTitle>
                                    <CardDescription>Select the reason for this adjustment</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Label 
                                        htmlFor="reason"
                                        className="flex items-center gap-1"
                                    >
                                        Reason
                                        <Asterisk className="w-3 h-3 text-red-500" />
                                    </Label>
                                    <Select value={data.reason} onValueChange={(value) => setData('reason', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reason..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(reasons).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={ errors.reason } />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Notes</CardTitle>
                                    <CardDescription>Optional additional information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Enter any additional notes..."
                                        rows={3}
                                        maxLength={1000}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {data.notes.length}/1000 characters
                                    </div>
                                    <InputError message={ errors.notes } />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.stock-adjustments.index'))}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                        
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.inventory_id || !data.adjustment_type || !data.quantity_adjusted || !data.reason}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Stock Adjustment
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

export default StockAdjustmentCreate;