import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { AlertTriangle, CheckCircle, Package, PhilippinePeso } from "lucide-react";


interface IInventorySearchStatsProps {
    totalResults: number;
    stockCounts?: Record<string, number>;
    quantityRanges?: Record<string, number>;
    isFiltered: boolean;
    searchTime?: number;
}

const InventorySearchStats = ({
    totalResults,
    stockCounts = {},
    quantityRanges = {},
    isFiltered,
    searchTime
}: IInventorySearchStatsProps) => {
    // Provide default values to prevent undefined errors
    const safeStockCounts = {
        healthy: 0,
        low: 0,
        outOfStock: 0,
        withReservation: 0,
        highValue: 0,
        ...stockCounts
    };

    const safeQuantityRanges = {
        zero: 0,
        low: 0,
        medium: 0,
        high: 0,
        ...quantityRanges
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
            {/* Total Results Card */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                {isFiltered ? 'Filtered Results' : 'Total Inventory'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
                            {searchTime && (
                                <p className="text-xs text-gray-500">in {searchTime}ms</p>
                            )}
                        </div>
                        <Package className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Stock Health */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Stock Health</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-600">✓ {safeStockCounts.healthy}</span>
                                <span className="text-yellow-600">⚠ {safeStockCounts.low}</span>
                                <span className="text-red-600">✗ {safeStockCounts.outOfStock}</span>
                            </div>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Reserved Stock */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">With Reservations</p>
                            <p className="text-2xl font-bold text-gray-900">{safeStockCounts.withReservation}</p>
                            <p className="text-xs text-gray-500">items have reserved stock</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                </CardContent>
            </Card>

            {/* High Value Items */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">High Value Items</p>
                            <p className="text-2xl font-bold text-gray-900">{safeStockCounts.highValue}</p>
                            <p className="text-xs text-gray-500">worth over $1,000</p>
                        </div>
                        <PhilippinePeso className="h-8 w-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default InventorySearchStats;