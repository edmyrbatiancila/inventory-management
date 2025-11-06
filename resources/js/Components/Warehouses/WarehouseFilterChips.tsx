import { WarehouseAdvancedFilters } from "@/types/Warehouse/IWarehouseAdvancedFilters";
import { getWarehouseFilterChips } from "@/utils/warehouse/warehouseFilterChips";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface IWarehouseFilterChipsProps {
    filters: WarehouseAdvancedFilters;
    onRemoveFilter: (key: keyof WarehouseAdvancedFilters, value?: any) => void;
    onClearAll: () => void;
}

const WarehouseFilterChips = ({
    filters,
    onRemoveFilter,
    onClearAll
}: IWarehouseFilterChipsProps) => {

    const chips = getWarehouseFilterChips(filters);

    const handleRemoveFilter = (key: string, value?: any) => {
        onRemoveFilter(key as keyof WarehouseAdvancedFilters);
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

export default WarehouseFilterChips;