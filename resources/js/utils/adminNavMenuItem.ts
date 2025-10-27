import { BarChart3, Package, ShoppingCart, Tags, TrendingUp, WarehouseIcon } from "lucide-react";

export const adminMenuItems = [
        {
            title: "Categories",
            href: route('admin.category.index'),
            routePattern: 'admin.category.*',
            icon: Tags,
            description: "Manage product categories and classifications"
        },
        {
            title: "Brands",
            href: route('admin.brand.index'),
            routePattern: 'admin.brand.*',
            icon: BarChart3,
            description: "Manage product brands and manufacturers"
        },
        {
            title: "Products",
            href: route('admin.products.index'),
            routePattern: 'admin.products.*',
            icon: Package,
            description: "Manage products catalog and specifications"
        },
        {
            title: "Warehouses",
            href: route('admin.warehouses.index'),
            routePattern: 'admin.warehouses.*',
            icon: WarehouseIcon,
            description: "Manage warehouse locations and facilities"
        },
        {
            title: "Inventories",
            href: route('admin.inventories.index'),
            routePattern: 'admin.inventories.*',
            icon: ShoppingCart,
            description: "Manage inventory levels and stock tracking"
        },
        {
            title: "Stock Adjustments",
            href: route('admin.stock-adjustments.index'),
            routePattern: 'admin.stock-adjustments.*',
            icon: TrendingUp,
            description: "Review and manage stock adjustments history"
        }
    ];