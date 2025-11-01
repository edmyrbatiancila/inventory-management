import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { CheckCircle, Clock, Package, TrendingUp, XCircle } from "lucide-react";
import { getStatusSearchColor } from "@/hooks/stock-transfers/statusOptions";

interface ISearchStatsProps {
    totalResults: number;
    statusCounts: Record<string, number>;
    isFiltered: boolean;
    searchTime?: number;
}

const SearchStats = ({
    totalResults,
    statusCounts,
    isFiltered,
    searchTime
}: ISearchStatsProps) => {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
            {/* Total Results */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                {isFiltered ? 'Filtered Results' : 'Total Transfers'}
                            </p>
                            <p className="text-2xl font-bold">{totalResults.toLocaleString()}</p>
                            {searchTime && (
                                <p className="text-xs text-gray-500">
                                    Found in {searchTime}ms
                                </p>
                            )}
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                </CardContent>
            </Card>

            {/* Status Breakdown */}
            {Object.entries(statusCounts).slice(0, 3).map(([status, count]) => (
                <Card key={status}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 capitalize">
                                    {status.replace('_', ' ')}
                                </p>
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-xs text-gray-500">
                                    {totalResults > 0 ? `${Math.round((count / totalResults) * 100)}%` : '0%'}
                                </p>
                            </div>
                            <div className={`p-2 rounded-full ${getStatusSearchColor(status)} text-white`}>
                                {getStatusIcon(status)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </motion.div>
    );
}

export default SearchStats;