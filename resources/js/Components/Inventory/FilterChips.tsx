import { AnimatePresence, motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { AdvancedFilters } from "@/types";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Product } from "@/types/Product/IProduct";

interface IFilterChipsProps {
    filters: AdvancedFilters;
    onRemoveFilter: (key: keyof AdvancedFilters, value?: any) => void;
    onClearAll: () => void;
    warehouses: Warehouse[];
    products: Product[];
}

const FilterChips = ({
    filters,
    onRemoveFilter,
    onClearAll,
    warehouses,
    products
}: IFilterChipsProps) => {
    const getFilterChips = () => {
        const chips: Array<{ key: string; label: string; value?: any }> = [];

        // Text filters
        if (filters.globalSearch) {
            chips.push({ key: 'globalSearch', label: `Search: "${filters.globalSearch}"` });
        }
        if (filters.referenceNumber) {
            chips.push({ key: 'referenceNumber', label: `Ref: "${filters.referenceNumber}"` });
        }
        if (filters.notes) {
            chips.push({ key: 'notes', label: `Notes: "${filters.notes}"` });
        }

        // Status filters
        if (filters.statuses && filters.statuses.length > 0) {
            filters.statuses.forEach(status => {
                chips.push({ 
                    key: 'statuses', 
                    label: `Status: ${status.replace('_', ' ').toUpperCase()}`,
                    value: status 
                });
            });
        }

        // Warehouse filters
        if (filters.fromWarehouseIds && filters.fromWarehouseIds.length > 0) {
            filters.fromWarehouseIds.forEach(id => {
                const warehouse = warehouses.find(w => w.id === id);
                if (warehouse) {
                    chips.push({ 
                        key: 'fromWarehouseIds', 
                        label: `From: ${warehouse.code}`,
                        value: id 
                    });
                }
            });
        }

        if (filters.toWarehouseIds && filters.toWarehouseIds.length > 0) {
            filters.toWarehouseIds.forEach(id => {
                const warehouse = warehouses.find(w => w.id === id);
                if (warehouse) {
                    chips.push({ 
                        key: 'toWarehouseIds', 
                        label: `To: ${warehouse.code}`,
                        value: id 
                    });
                }
            });
        }

        // Quantity filters
        if (filters.quantityMin !== undefined) {
            chips.push({ key: 'quantityMin', label: `Min Qty: ${filters.quantityMin}` });
        }
        if (filters.quantityMax !== undefined) {
            chips.push({ key: 'quantityMax', label: `Max Qty: ${filters.quantityMax}` });
        }

        // Date filters
        if (filters.createdAfter) {
            chips.push({ key: 'createdAfter', label: `Created after: ${filters.createdAfter}` });
        }
        if (filters.createdBefore) {
            chips.push({ key: 'createdBefore', label: `Created before: ${filters.createdBefore}` });
        }

        // Quick filters
        if (filters.isUrgent) {
            chips.push({ key: 'isUrgent', label: '🔥 Urgent' });
        }
        if (filters.isOverdue) {
            chips.push({ key: 'isOverdue', label: '⏰ Overdue' });
        }
        if (filters.hasNotes) {
            chips.push({ key: 'hasNotes', label: '📝 Has Notes' });
        }
        if (filters.myTransfers) {
            chips.push({ key: 'myTransfers', label: '👤 My Transfers' });
        }

        return chips;
    };

    const handleRemoveFilter = (key: string, value?: any) => {
        if (key === 'statuses' && value) {
            // Remove specific status
            const newStatuses = filters.statuses?.filter(s => s !== value);
            onRemoveFilter('statuses', newStatuses?.length ? newStatuses : undefined);
        } else if (key === 'fromWarehouseIds' && value) {
            // Remove specific warehouse
            const newIds = filters.fromWarehouseIds?.filter(id => id !== value);
            onRemoveFilter('fromWarehouseIds', newIds?.length ? newIds : undefined);
        } else if (key === 'toWarehouseIds' && value) {
            // Remove specific warehouse
            const newIds = filters.toWarehouseIds?.filter(id => id !== value);
            onRemoveFilter('toWarehouseIds', newIds?.length ? newIds : undefined);
        } else {
            // Remove entire filter
            onRemoveFilter(key as keyof AdvancedFilters);
        }
    };

    const chips = getFilterChips();

    if (chips.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg border"
        >
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Active Filters:</span>
            </div>

            <AnimatePresence>
                {chips.map((chip, index) => (
                    <motion.div
                        key={`${chip.key}-${chip.value || 'single'}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Badge 
                            variant="secondary" 
                            className="flex items-center gap-1 pr-1 text-xs"
                        >
                            {chip.label}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-gray-200"
                                onClick={() => handleRemoveFilter(chip.key, chip.value)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    </motion.div>
                ))}
            </AnimatePresence>

            {chips.length > 1 && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs"
                >
                    Clear All
                </Button>
            )}
        </motion.div>
    );
}

export default FilterChips;