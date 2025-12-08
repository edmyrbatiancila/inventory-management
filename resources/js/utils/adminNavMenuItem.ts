import { BarChart3, Building2, Package, PackageOpen, PackagePlus, ShoppingBasket, ShoppingCart, Split, Tags, TrendingUpDown, WarehouseIcon, LineChart, Activity, Brain, Target } from "lucide-react";

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
            icon: TrendingUpDown,
            description: "Review and manage stock adjustments history"
        },
        {
            title: "Stock Transfers",
            href: route('admin.stock-transfers.index'),
            routePattern: 'admin.stock-transfers.*',
            icon: Split,
            description: "Review and manage stock transfers history"
        },
        {
            title: "Stock Movements",
            href: route('admin.stock-movements.index'),
            routePattern: 'admin.stock-movements.*',
            icon: PackageOpen,
            description: "Review and manage stock movements history"
        },
        {
            title: "Purchase Orders",
            href: route('admin.purchase-orders.index'),
            routePattern: 'admin.purchase-orders.*',
            icon: PackagePlus,
            description: "Review and manage purchase orders history"
        },
        {
            title: "Sales Orders",
            href: route('admin.sales-orders.index'),
            routePattern: 'admin.sales-orders.*',
            icon: ShoppingBasket,
            description: "Review and manage sales orders history"
        },
        {
            title: "Analytics Reports",
            href: route('admin.analytics.index'),
            routePattern: 'admin.analytics.*',
            icon: LineChart,
            description: "Generate and view analytics reports"
        },
        {
            title: "Dashboard Widgets",
            href: route('admin.dashboard.index'),
            routePattern: 'admin.dashboard.*',
            icon: Activity,
            description: "Manage dashboard widgets and layouts"
        },
        {
            title: "Business Insights",
            href: route('admin.insights.index'),
            routePattern: 'admin.insights.*',
            icon: Brain,
            description: "View AI-powered business insights and recommendations"
        },
        // {
        //     title: "Suppliers",
        //     href: route('admin.suppliers.index'),
        //     routePattern: 'admin.suppliers.*',
        //     icon: Building2,
        //     description: "Review and manage suppliers history"
        // }
    ];