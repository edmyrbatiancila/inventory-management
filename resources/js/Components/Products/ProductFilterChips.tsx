import { Brand, Category } from "@/types";
import { ProductAdvancedFilters } from "@/types/Product/IProductAdvancedFilters";
import { getProductFilterChips } from "@/utils/filterChips";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface IProductFilterChipsProps {
    filters: ProductAdvancedFilters;
    onRemoveFilter: (key: keyof ProductAdvancedFilters, value?: any) => void;
    onClearAll: () => void;
    categories: Category[]
    brands: Brand[];
}

const ProductFilterChips = ({
    filters,
    onRemoveFilter,
    onClearAll,
    categories,
    brands
}: IProductFilterChipsProps) => {

    const chips = getProductFilterChips(filters, categories, brands);

    const handleRemoveFilter = (key: string, value?: any) => {
        if (key === 'categoryIds' && value) {
            const currentCategories = filters.categoryIds || [];
            const newCategories = currentCategories.filter(id => id !== value);
            onRemoveFilter('categoryIds', newCategories.length > 0 ? newCategories : undefined);
        } else if (key === 'brandIds' && value) {
            const currentBrands = filters.brandIds || [];
            const newBrands = currentBrands.filter(id => id !== value);
            onRemoveFilter('brandIds', newBrands.length > 0 ? newBrands : undefined);
        } else {
            onRemoveFilter(key as keyof ProductAdvancedFilters);
        }
    };

    if (chips.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border"
        >
            <span className="text-sm font-medium text-gray-600 mr-2">
                Active Filters:
            </span>

            {chips.map((chip, index) => (
                <motion.div
                    key={`${chip.key}-${chip.value || index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                    >
                        <span className="text-xs">{ chip.label }</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-blue-300 rounded-full"
                            onClick={() => handleRemoveFilter(chip.key, chip.value)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                </motion.div>
            ))}

            {chips.length > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearAll}
                        className="ml-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                        Clear All
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}

export default ProductFilterChips;