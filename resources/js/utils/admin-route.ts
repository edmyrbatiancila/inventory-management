
// Check if any admin route is currently active
export const isAdminRouteActive = () => {
    return route().current('admin.category.*') ||
        route().current('admin.brand.*') ||
        route().current('admin.products.*') ||
        route().current('admin.warehouses.*') ||
        route().current('admin.inventories.*') ||
        route().current('admin.stock-adjustments.*') ||
        route().current('admin.stock-transfers.*') ||
        route().current('admin.stock-movements.*') ||
        route().current('admin.purchase-orders.*') ||
        route().current('admin.sales-orders.*');
};