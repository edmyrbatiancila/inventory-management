import { WarehouseAdvancedFilters } from "@/types/Warehouse/IWarehouseAdvancedFilters";

export const getWarehouseFilterChips = (filters: WarehouseAdvancedFilters) => {
    const chips: Array<{ key: string; label: string; value?: any }> = [];

    // Text filters
    if (filters.globalSearch) {
        chips.push({ key: 'globalSearch', label: `🔍 Search: "${filters.globalSearch}"` });
    }

    if (filters.name) {
        chips.push({ key: 'name', label: `📛 Name: "${filters.name}"` });
    }

    if (filters.code) {
        chips.push({ key: 'code', label: `🏷️ Code: "${filters.code}"` });
    }

    if (filters.city) {
        chips.push({ key: 'city', label: `🏙️ City: "${filters.city}"` });
    }

    if (filters.state) {
        chips.push({ key: 'state', label: `📍 State: "${filters.state}"` });
    }

    if (filters.country) {
        chips.push({ key: 'country', label: `🌍 Country: "${filters.country}"` });
    }

    // Capacity filters
    if (filters.capacityMin !== undefined) {
        chips.push({ key: 'capacityMin', label: `📦 Min Capacity: ${filters.capacityMin}` });
    }

    if (filters.capacityMax !== undefined) {
        chips.push({ key: 'capacityMax', label: `📦 Max Capacity: ${filters.capacityMax}` });
    }

    // Status filters
    if (filters.isActive !== undefined) {
        chips.push({ 
            key: 'isActive', 
            label: filters.isActive ? '✅ Active Only' : '❌ Inactive Only' 
        });
    }

    if (filters.isMain !== undefined) {
        chips.push({ 
            key: 'isMain', 
            label: filters.isMain ? '🏢 Main Warehouses' : '🏪 Branch Warehouses' 
        });
    }

    // Date filters
    if (filters.createdAfter) {
        chips.push({ key: 'createdAfter', label: `📅 Created After: ${filters.createdAfter}` });
    }

    if (filters.createdBefore) {
        chips.push({ key: 'createdBefore', label: `📅 Created Before: ${filters.createdBefore}` });
    }

    // Zone filters
    if (filters.hasZones !== undefined) {
        chips.push({ 
            key: 'hasZones', 
            label: filters.hasZones ? '🗂️ With Zones' : '📦 No Zones' 
        });
    }

    // Quick filters
    if (filters.myWarehouses) {
        chips.push({ key: 'myWarehouses', label: '👤 My Warehouses' });
    }

    if (filters.recentlyUpdated) {
        chips.push({ key: 'recentlyUpdated', label: '🕒 Recently Updated' });
    }

    if (filters.newWarehouses) {
        chips.push({ key: 'newWarehouses', label: '✨ New Warehouses' });
    }

    if (filters.largeWarehouses) {
        chips.push({ key: 'largeWarehouses', label: '🏭 Large Warehouses' });
    }

    return chips;
};