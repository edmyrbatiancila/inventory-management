import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { AlertTriangle, CheckCircle, Crown, Package } from 'lucide-react';

interface IProductSearchStatsProps {
    totalResults?: number;
    statusCounts?: Record<string, number>;
    priceRanges?: Record<string, number>;
    isFiltered: boolean;
    searchTime?: number;
}

const ProductSearchStats = ({
    totalResults = 0,
    statusCounts = {},
    priceRanges = {},
    isFiltered,
    searchTime
}: IProductSearchStatsProps) => {
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
                                {isFiltered ? 'Filtered Products' : 'Total Products'}
                            </p>
                            <p className="text-2xl font-bold">{totalResults?.toLocaleString() || '0'}</p>
                            {searchTime && <p className="text-xs text-gray-500">Found in {searchTime}ms</p>}
                        </div>
                        <Package className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Active/Inactive Status */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Products</p>
                            <p className="text-2xl font-bold">{statusCounts?.active || 0}</p>
                            <p className="text-xs text-gray-500">
                                {totalResults > 0 ? `${Math.round(((statusCounts?.active || 0) / totalResults) * 100)}%` : '0%'}
                            </p>
                        </div>
                        <div className="p-2 rounded-full bg-green-500 text-white">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Low Stock */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold">{statusCounts?.lowStock || 0}</p>
                            <p className="text-xs text-gray-500">Need attention</p>
                        </div>
                        <div className="p-2 rounded-full bg-yellow-500 text-white">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Premium Products */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Premium Products</p>
                            <p className="text-2xl font-bold">{priceRanges?.premium || 0}</p>
                            <p className="text-xs text-gray-500">Over $200</p>
                        </div>
                        <div className="p-2 rounded-full bg-purple-500 text-white">
                            <Crown className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Low Stock */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold">{statusCounts.lowStock || 0}</p>
                            <p className="text-xs text-gray-500">Need attention</p>
                        </div>
                        <div className="p-2 rounded-full bg-yellow-500 text-white">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Premium Products */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Premium Items</p>
                            <p className="text-2xl font-bold">{priceRanges.premium || 0}</p>
                            <p className="text-xs text-gray-500">&gt; $200</p>
                        </div>
                        <div className="p-2 rounded-full bg-purple-500 text-white">
                            <Crown className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

        </motion.div>
    );
}

export default ProductSearchStats;