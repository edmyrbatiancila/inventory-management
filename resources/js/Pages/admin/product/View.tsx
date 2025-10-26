import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { 
    FileBox, 
    Edit, 
    Trash2, 
    ArrowLeft, 
    Package, 
    Building2, 
    TrendingUp, 
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Clock,
    MapPin,
    DollarSign,
    Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import { Product, ProductAnalytics, ProductStockSummary } from "@/types/Product/IProduct";
import { motion } from "framer-motion";
import { Brand, Category } from "@/types";
import { cardVariants, containerVariants, headerVariants, staggerContainer } from "@/utils/animationVarians";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { handleDeleteData } from "@/hooks/deleteFunction";

interface ProductDetailsProps {
    product: Product & {
        category: Category;
        brand: Brand;
    };
    stockSummary: ProductStockSummary;
    analytics: ProductAnalytics;
}

const ProductDetailsView = ({ product, stockSummary, analytics }: ProductDetailsProps) => {
    const handleEdit = () => {
        router.visit(route('admin.products.edit', product.id));
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
                            <FileBox className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2 
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {product.name}
                            </motion.h2>
                            <motion.p 
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                SKU: {product.sku}
                            </motion.p>
                        </div>
                    </div>
                    <motion.div 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Link href={route('admin.products.index')}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Products
                                </Button>
                            </motion.div>
                        </Link>
                        <motion.div 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button onClick={handleEdit} size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Product
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
                                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{product.name}"? 
                                            This action cannot be undone and will permanently remove this product.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteData(product.id, 'admin.products.destroy')}
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
            <Head title={`Product Details - ${product.name}`} />
            
            <motion.div 
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stock Status Alert */}
                    {stockSummary.is_low_stock && (
                        <motion.div 
                            className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                            // variants={alertVariants}
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
                                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                                </motion.div>
                                <p className="text-orange-800 font-medium">
                                    Low Stock Alert: Only {stockSummary.total_available} units available
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
                        <motion.div>
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
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
                                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                        >
                                            {stockSummary.total_stock}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            {stockSummary.total_reserved} reserved
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        <motion.div>
                            <motion.div
                                // variants={cardVariants}
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
                                            {stockSummary.total_available}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            Ready for sale
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        <motion.div>
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
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
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                                        >
                                            {formatCurrency(analytics.current_stock.stock_value)}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            At cost price
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        <motion.div>
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Locations</CardTitle>
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
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                        >
                                            {analytics.locations}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            Warehouses
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Product Details */}
                        <motion.div 
                            className="lg:col-span-2 space-y-6"
                            // variants={itemVariants}
                        >
                            {/* Basic Information */}
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <motion.div
                                                // animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Tag className="w-5 h-5" />
                                            </motion.div>
                                            Product Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <motion.div 
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Name</label>
                                                <p className="text-gray-900 mt-1">{product.name}</p>
                                            </motion.div>
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">SKU</label>
                                                <p className="text-gray-900 mt-1 font-mono">{product.sku}</p>
                                            </motion.div>
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Barcode</label>
                                                <p className="text-gray-900 mt-1 font-mono">
                                                    {product.barcode || 'N/A'}
                                                </p>
                                            </motion.div>
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Status</label>
                                                <div className="mt-1">
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Badge variant={product.is_active ? "default" : "secondary"}>
                                                            {product.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                        
                                        <Separator />
                                        
                                        <motion.div>
                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                            <p className="text-gray-900 mt-1">{product.description}</p>
                                        </motion.div>
                                        
                                        <motion.div 
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                            variants={staggerContainer}
                                        >
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Category</label>
                                                <p className="text-gray-900 mt-1">{product.category.name}</p>
                                            </motion.div>
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Brand</label>
                                                <p className="text-gray-900 mt-1">{product.brand.name}</p>
                                            </motion.div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Pricing Information */}
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <motion.div
                                                // animate={{ 
                                                //     y: [0, -5, 0],
                                                //     rotate: [0, 5, -5, 0]
                                                // }}
                                                transition={{ 
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <DollarSign className="w-5 h-5" />
                                            </motion.div>
                                            Pricing & Costs
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Selling Price</label>
                                                <motion.p 
                                                    className="text-2xl font-bold text-green-600 mt-1"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.2, type: "spring" }}
                                                >
                                                    {formatCurrency(product.price)}
                                                </motion.p>
                                            </motion.div>
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Cost Price</label>
                                                <motion.p 
                                                    className="text-xl font-semibold text-gray-900 mt-1"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.3, type: "spring" }}
                                                >
                                                    {product.cost_price ? formatCurrency(product.cost_price) : 'N/A'}
                                                </motion.p>
                                            </motion.div>
                                            <motion.div>
                                                <label className="text-sm font-medium text-gray-700">Profit Margin</label>
                                                <motion.p 
                                                    className="text-xl font-semibold text-blue-600 mt-1"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.4, type: "spring" }}
                                                >
                                                    {product.cost_price 
                                                        ? `${(((product.price - product.cost_price) / product.price) * 100).toFixed(1)}%`
                                                        : 'N/A'
                                                    }
                                                </motion.p>
                                            </motion.div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Stock Levels by Location */}
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <motion.div
                                                // animate={{ 
                                                //     x: [0, 2, -2, 0],
                                                //     scale: [1, 1.1, 1]
                                                // }}
                                                transition={{ 
                                                    duration: 4,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <MapPin className="w-5 h-5" />
                                            </motion.div>
                                            Stock by Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="space-y-4"
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            {stockSummary.locations.map((location, index) => (
                                                <motion.div 
                                                    key={location.warehouse_id} 
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                    // variants={itemVariants}
                                                    whileHover={{ 
                                                        scale: 1.02,
                                                        backgroundColor: "rgba(59, 130, 246, 0.05)"
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div>
                                                        <h4 className="font-medium">{location.warehouse_name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {location.quantity_available} available • {location.quantity_reserved} reserved
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <motion.p 
                                                            className="text-lg font-semibold"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: index * 0.1, type: "spring" }}
                                                        >
                                                            {location.quantity_on_hand}
                                                        </motion.p>
                                                        {location.is_low_stock && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                                                            >
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Low Stock
                                                                </Badge>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div 
                            className="space-y-6"
                            // variants={itemVariants}
                        >
                            {/* Stock Settings */}
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ 
                                                    // rotate: [0, 360],
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{ 
                                                    duration: 5,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                            >
                                                <BarChart3 className="w-5 h-5" />
                                            </motion.div>
                                            Stock Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700">Minimum Stock Level</label>
                                            <motion.p 
                                                className="text-lg font-semibold text-gray-900 mt-1"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.3, type: "spring" }}
                                            >
                                                {stockSummary.min_stock_level}
                                            </motion.p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700">Maximum Stock Level</label>
                                            <motion.p 
                                                className="text-lg font-semibold text-gray-900 mt-1"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.4, type: "spring" }}
                                            >
                                                {stockSummary.max_stock_level || 'Not set'}
                                            </motion.p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700">Track Quantity</label>
                                            <div className="mt-1">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Badge variant={product.track_quantity ? "default" : "secondary"}>
                                                        {product.track_quantity ? 'Yes' : 'No'}
                                                    </Badge>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Recent Activity */}
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <motion.div
                                                // animate={{ 
                                                //     rotate: [0, 360]
                                                // }}
                                                transition={{ 
                                                    duration: 8,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                            >
                                                <Clock className="w-5 h-5" />
                                            </motion.div>
                                            Recent Activity (30 Days)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <motion.div 
                                            className="flex items-center justify-between"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <span className="text-sm text-gray-600">Stock In</span>
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ 
                                                        y: [0, -3, 0],
                                                        scale: [1, 1.2, 1]
                                                    }}
                                                    transition={{ 
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                </motion.div>
                                                <motion.span 
                                                    className="font-semibold text-green-600"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.3, type: "spring" }}
                                                >
                                                    +{analytics.recent_activity.stock_in}
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                        <motion.div 
                                            className="flex items-center justify-between"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <span className="text-sm text-gray-600">Stock Out</span>
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ 
                                                        y: [0, 3, 0],
                                                        scale: [1, 1.2, 1]
                                                    }}
                                                    transition={{ 
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                                </motion.div>
                                                <motion.span 
                                                    className="font-semibold text-red-600"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.4, type: "spring" }}
                                                >
                                                    -{analytics.recent_activity.stock_out}
                                                </motion.span>
                                            </div>
                                        </motion.div>
                                        <motion.div 
                                            className="flex items-center justify-between"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <span className="text-sm text-gray-600">Adjustments</span>
                                            <motion.span 
                                                className="font-semibold"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5, type: "spring" }}
                                            >
                                                {analytics.recent_activity.adjustments > 0 ? '+' : ''}
                                                {analytics.recent_activity.adjustments}
                                            </motion.span>
                                        </motion.div>
                                        <Separator />
                                        <motion.div 
                                            className="flex items-center justify-between"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <span className="text-sm font-medium">Net Movement</span>
                                            <motion.span 
                                                className={`font-bold ${
                                                    analytics.recent_activity.net_movement > 0 
                                                        ? 'text-green-600' 
                                                        : analytics.recent_activity.net_movement < 0 
                                                            ? 'text-red-600' 
                                                            : 'text-gray-600'
                                                }`}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                            >
                                                {analytics.recent_activity.net_movement > 0 ? '+' : ''}
                                                {analytics.recent_activity.net_movement}
                                            </motion.span>
                                        </motion.div>
                                        <motion.div 
                                            className="pt-2"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <p className="text-xs text-gray-500">
                                                {analytics.recent_activity.movement_count} movements total
                                            </p>
                                            {analytics.last_movement && (
                                                <p className="text-xs text-gray-500">
                                                    Last movement: {formatDate(analytics.last_movement)}
                                                </p>
                                            )}
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Product Metadata */}
                            <motion.div
                                // variants={cardVariants}
                                whileHover="hover"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700">Created</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {formatDate(product.created_at)}
                                            </p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {formatDate(product.updated_at)}
                                            </p>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <label className="text-sm font-medium text-gray-700">Slug</label>
                                            <p className="text-sm text-gray-900 font-mono mt-1">
                                                {product.slug}
                                            </p>
                                        </motion.div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default ProductDetailsView;