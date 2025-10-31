// resources/js/hooks/useBulkSelection.tsx

import { useState, useCallback, useMemo } from 'react';

interface UseBulkSelectionProps<T> {
    items: T[];
    getItemId: (item: T) => number;
    canSelectItem?: (item: T) => boolean;
}

export function useBulkSelection<T>({ 
    items, 
    getItemId, 
    canSelectItem = () => true 
}: UseBulkSelectionProps<T>) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const selectableItems = useMemo(
        () => items.filter(canSelectItem),
        [items, canSelectItem]
    );

    const selectableIds = useMemo(
        () => selectableItems.map(getItemId),
        [selectableItems, getItemId]
    );

    const isSelected = useCallback(
        (id: number) => selectedIds.has(id),
        [selectedIds]
    );

    const isAllSelected = useMemo(
        () => selectableIds.length > 0 && selectableIds.every(id => selectedIds.has(id)),
        [selectableIds, selectedIds]
    );

    const isIndeterminate = useMemo(
        () => selectedIds.size > 0 && !isAllSelected,
        [selectedIds.size, isAllSelected]
    );

    const toggleSelection = useCallback((id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds(prev => {
            if (isAllSelected) {
                return new Set();
            }
            return new Set(selectableIds);
        });
    }, [isAllSelected, selectableIds]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const getSelectedItems = useCallback(() => {
        return items.filter(item => selectedIds.has(getItemId(item)));
    }, [items, selectedIds, getItemId]);

    return {
        selectedIds: Array.from(selectedIds),
        selectedCount: selectedIds.size,
        isSelected,
        isAllSelected,
        isIndeterminate,
        toggleSelection,
        toggleSelectAll,
        clearSelection,
        getSelectedItems,
        selectableCount: selectableItems.length,
    };
}