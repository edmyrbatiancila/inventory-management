import { Package, Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface IEmptyStateProps {
    currentFilters: { [key: string]: any };
    onHandleClearFilters?: () => void;
    onHandleCreate: () => void;
}

const EmptyState = ({
    currentFilters,
    onHandleClearFilters,
    onHandleCreate
}: IEmptyStateProps) => {

    const hasFilters = Object.values(currentFilters || {}).some(value => value !== undefined && value !== '');

    return (
        <Card>
            <CardContent className="py-16">
                <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        {hasFilters ? 'No products found' : 'No products yet'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {hasFilters 
                            ? 'Try adjusting your search or filter criteria.' 
                            : 'Get started by creating your first product.'
                        }
                    </p>
                    <div className="mt-6">
                        {hasFilters ? (
                            <Button variant="outline" onClick={ onHandleClearFilters }>
                                Clear filters
                            </Button>
                        ) : (
                            <Button onClick={ onHandleCreate } className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Product
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default EmptyState;