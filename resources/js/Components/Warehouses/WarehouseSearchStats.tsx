import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Building, CheckCircle, MapPin, Package } from "lucide-react";

interface IWarehouseSearchStatsProps {
    totalResults: number;
    statusCounts?: Record<string, number>;
    capacityRanges?: Record<string, number>;
    isFiltered: boolean;
    searchTime?: number;
}

const WarehouseSearchStats = ({
    totalResults,
    statusCounts = {},
    capacityRanges = {},
    isFiltered,
    searchTime
}: IWarehouseSearchStatsProps) => {
    // Provide default values to prevent undefined errors
    const safeStatusCounts = {
        active: 0,
        inactive: 0,
        main: 0,
        branch: 0,
        withPhone: 0,
        withEmail: 0,
        withZones: 0,
        ...statusCounts
    };

    const safeCapacityRanges = {
        small: 0,
        medium: 0,
        large: 0,
        ...capacityRanges
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
                            <p className="text-sm text-gray-600">
                                {isFiltered ? 'Filtered Results' : 'Total Warehouses'}
                            </p>
                            <p className="text-2xl font-bold">{totalResults}</p>
                            {searchTime && (
                                <p className="text-xs text-gray-500">
                                    {searchTime}ms
                                </p>
                            )}
                        </div>
                        <Building className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Active/Inactive Status */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Status</p>
                            <p className="text-2xl font-bold">
                                {safeStatusCounts.active}
                            </p>
                            <p className="text-xs text-gray-500">
                                {safeStatusCounts.inactive} inactive
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-green-500 text-white">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main vs Branch */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Main Warehouses</p>
                            <p className="text-2xl font-bold">
                                {safeStatusCounts.main}
                            </p>
                            <p className="text-xs text-gray-500">
                                {safeStatusCounts.branch} branches
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-purple-500 text-white">
                            <MapPin className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Large Warehouses */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Large Warehouses</p>
                            <p className="text-2xl font-bold">
                                {safeCapacityRanges.large}
                            </p>
                            <p className="text-xs text-gray-500">
                                {safeCapacityRanges.medium} medium, {safeCapacityRanges.small} small
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-orange-500 text-white">
                            <Package className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default WarehouseSearchStats;