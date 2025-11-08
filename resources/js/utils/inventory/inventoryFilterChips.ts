import { Brand, Category } from '@/types';
import { InventoryAdvancedFilters } from '@/types/Inventory/IInventoryAdvancedFilters';
import { Product } from '@/types/Product/IProduct';
import { Warehouse } from '@/types/Warehouse/IWarehouse';

export const getInventoryFilterChips = (
    filters: InventoryAdvancedFilters,
    products: Product[] = [],
    warehouses: Warehouse[] = [],
    categories: Category[] = [],
    brands: Brand[] = []
) => {
    const chips: Array<{ key: string; label: string; value?: any }> = [];

    // Text filters
    if (filters.globalSearch) {
        chips.push({ key: 'globalSearch', label: `🔍 Search: "${filters.globalSearch}"` });
    }

    if (filters.productName) {
        chips.push({ key: 'productName', label: `📦 Product: "${filters.productName}"` });
    }

    if (filters.productSku) {
        chips.push({ key: 'productSku', label: `🏷️ SKU: "${filters.productSku}"` });
    }

    if (filters.warehouseName) {
        chips.push({ key: 'warehouseName', label: `🏢 Warehouse: "${filters.warehouseName}"` });
    }

    if (filters.warehouseCode) {
        chips.push({ key: 'warehouseCode', label: `📍 Code: "${filters.warehouseCode}"` });
    }

    if (filters.notes) {
        chips.push({ key: 'notes', label: `📝 Notes: "${filters.notes}"` });
    }

    // Product filters
    if (filters.productIds && filters.productIds.length > 0) {
        const productNames = filters.productIds.map(id => {
            const product = products.find(p => p.id === id);
            return product ? product.name : `Product #${id}`;
        });
        productNames.forEach((name, index) => {
            chips.push({
                key: 'productIds',
                label: `📦 Product: ${name}`,
                value: filters.productIds![index]
            });
        });
    }

    // Category filters
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        const categoryNames = filters.categoryIds.map(id => {
            const category = categories.find(c => c.id === id);
            return category ? category.name : `Category #${id}`;
        });
        categoryNames.forEach((name, index) => {
            chips.push({
                key: 'categoryIds',
                label: `📂 Category: ${name}`,
                value: filters.categoryIds![index]
            });
        });
    }

    // Brand filters
    if (filters.brandIds && filters.brandIds.length > 0) {
        const brandNames = filters.brandIds.map(id => {
            const brand = brands.find(b => b.id === id);
            return brand ? brand.name : `Brand #${id}`;
        });
        brandNames.forEach((name, index) => {
            chips.push({
                key: 'brandIds',
                label: `🏭 Brand: ${name}`,
                value: filters.brandIds![index]
            });
        });
    }

    // Warehouse filters
    if (filters.warehouseIds && filters.warehouseIds.length > 0) {
        const warehouseNames = filters.warehouseIds.map(id => {
            const warehouse = warehouses.find(w => w.id === id);
            return warehouse ? warehouse.name : `Warehouse #${id}`;
        });
        warehouseNames.forEach((name, index) => {
            chips.push({
                key: 'warehouseIds',
                label: `🏢 Warehouse: ${name}`,
                value: filters.warehouseIds![index]
            });
        });
    }

    // Quantity filters
    if (filters.quantityOnHandMin !== undefined) {
        chips.push({ key: 'quantityOnHandMin', label: `📦 Min On Hand: ${filters.quantityOnHandMin}` });
    }

    if (filters.quantityOnHandMax !== undefined) {
        chips.push({ key: 'quantityOnHandMax', label: `📦 Max On Hand: ${filters.quantityOnHandMax}` });
    }

    if (filters.quantityReservedMin !== undefined) {
        chips.push({ key: 'quantityReservedMin', label: `🔒 Min Reserved: ${filters.quantityReservedMin}` });
    }

    if (filters.quantityReservedMax !== undefined) {
        chips.push({ key: 'quantityReservedMax', label: `🔒 Max Reserved: ${filters.quantityReservedMax}` });
    }

    if (filters.quantityAvailableMin !== undefined) {
        chips.push({ key: 'quantityAvailableMin', label: `✅ Min Available: ${filters.quantityAvailableMin}` });
    }

    if (filters.quantityAvailableMax !== undefined) {
        chips.push({ key: 'quantityAvailableMax', label: `✅ Max Available: ${filters.quantityAvailableMax}` });
    }

    // Stock status filters
    if (filters.stockStatus && filters.stockStatus.length > 0) {
        filters.stockStatus.forEach(status => {
            const statusLabels = {
                healthy: '💚 Healthy Stock',
                low: '🟡 Low Stock',
                critical: '🟠 Critical Stock',
                out_of_stock: '🔴 Out of Stock'
            };
            chips.push({
                key: 'stockStatus',
                label: statusLabels[status] || `📊 Status: ${status}`,
                value: status
            });
        });
    }

    // Boolean filters
    if (filters.warehouseIsActive !== undefined) {
        chips.push({ 
            key: 'warehouseIsActive', 
            label: filters.warehouseIsActive ? '✅ Active Warehouses' : '❌ Inactive Warehouses' 
        });
    }

    if (filters.isLowStock) {
        chips.push({ key: 'isLowStock', label: '🟡 Low Stock Only' });
    }

    if (filters.isOutOfStock) {
        chips.push({ key: 'isOutOfStock', label: '🔴 Out of Stock Only' });
    }

    if (filters.hasReservedStock) {
        chips.push({ key: 'hasReservedStock', label: '🔒 Has Reservations' });
    }

    // Value filters
    if (filters.stockValueMin !== undefined) {
        chips.push({ key: 'stockValueMin', label: `💰 Min Value: $${filters.stockValueMin}` });
    }

    if (filters.stockValueMax !== undefined) {
        chips.push({ key: 'stockValueMax', label: `💰 Max Value: $${filters.stockValueMax}` });
    }

    // Date filters
    if (filters.createdAfter) {
        chips.push({ key: 'createdAfter', label: `📅 Created After: ${filters.createdAfter}` });
    }

    if (filters.createdBefore) {
        chips.push({ key: 'createdBefore', label: `📅 Created Before: ${filters.createdBefore}` });
    }

    if (filters.updatedAfter) {
        chips.push({ key: 'updatedAfter', label: `📅 Updated After: ${filters.updatedAfter}` });
    }

    if (filters.updatedBefore) {
        chips.push({ key: 'updatedBefore', label: `📅 Updated Before: ${filters.updatedBefore}` });
    }

    // Quick filters
    if (filters.myInventories) {
        chips.push({ key: 'myInventories', label: '👤 My Inventories' });
    }

    if (filters.recentlyUpdated) {
        chips.push({ key: 'recentlyUpdated', label: '🕒 Recently Updated' });
    }

    if (filters.newInventories) {
        chips.push({ key: 'newInventories', label: '🆕 New Inventories' });
    }

    if (filters.highValueInventories) {
        chips.push({ key: 'highValueInventories', label: '💎 High Value Items' });
    }

    return chips;
};