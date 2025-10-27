import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { getReasonText } from "@/hooks/stock-adjustments/reasonText";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { StockAdjustment } from "@/types/StockAdjustment/IStockAdjustment";
import { formatDate } from "@/utils/date";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Edit2, Eye, Package, TrendingDown, TrendingUp, User, WarehouseIcon } from "lucide-react";

interface IStockAdjustmentViewProps {
    stockAdjustment: StockAdjustment;
}

const StockAdjustmentView = ({ stockAdjustment }: IStockAdjustmentViewProps) => {

    const handleEdit = () => {
        router.visit(route('admin.stock-adjustments.edit', stockAdjustment.id));
    };

    return (
        <Authenticated
            header={
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100">
                            <Eye className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl font-bold leading-tight text-gray-800">
                                Stock Adjustment Details
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {stockAdjustment.reference_number} • {formatDate(stockAdjustment.adjusted_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleEdit}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Notes
                        </Button>
                    </div>
                </motion.div>
            }
        >
            <Head title={`Stock Adjustment - ${stockAdjustment.reference_number}`} />

            <motion.div
                className="py-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => router.visit(route('admin.stock-adjustments.index'))}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Stock Adjustments
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Reference Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-600" />
                                    Adjustment Reference
                                </CardTitle>
                                <CardDescription>Basic adjustment information and audit trail</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Reference Number</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded border">
                                            <span className="font-mono text-sm font-medium">
                                                {stockAdjustment.reference_number}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Adjustment Date</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded border flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">{formatDate(stockAdjustment.adjusted_at)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Adjusted By</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded border flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">{stockAdjustment.adjusted_by?.name || 'Unknown User'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <WarehouseIcon className="w-5 h-5 text-indigo-600" />
                                    Inventory Details
                                </CardTitle>
                                <CardDescription>Product and warehouse information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-gray-700">Product Information</Label>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                                            <div className="font-semibold text-lg text-gray-900">
                                                {stockAdjustment.inventory.product.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                SKU: <span className="font-mono">{stockAdjustment.inventory.product.sku}</span>
                                            </div>
                                            {stockAdjustment.inventory.product.description && (
                                                <div className="text-sm text-gray-500 mt-2">
                                                    {stockAdjustment.inventory.product.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-gray-700">Warehouse Information</Label>
                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                                            <div className="font-semibold text-lg text-gray-900">
                                                {stockAdjustment.inventory.warehouse.name}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Code: <span className="font-mono">{stockAdjustment.inventory.warehouse.code}</span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-2">
                                                {stockAdjustment.inventory.warehouse.city}, {stockAdjustment.inventory.warehouse.state}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Adjustment Summary - Highlighted Card */}
                        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    Adjustment Summary
                                </CardTitle>
                                <CardDescription>Complete overview of the stock adjustment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                        <Label className="text-sm font-medium text-gray-700">Adjustment Type</Label>
                                        <div className="mt-2">
                                            <Badge 
                                                variant={stockAdjustment.adjustment_type === 'increase' ? 'default' : 'secondary'}
                                                className="text-base px-3 py-1"
                                            >
                                                {stockAdjustment.adjustment_type === 'increase' ? (
                                                    <>
                                                        <TrendingUp className="w-4 h-4 mr-1" /> 
                                                        Stock Increase
                                                    </>
                                                ) : (
                                                    <>
                                                        <TrendingDown className="w-4 h-4 mr-1" /> 
                                                        Stock Decrease
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                        <Label className="text-sm font-medium text-gray-700">Quantity Adjusted</Label>
                                        <div className="mt-2">
                                            <div className={`text-3xl font-bold ${
                                                stockAdjustment.adjustment_type === 'increase' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {stockAdjustment.adjustment_type === 'increase' ? '+' : '-'}
                                                {stockAdjustment.quantity_adjusted.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                        <Label className="text-sm font-medium text-gray-700">Reason</Label>
                                        <div className="mt-2">
                                            <Badge variant="outline" className="text-base px-3 py-1">
                                                {getReasonText(stockAdjustment.reason)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Level Visualization */}
                                <div className="p-4 bg-white rounded-lg shadow-sm">
                                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Stock Level Changes</Label>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-600">
                                                {stockAdjustment.quantity_before.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">Before</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-6 h-6 text-gray-400" />
                                            <div className={`px-3 py-1 rounded text-sm font-medium ${
                                                stockAdjustment.adjustment_type === 'increase' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {stockAdjustment.adjustment_type === 'increase' ? '+' : '-'}
                                                {stockAdjustment.quantity_adjusted.toLocaleString()}
                                            </div>
                                            <ArrowRight className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {stockAdjustment.quantity_after.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">After</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Section */}
                        {stockAdjustment.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Edit2 className="w-5 h-5 text-indigo-600" />
                                        Additional Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {stockAdjustment.notes}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(route('admin.stock-adjustments.index'))}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to List
                                    </Button>
                                    <Button
                                        onClick={handleEdit}
                                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Notes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default StockAdjustmentView;