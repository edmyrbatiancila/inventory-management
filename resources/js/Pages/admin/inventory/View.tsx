import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Progress } from "@/Components/ui/progress";
import { Separator } from "@/Components/ui/separator";
import { handleDeleteData } from "@/hooks/deleteFunction";
import { getStatusColor } from "@/hooks/statusInventory";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Inventory, InventoryAnalytics } from "@/types/Inventory/IInventory";
import { cardVariants, containerVariants, headerVariants, staggerContainer } from "@/utils/animationVarians";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Head, Link, router } from "@inertiajs/react";
import { motion, spring } from "framer-motion";
import { Activity, AlertTriangle, ArrowLeft, BarChart3, Building2, Calendar, CheckCircle, Edit, FileBox, Info, Package, PhilippinePeso, Trash2, TrendingDown, Users } from "lucide-react";

interface IInventoryViewProps {
    inventory: Inventory & {
        is_low_stock: boolean;
        stock_satus: string;
    };
    analytics: InventoryAnalytics;
}

const InventoryView = ({
    inventory,
    analytics
}: IInventoryViewProps) => {
    const handleEdit = () => {
        router.visit(route('admin.inventories.edit', inventory.id));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4" />;
            case 'low': return <TrendingDown className="w-4 h-4" />;
            case 'critical': return <AlertTriangle className="w-4 h-4" />;
            case 'out_of_stock': return <AlertTriangle className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
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
                            className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Package className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Inventory Details
                            </motion.h2>
                            <motion.p
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                {inventory.product.name} at {inventory.warehouse.name}
                            </motion.p>
                        </div>
                    </div>
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Link href={route('admin.inventories.index')}>
                            <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Inventories
                                </Button>
                            </motion.div>
                        </Link>
                        <motion.div 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button 
                                onClick={handleEdit} 
                                size="sm"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Inventory
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                        >
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Inventory Record</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this inventory record? 
                                            This will remove "{inventory.product.name}" from "{inventory.warehouse.name}".
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteData(inventory.id, 'admin.inventories.destroy')}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </motion.div>
                    </motion.div>
                </motion.div>
            }
        >
            <Head title={`Inventory - ${inventory.product.name} @ ${inventory.warehouse.name}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stock Status Alert */}
                {(inventory.is_low_stock || analytics.stock_status === 'critical' || analytics.stock_status === 'out_of_stock') && (
                    <motion.div 
                        className={`mb-6 p-4 rounded-lg ${
                            analytics.stock_status === 'out_of_stock' 
                                ? 'bg-red-50 border border-red-200'
                                : analytics.stock_status === 'critical'
                                ? 'bg-orange-50 border border-orange-200'
                                : 'bg-yellow-50 border border-yellow-200'
                        }`}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex items-center">
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <AlertTriangle className={`w-5 h-5 mr-2 ${
                                    analytics.stock_status === 'out_of_stock' ? 'text-red-600' :
                                    analytics.stock_status === 'critical' ? 'text-orange-600' : 'text-yellow-600'
                                }`} />
                            </motion.div>
                            <p className={`font-medium ${
                                analytics.stock_status === 'out_of_stock' ? 'text-red-800' :
                                analytics.stock_status === 'critical' ? 'text-orange-800' : 'text-yellow-800'
                            }`}>
                                {analytics.stock_status === 'out_of_stock' 
                                    ? 'Out of Stock - No units available'
                                    : analytics.stock_status === 'critical'
                                    ? `Critical Stock Level - Only ${inventory.quantity_available} units available`
                                    : `Low Stock Alert - Only ${inventory.quantity_available} units available`
                                }
                            </p>
                        </div>
                    </motion.div>
                )}

                    {/* Overview Cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={cardVariants}>
                            <motion.div
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">On Hand</CardTitle>
                                        <motion.div
                                            animate={{ 
                                                rotate: [0, 360],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ 
                                                duration: 3,
                                                repeat: Infinity,
                                                repeatDelay: 5
                                            }}
                                        >
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5, type: spring, stiffness: 200 }}
                                        >
                                            {inventory.quantity_on_hand}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            Total units
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={cardVariants}>
                            <motion.div
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                                        <motion.div
                                            animate={{ 
                                                scale: [1, 1.2, 1],
                                                opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{ 
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold text-green-600"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                        >
                                            {inventory.quantity_available}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            Ready for use
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={cardVariants}>
                            <motion.div
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Reserved</CardTitle>
                                        <motion.div
                                            animate={{ 
                                                y: [0, -5, 0],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{ 
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold text-orange-600"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                                        >
                                            {inventory.quantity_reserved}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            On hold
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={cardVariants}>
                            <motion.div
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                                        <motion.div
                                            animate={{ 
                                                x: [0, 2, -2, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ 
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                        >
                                            {formatCurrency(analytics.stock_value)}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            At cost price
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Main Content Grid */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Product Information */}
                        <motion.div
                            className="lg:col-span-2 space-y-6"
                            variants={cardVariants}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileBox className="h-5 w-5" />
                                        Product Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Product Name</label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="text-sm text-gray-900">{inventory.product.name}</p>
                                                <Link href={route('admin.products.show', inventory.product.id)}>
                                                    <Button variant="outline" size="sm">
                                                        View Product
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">SKU</label>
                                            <p className="mt-1 text-sm text-gray-900 font-mono">{inventory.product.sku}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Category</label>
                                            <p className="mt-1 text-sm text-gray-900">{inventory.product.category.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Brand</label>
                                            <p className="mt-1 text-sm text-gray-900">{inventory.product.brand.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Price</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatCurrency(inventory.product.price)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Cost Price</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {inventory.product.cost_price ? formatCurrency(inventory.product.cost_price) : 'Not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                            <Building2 className="h-4 w-4" />
                                            Warehouse Location
                                        </label>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-900 font-medium">{inventory.warehouse.name}</p>
                                                <p className="text-xs text-gray-500">Code: {inventory.warehouse.code}</p>
                                                <p className="text-xs text-gray-500">{inventory.warehouse.full_address}</p>
                                            </div>
                                            <Link href={route('admin.warehouses.show', inventory.warehouse.id)}>
                                                <Button variant="outline" size="sm">
                                                    View Warehouse
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                {inventory.notes && (
                                    <>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                                    <Info className="h-4 w-4" />
                                                    Notes
                                            </Label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{inventory.notes}</p>
                                        </div>
                                    </>
                                )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Stock Analytics */}
                        <motion.div
                            className="space-y-6"
                            variants={cardVariants}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Stock Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Current Status</span>
                                        <Badge className={`${getStatusColor(analytics.stock_status)} flex items-center gap-1`}>
                                            {getStatusIcon(analytics.stock_status)}
                                            {analytics.stock_status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Stock Level</span>
                                            <span>{analytics.stock_percentage.toFixed(1)}%</span>
                                        </div>
                                        <Progress 
                                            value={analytics.stock_percentage} 
                                            className="h-2"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Based on min/max stock levels
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">On Hand:</span>
                                            <span className="font-medium">{inventory.quantity_on_hand} units</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Available:</span>
                                            <span className="font-medium text-green-600">{inventory.quantity_available} units</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Reserved:</span>
                                            <span className="font-medium text-orange-600">{inventory.quantity_reserved} units</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Min Level:</span>
                                            <span className="font-medium">{inventory.product.min_stock_level} units</span>
                                        </div>
                                        {inventory.product.max_stock_level && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Max Level:</span>
                                                <span className="font-medium">{inventory.product.max_stock_level} units</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Reorder Needed:</span>
                                            <Badge variant={analytics.reorder_suggested ? "destructive" : "secondary"}>
                                                {analytics.reorder_suggested ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Record Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <span className="text-gray-600">Inventory ID:</span>
                                        <p className="font-medium font-mono">#{inventory.id}</p>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-600">Created:</span>
                                        <p className="font-medium">{formatDate(inventory.created_at)}</p>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <p className="font-medium">{formatDate(inventory.updated_at)}</p>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-600">Stock Value:</span>
                                        <p className="font-medium">{formatCurrency(analytics.stock_value)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default InventoryView;