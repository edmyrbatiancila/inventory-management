export const getStatusColor = (status: string) => {
    switch (status) {
        case 'healthy': 
            return 'bg-green-100 text-green-800 border-green-200';
        case 'low': 
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'critical': 
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'out_of_stock': 
            return 'bg-red-100 text-red-800 border-red-200';
        default: 
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};


export const getStockLevelColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';

    return 'bg-red-500';
};