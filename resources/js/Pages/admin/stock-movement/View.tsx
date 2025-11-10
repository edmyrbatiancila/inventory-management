import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { headerVariants } from "@/utils/animationVarians";
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { 
    ArrowLeft, 
    PackageOpen, 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    User, 
    MapPin, 
    Hash, 
    Package,
    Warehouse,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    Copy,
    ExternalLink,
    Eye,
    RefreshCw,
    Info,
    Check,
    History,
    Building,
    Phone,
    Mail,
    PhilippinePeso
} from "lucide-react";
import { StockMovement } from "@/types/StockMovement/IStockMovement";
import { MovementTypeLabels, MovementTypeColors, StatusLabels } from "@/types/StockMovement/IStockMovement";
import { format } from "date-fns";
import { useState } from "react";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
    }
};

interface IStockMovementViewProps {
    movement: StockMovement;
}

const StockMovementView = ({ movement }: IStockMovementViewProps) => {
    const [copySuccess, setCopySuccess] = useState<string>('');
    
    // Helper functions
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'applied':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'approved':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMovementIcon = () => {
        const isIncrease = movement.quantity_moved > 0;
        return isIncrease ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
        ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <ArrowDownLeft className="w-5 h-5 text-red-600" />
            </div>
        );
    };

    const getValueDisplay = () => {
        if (movement.total_value !== null && movement.total_value !== undefined) {
            const value = typeof movement.total_value === 'string' 
                ? parseFloat(movement.total_value) 
                : movement.total_value;
            return isNaN(value) || value === 0 ? '-' : `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return '-';
    };

    const getUnitCostDisplay = () => {
        if (movement.unit_cost !== null && movement.unit_cost !== undefined) {
            const cost = typeof movement.unit_cost === 'string' 
                ? parseFloat(movement.unit_cost) 
                : movement.unit_cost;
            return isNaN(cost) || cost === 0 ? '-' : `₱${cost.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
        }
        return '-';
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(label);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const refreshPage = () => {
        router.reload();
    };

    const getMovementTypeDescription = (type: string) => {
        const descriptions = {
            'adjustment_increase': 'Inventory was increased through a stock adjustment',
            'adjustment_decrease': 'Inventory was decreased through a stock adjustment',
            'transfer_in': 'Stock transferred into this warehouse from another location',
            'transfer_out': 'Stock transferred out of this warehouse to another location',
            'purchase_receive': 'New stock received from a purchase order',
            'sale_fulfill': 'Stock sold and removed from inventory',
            'return_customer': 'Stock returned by a customer and added back to inventory',
            'return_supplier': 'Stock returned to supplier and removed from inventory',
            'damage_write_off': 'Damaged stock written off and removed from inventory',
            'expiry_write_off': 'Expired stock written off and removed from inventory',
        };
        return descriptions[type as keyof typeof descriptions] || 'Stock movement transaction';
    };

    return (
        <Authenticated
            header={
                <motion.div
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
                            <PackageOpen className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="flex flex-col justify-center">
                            <motion.h2
                                className="text-2xl font-bold leading-tight text-gray-800"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                Stock Movement Details
                            </motion.h2>
                            <motion.p
                                className="text-sm text-gray-600 mt-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                Reference: {movement.reference_number}
                            </motion.p>
                        </div>
                    </div>
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshPage}
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </motion.div>

                        {movement.product && (
                            <Link href={route('admin.products.show', movement.product.id)}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }} 
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="outline" 
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Product
                                    </Button>
                                </motion.div>
                            </Link>
                        )}

                        <Link href={route('admin.stock-movements.index')}>
                            <motion.div
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="outline" 
                                    size="sm"
                                    className="gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Stock Movements
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.div>
            }
        >
            <Head title={`Stock Movement - ${movement.reference_number}`} />

            <motion.div
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Quick Actions Alert for Pending Movements */}
                    {movement.status === 'pending' && (
                        <motion.div variants={cardVariants}>
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    This movement is pending approval and has not yet been applied to inventory levels.
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {/* Movement Overview Card */}
                    <motion.div variants={cardVariants}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {getMovementIcon()}
                                        Movement Overview
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(movement.status)}
                                        <Badge className={getStatusColor(movement.status)}>
                                            {StatusLabels[movement.status]}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {getMovementTypeDescription(movement.movement_type)}
                                </p>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Movement Type */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Activity className="w-4 h-4" />
                                        Movement Type
                                    </div>
                                    <Badge className={MovementTypeColors[movement.movement_type]}>
                                        {MovementTypeLabels[movement.movement_type]}
                                    </Badge>
                                </div>

                                {/* Reference Number */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Hash className="w-4 h-4" />
                                        Reference
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded flex-1">
                                            {movement.reference_number}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(movement.reference_number, 'Reference')}
                                            className="h-6 w-6 p-0"
                                            title={copySuccess === 'Reference' ? 'Copied!' : 'Copy reference number'}
                                        >
                                            {copySuccess === 'Reference' ? 
                                                <Check className="w-3 h-3 text-green-600" /> : 
                                                <Copy className="w-3 h-3" />
                                            }
                                        </Button>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        Created Date
                                    </div>
                                    <p className="text-sm">
                                        {format(new Date(movement.created_at), 'PPp')}
                                    </p>
                                </div>

                                {/* User */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                        <User className="w-4 h-4" />
                                        Performed By
                                    </div>
                                    <p className="text-sm">
                                        {movement.user.name}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Product & Location Information */}
                        <motion.div variants={cardVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        Product & Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Product Information */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">Product Details</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <h5 className="font-medium">{movement.product.name}</h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>SKU: {movement.product.sku}</div>
                                                <div>Price: ${movement.product.price}</div>
                                            </div>
                                            {movement.product.description && (
                                                <p className="text-sm text-gray-600">{movement.product.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Warehouse Information */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                            <Warehouse className="w-4 h-4" />
                                            Warehouse
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-medium">{movement.warehouse.name}</h5>
                                                <Badge variant="outline">{movement.warehouse.code || 'N/A'}</Badge>
                                            </div>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {movement.warehouse.full_address}
                                                </div>
                                                {movement.warehouse.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4" />
                                                        {movement.warehouse.phone}
                                                    </div>
                                                )}
                                                {movement.warehouse.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        {movement.warehouse.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Quantity & Financial Information */}
                        <motion.div variants={cardVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PhilippinePeso className="w-5 h-5 text-green-600" />
                                        Quantity & Financial Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Quantity Changes */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Quantity Changes</h4>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {movement.quantity_before}
                                                </div>
                                                <div className="text-xs text-blue-600 font-medium">Before</div>
                                            </div>
                                            
                                            <div className={`p-3 rounded-lg ${movement.quantity_moved > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                                <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                                                    movement.quantity_moved > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {movement.quantity_moved > 0 ? '+' : ''}
                                                    {movement.quantity_moved}
                                                    {movement.quantity_moved > 0 ? 
                                                        <TrendingUp className="w-4 h-4" /> : 
                                                        <TrendingDown className="w-4 h-4" />
                                                    }
                                                </div>
                                                <div className={`text-xs font-medium ${
                                                    movement.quantity_moved > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    Change
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-gray-600">
                                                    {movement.quantity_after}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">After</div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Financial Information */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-gray-900">Financial Details</h4>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600">Unit Cost</div>
                                                <div className="text-lg font-semibold">{getUnitCostDisplay()}</div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600">Total Value</div>
                                                <div className="text-lg font-semibold text-green-600">{getValueDisplay()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Movement Context & Additional Details */}
                    <motion.div variants={cardVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    Additional Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Reason & Notes */}
                                    <div className="space-y-4">
                                        {movement.reason && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-900">Reason</h4>
                                                <p className="text-sm bg-gray-50 p-3 rounded-lg">{movement.reason}</p>
                                            </div>
                                        )}
                                        
                                        {movement.notes && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-900">Notes</h4>
                                                <p className="text-sm bg-gray-50 p-3 rounded-lg">{movement.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status & Approval Information */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">Status Information</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Current Status:</span>
                                                    <Badge className={getStatusColor(movement.status)}>
                                                        {StatusLabels[movement.status]}
                                                    </Badge>
                                                </div>
                                                
                                                {movement.approvedBy && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Approved By:</span>
                                                        <span className="text-sm font-medium">{movement.approvedBy.name}</span>
                                                    </div>
                                                )}
                                                
                                                {movement.approved_at && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Approved At:</span>
                                                        <span className="text-sm">{format(new Date(movement.approved_at), 'PPp')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Related Document Info */}
                                        {movement.related_document_type && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-900">Related Document</h4>
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-blue-600">Type:</span>
                                                        <span className="text-sm font-medium text-blue-800">
                                                            {movement.related_document_type}
                                                        </span>
                                                    </div>
                                                    {movement.related_document_id && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-blue-600">ID:</span>
                                                            <span className="text-sm font-mono text-blue-800">
                                                                {movement.related_document_id}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Metadata */}
                                {movement.metadata && Object.keys(movement.metadata).length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900">Metadata</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                                {JSON.stringify(movement.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Audit Trail */}
                    <motion.div variants={cardVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-600" />
                                    Audit Trail
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Creation */}
                                    <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                            <Activity className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-blue-900">Movement Created</h4>
                                                <span className="text-sm text-blue-600">
                                                    {format(new Date(movement.created_at), 'PPp')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Created by {movement.user.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Approval */}
                                    {movement.approved_at && movement.approved_by && (
                                        <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-green-900">Movement Approved</h4>
                                                    <span className="text-sm text-green-600">
                                                        {format(new Date(movement.approved_at), 'PPp')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">
                                                    Approved by {movement.approvedBy?.name || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Applied Status */}
                                    {movement.status === 'applied' && (
                                        <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-lg">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-emerald-900">Movement Applied</h4>
                                                <p className="text-sm text-emerald-700 mt-1">
                                                    Inventory levels have been updated
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejected Status */}
                                    {movement.status === 'rejected' && (
                                        <div className="flex items-start gap-4 p-3 bg-red-50 rounded-lg">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-red-900">Movement Rejected</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    This movement was rejected and no inventory changes were made
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default StockMovementView;