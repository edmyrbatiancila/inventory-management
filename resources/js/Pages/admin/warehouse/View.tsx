import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Separator } from "@/Components/ui/separator";
import { handleDeleteData } from "@/hooks/deleteFunction";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Warehouse, WarehouseAnalytics } from "@/types/Warehouse/IWarehouse";
import { cardVariants, containerVariants, headerVariants, staggerContainer } from "@/utils/animationVarians";
import { formatDate } from "@/utils/date";
import { Head, Link, router } from "@inertiajs/react";
import { easeInOut, motion, spring } from "framer-motion";
import { Activity, AlertTriangle, ArrowLeft, Building2, Calendar, CheckCircle, Edit, Mail, MapPin, Package, Phone, Trash2, Users, WarehouseIcon } from "lucide-react";

interface IWarehouseViewProps {
    warehouse: Warehouse;
    analytics: WarehouseAnalytics;
}

const WarehouseView = ({
    warehouse,
    analytics
}: IWarehouseViewProps) => {
    const handleEdit = () => {
        router.visit(route('admin.warehouses.edit', warehouse.id));
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
                            <WarehouseIcon className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                { warehouse.name }
                            </motion.h2>
                            <motion.p
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                CODE: { warehouse.code }
                            </motion.p>
                        </div>
                    </div>
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Link href={route('admin.warehouses.index')}>
                            <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Warehouses
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
                                Edit Warehouse
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
                                        <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{warehouse.name}"? 
                                            This action cannot be undone and will permanently remove this warehouse.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteData(warehouse.id, 'admin.warehouses.destroy')}
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
            <Head title={`Warehouse - ${warehouse.name}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Status Alert */}
                {!warehouse.is_active && (
                    <motion.div
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
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
                                <AlertTriangle className="w-5 h-5 text-red-600 mr-2"  />
                            </motion.div>
                            <p className="text-red-800 font-medium">
                                This warehouse is currently inactive
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
                                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
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
                                            { analytics.total_products }
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            Product types
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
                                        <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                                        <motion.div
                                            animate={{ 
                                                scale: [1, 1.2, 1],
                                                opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{ 
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: easeInOut
                                            }}
                                        >
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </CardHeader>
                                    <CardContent>
                                        <motion.div 
                                            className="text-2xl font-bold text-blue-600"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.6, type: spring, stiffness: 200 }}
                                        >
                                            {analytics.total_stock}
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
                                                y: [0, -5, 0],
                                                rotate: [0, 5, -5, 0]
                                            }}
                                            transition={{ 
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: easeInOut
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
                                            transition={{ delay: 0.7, type: spring, stiffness: 200 }}
                                        >
                                            {analytics.total_available}
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
                                                x: [0, 2, -2, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ 
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: easeInOut
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
                                            transition={{ delay: 0.8, type: spring, stiffness: 200 }}
                                        >
                                            {analytics.total_reserved}
                                        </motion.div>
                                        <p className="text-xs text-muted-foreground">
                                            On hold
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
                        {/* Warehouse Details */}
                        <motion.div
                            className="lg:col-span-2 space-y-6"
                            variants={cardVariants}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Warehouse Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Name</label>
                                            <p className="mt-1 text-sm text-gray-900">{warehouse.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Code</label>
                                            <p className="mt-1 text-sm text-gray-900 font-mono">{warehouse.code}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Status</label>
                                            <div className="mt-1">
                                                <Badge variant={warehouse.is_active ? "default" : "destructive"}>
                                                    {warehouse.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Created</label>
                                            <p className="mt-1 text-sm text-gray-900">{formatDate(warehouse.created_at)}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                                            <MapPin className="h-4 w-4" />
                                            Address
                                        </label>
                                        <div className="text-sm text-gray-900 space-y-1">
                                            <p>{warehouse.address}</p>
                                            <p>{warehouse.city}, {warehouse.state} {warehouse.postal_code}</p>
                                            <p>{warehouse.country}</p>
                                        </div>
                                    </div>

                                {(warehouse.phone || warehouse.email) && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {warehouse.phone && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Phone
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-900">{warehouse.phone}</p>
                                            </div>
                                        )}
                                        {warehouse.email && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-900">{warehouse.email}</p>
                                            </div>
                                        )}
                                        </div>
                                    </>
                                )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Warehouse Statistics */}
                        <motion.div
                            className="space-y-6"
                            variants={cardVariants}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Capacity Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Products:</span>
                                            <span className="font-medium">{analytics.total_products}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Stock:</span>
                                            <span className="font-medium text-blue-600">{analytics.total_stock}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Available:</span>
                                            <span className="font-medium text-green-600">{analytics.total_available}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Reserved:</span>
                                            <span className="font-medium text-orange-600">{analytics.total_reserved}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Utilization Rate:</span>
                                            <span className="font-medium">
                                                {analytics.utilization_rate ? analytics.utilization_rate.toFixed(1) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Quick Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <p className="font-medium">{formatDate(warehouse.updated_at)}</p>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-600">Warehouse ID:</span>
                                        <p className="font-medium font-mono">#{warehouse.id}</p>
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

export default WarehouseView;