import { Brand, Category } from "@/types";
import { InventoryAdvancedFilters } from "@/types/Inventory/IInventoryAdvancedFilters";
import { Product } from "@/types/Product/IProduct";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { getInventoryFilterChips } from "@/utils/inventory/inventoryFilterChips";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface IInventoryFilterChipsProps {
    filters: InventoryAdvancedFilters;
    onRemoveFilter: (key: keyof InventoryAdvancedFilters, value?: any) => void;
    onClearAll: () => void;
    products?: Product[];
    warehouses?: Warehouse[];
    categories?: Category[];
    brands?: Brand[];
}

const InventoryFilterChips = ({
    filters,
    onRemoveFilter,
    onClearAll,
    products = [],
    warehouses = [],
    categories = [],
    brands = []
}: IInventoryFilterChipsProps) => {

    const chips = getInventoryFilterChips(filters, products, warehouses, categories, brands);

    const handleRemoveFilter = (key: string, value?: any) => {
        if ((key === 'productIds' || key === 'categoryIds' || key === 'brandIds' || key === 'warehouseIds' || key === 'stockStatus') && value) {
            const currentArray = filters[key as keyof InventoryAdvancedFilters] as any[];
            const newArray = currentArray?.filter(id => id !== value);
            onRemoveFilter(key as keyof InventoryAdvancedFilters, newArray && newArray.length > 0 ? newArray : undefined);
        } else {
            onRemoveFilter(key as keyof InventoryAdvancedFilters);
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
                        className="pr-1 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                        <span className="mr-1">{chip.label}</span>
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
                        className="h-7 text-xs"
                    >
                        Clear All
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}

export default InventoryFilterChips;