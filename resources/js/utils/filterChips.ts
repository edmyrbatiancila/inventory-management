import { Brand, Category } from "@/types";
import { ProductAdvancedFilters } from "@/types/Product/IProductAdvancedFilters";

export const getProductFilterChips = (filters: ProductAdvancedFilters, categories: Category[], brands: Brand[]) => {
    const chips: Array<{ key: string; label: string; value?: any }> = [];

    // Text filters
    if (filters.globalSearch) {
        chips.push({ key: 'globalSearch', label: `Search: "${filters.globalSearch}"` });
    }

    if (filters.name) {
        chips.push({ key: 'name', label: `Name: "${filters.name}"` });
    }

    if (filters.sku) {
        chips.push({ key: 'sku', label: `SKU: "${filters.sku}"` });
    }

    if (filters.description) {
        chips.push({ key: 'description', label: `Description: "${filters.description}"` });
    }

    if (filters.barcode) {
        chips.push({ key: 'barcode', label: `Barcode: "${filters.barcode}"` });
    }

    // Category filters
    if (filters.categoryIds && filters.categoryIds.length > 0) {
        filters.categoryIds.forEach(id => {
            const category = categories.find(c => c.id === id);
            if (category) {
                chips.push({
                    key: 'categoryIds',
                    label: `📂 ${category.name}`,
                    value: id
                });
            }
        });
    }

    // Brand filters
    if (filters.brandIds && filters.brandIds.length > 0) {
        filters.brandIds.forEach(id => {
            const brand = brands.find(b => b.id === id);
            if (brand) {
                chips.push({
                    key: 'brandIds',
                    label: `🏷️ ${brand.name}`,
                    value: id
                });
            }
        });
    }

    // Price range filters
    if (filters.priceMin !== undefined) {
        chips.push({ key: 'priceMin', label: `Min Price: $${filters.priceMin}` });
    }

    if (filters.priceMax !== undefined) {
        chips.push({ key: 'priceMax', label: `Max Price: $${filters.priceMax}` });
    }

    if (filters.costPriceMin !== undefined) {
        chips.push({ key: 'costPriceMin', label: `Min Cost: $${filters.costPriceMin}` });
    }

    if (filters.costPriceMax !== undefined) {
        chips.push({ key: 'costPriceMax', label: `Max Cost: $${filters.costPriceMax}` });
    }

    // Stock level filters
        if (filters.minStockMin !== undefined) {
            chips.push({ key: 'minStockMin', label: `Min Stock Level: ${filters.minStockMin}` });
        }
        if (filters.minStockMax !== undefined) {
            chips.push({ key: 'minStockMax', label: `Max Min Stock: ${filters.minStockMax}` });
        }
        if (filters.maxStockMin !== undefined) {
            chips.push({ key: 'maxStockMin', label: `Min Max Stock: ${filters.maxStockMin}` });
        }
        if (filters.maxStockMax !== undefined) {
            chips.push({ key: 'maxStockMax', label: `Max Max Stock: ${filters.maxStockMax}` });
        }

    // Status filters
    if (filters.isActive !== undefined) {
        chips.push({ 
            key: 'isActive', 
            label: filters.isActive ? '✅ Active Products' : '❌ Inactive Products' 
        });
    }

    if (filters.trackQuantity !== undefined) {
        chips.push({ 
            key: 'trackQuantity', 
            label: filters.trackQuantity ? '📊 Track Quantity' : '🚫 No Quantity Tracking' 
        });
    }

    // Date filters
    if (filters.createdAfter) {
        chips.push({ key: 'createdAfter', label: `Created after: ${filters.createdAfter}` });
    }

    if (filters.createdBefore) {
        chips.push({ key: 'createdBefore', label: `Created before: ${filters.createdBefore}` });
    }

    if (filters.updatedAfter) {
        chips.push({ key: 'updatedAfter', label: `Updated after: ${filters.updatedAfter}` });
    }

    if (filters.updatedBefore) {
        chips.push({ key: 'updatedBefore', label: `Updated before: ${filters.updatedBefore}` });
    }

    // Stock status filters
    if (filters.hasInventory !== undefined) {
        chips.push({ 
            key: 'hasInventory', 
            label: filters.hasInventory ? '📦 Has Inventory' : '📭 No Inventory' 
        });
    }

    if (filters.isLowStock) {
        chips.push({ key: 'isLowStock', label: '⚠️ Low Stock' });
    }

    if (filters.isOutOfStock) {
        chips.push({ key: 'isOutOfStock', label: '🔴 Out of Stock' });
    }

    if (filters.isOverstock) {
        chips.push({ key: 'isOverstock', label: '📈 Overstock' });
    }

    // Quick filters
    if (filters.myProducts) {
            chips.push({ key: 'myProducts', label: '👤 My Products' });
    }

    if (filters.recentlyUpdated) {
        chips.push({ key: 'recentlyUpdated', label: '🕒 Recently Updated' });
    }

    if (filters.newProducts) {
        chips.push({ key: 'newProducts', label: '✨ New Products' });
    }

    if (filters.expensiveProducts) {
        chips.push({ key: 'expensiveProducts', label: '💎 Expensive Products' });
    }

    return chips;
};