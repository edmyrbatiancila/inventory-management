import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Edit2, Package, Plus, Save, TrendingDown, TrendingUp, WarehouseIcon } from "lucide-react";
import { motion } from "framer-motion"; 
import { Button } from "@/Components/ui/button";
import { StockAdjustment } from "@/types/StockAdjustment/IStockAdjustment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { formatDate } from "@/utils/date";
import { Badge } from "@/Components/ui/badge";
import { Textarea } from "@/Components/ui/textarea";
import { Spinner } from "@/Components/ui/spinner";
import { getReasonText } from "@/hooks/stock-adjustments/reasonText";

interface IStockAdjustmentEditProps {
    stockAdjustment: StockAdjustment;
}

const StockAdjustmentEdit = ({
    stockAdjustment
}: IStockAdjustmentEditProps) => {

    const { data, setData, put, processing, errors, reset } = useForm({
        notes: stockAdjustment.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('admin.stock-adjustments.update', stockAdjustment.id), {
            onSuccess: () => {
                // Optionally show a success message or redirect
            },
            preserveScroll: true,
        });
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Edit Stock Adjustment</h2>
                        <p className="text-sm text-gray-600 mt-1">Update stock adjustment information</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Stock Adjustment" />
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
                            {/* Reference Information (READ ONLY) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        Adjustment Reference
                                    </CardTitle>
                                    <CardDescription>Basic adjustment information (cannot be modified)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Reference Number</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded border font-mono text-sm">
                                                {stockAdjustment.reference_number}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Adjustment Date</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                                                {formatDate(stockAdjustment.adjusted_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Adjusted By</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                                            {stockAdjustment.adjusted_by?.name ||'Unknown User'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inventory Information (READ ONLY) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <WarehouseIcon className="w-5 h-5 text-blue-600" />
                                        Inventory Details
                                    </CardTitle>
                                    <CardDescription>Product and warehouse information (cannot be modified)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Product</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded border">
                                                <div className="font-medium">{stockAdjustment.inventory.product.name}</div>
                                                <div className="text-sm text-gray-500">SKU: {stockAdjustment.inventory.product.sku}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Warehouse</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded border">
                                                <div className="font-medium">{stockAdjustment.inventory.warehouse.name}</div>
                                                <div className="text-sm text-gray-500">{stockAdjustment.inventory.warehouse.code}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Adjustment Details (READ ONLY) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                        Adjustment Information
                                    </CardTitle>
                                    <CardDescription>Quantity and type details (cannot be modified)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Type</Label>
                                            <div className="mt-1">
                                                <Badge variant={stockAdjustment.adjustment_type === 'increase' ? 'default' : 'secondary'}>
                                                    {stockAdjustment.adjustment_type === 'increase' ? (
                                                        <>
                                                            <TrendingUp className="w-3 h-3 mr-1" /> 
                                                            Increase
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="w-3 h-3 mr-1" /> 
                                                            Decrease
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Quantity Adjusted</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded border">
                                                <span className={`font-semibold text-lg ${
                                                    stockAdjustment.adjustment_type === 'increase' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {stockAdjustment.adjustment_type === 'increase' ? '+' : '-'}{stockAdjustment.quantity_adjusted.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Reason</Label>
                                            <div className="mt-1">
                                                <Badge variant="outline">
                                                    {getReasonText(stockAdjustment.reason)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stock Level Changes */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Stock Level Changes</Label>
                                        <div className="mt-1 p-3 bg-blue-50 rounded border">
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span className="text-gray-600">
                                                    {stockAdjustment.quantity_before.toLocaleString()}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900">
                                                    {stockAdjustment.quantity_after.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-center text-xs text-gray-500 mt-1">
                                                Before → After
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes (EDITABLE) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Edit2 className="w-5 h-5 text-blue-600" />
                                        Additional Notes
                                    </CardTitle>
                                    <CardDescription>You can update the notes for this adjustment</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Enter any additional notes about this adjustment..."
                                        rows={4}
                                        maxLength={1000}
                                        className="mt-1"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="text-xs text-gray-500">
                                            {data.notes.length}/1000 characters
                                        </div>
                                        {errors.notes && (
                                            <span className="text-red-500 text-sm">{errors.notes}</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-end space-x-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.stock-adjustments.show', stockAdjustment.id))}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.stock-adjustments.index'))}
                                        >
                                            Cancel
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

export default StockAdjustmentEdit;