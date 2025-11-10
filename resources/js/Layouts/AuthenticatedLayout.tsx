import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/Components/ui/navigation-menu';
import { 
    Settings, 
    Package, 
    Warehouse, 
    ShoppingCart, 
    Tags, 
    BarChart3,
    TrendingUp,
    Home
} from 'lucide-react';
import { adminMenuItems } from '@/utils/adminNavMenuItem';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Check if any admin route is currently active
    const isAdminRouteActive = () => {
        return route().current('admin.category.*') ||
            route().current('admin.brand.*') ||
            route().current('admin.products.*') ||
            route().current('admin.warehouses.*') ||
            route().current('admin.inventories.*') ||
            route().current('admin.stock-adjustments.*') ||
            route().current('admin.stock-transfers.*') ||
            route().current('admin.stock-movements.*');
    };

    // Helper function to check if a specific admin route is active
    const isSpecificAdminRouteActive = (routePattern: string) => {
        return route().current(routePattern);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex sm:items-center">
                                <NavigationMenu>
                                    <NavigationMenuList>
                                        {/* Dashboard Link */}
                                        <NavigationMenuItem>
                                            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                                <Link 
                                                    href={route('dashboard')}
                                                    className={`flex items-center gap-2 ${route().current('dashboard') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                                                >
                                                    <Home className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>

                                        {/* Admin Setup Menu - Only show for admin users */}
                                        {user.type === 'admin' && (
                                            <NavigationMenuItem>
                                                <NavigationMenuTrigger 
                                                    className={`flex items-center gap-2 ${isAdminRouteActive() ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700 hover:text-blue-600'}`}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Admin Setup
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent>
                                                    <div className="grid gap-3 p-6 md:w-[400px] lg:w-[900px] lg:grid-cols-2">
                                                        <div className="row-span-3">
                                                            <NavigationMenuLink asChild>
                                                                <div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50 to-blue-100 p-6 no-underline outline-none focus:shadow-md">
                                                                    <Settings className="h-8 w-8 text-blue-600 mb-2" />
                                                                    <div className="mb-2 text-lg font-medium text-blue-900">
                                                                        InvenTrack Admin
                                                                    </div>
                                                                    <p className="text-sm leading-tight text-blue-700">
                                                                        Complete inventory management system configuration and data management.
                                                                    </p>
                                                                </div>
                                                            </NavigationMenuLink>
                                                        </div>
                                                        {adminMenuItems.map((item) => (
                                                            <ListItem
                                                                key={item.title}
                                                                title={item.title}
                                                                href={item.href}
                                                                icon={item.icon}
                                                                routePattern={item.routePattern}
                                                            >
                                                                {item.description}
                                                            </ListItem>
                                                        ))}
                                                    </div>
                                                </NavigationMenuContent>
                                            </NavigationMenuItem>
                                        )}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile size navigation */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className="flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </ResponsiveNavLink>
                        
                        {/* Admin Setup - Mobile */}
                        {user.type === 'admin' && (
                            <>
                                <div className="px-4 py-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <Settings className="w-3 h-3" />
                                        Admin Setup
                                    </div>
                                </div>
                                {adminMenuItems.map((item) => (
                                    <ResponsiveNavLink
                                        key={item.title}
                                        href={item.href}
                                        active={route().current(item.routePattern)}
                                        className="flex items-center gap-3 ml-4"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-xs text-gray-500">{item.description}</div>
                                        </div>
                                    </ResponsiveNavLink>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}

// ListItem component for the navigation menu
function ListItem({
    title,
    children,
    href,
    icon: Icon,
    routePattern,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { 
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    routePattern: string;
}) {
    // Use the provided route pattern for active detection
    const isActive = route().current(routePattern);

    return (
        <li {...props} className='list-none'>
            <NavigationMenuLink asChild>
                <Link 
                    href={href}
                    className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors ${
                        isActive 
                            ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600' 
                            : 'hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900'
                    }`}
                >
                    <div className={`flex items-center gap-2 text-sm leading-none ${
                        isActive ? 'font-semibold' : 'font-medium'
                    }`}>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700' : ''}`} />
                        {title}
                    </div>
                    <p className={`line-clamp-2 text-sm leading-snug ${
                        isActive ? 'text-blue-700' : 'text-muted-foreground'
                    }`}>
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
}
