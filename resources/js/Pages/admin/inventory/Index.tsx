import CustomPagination from "@/Components/CustomPagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps, PaginatedResponse } from "@/types";
import { Inventory, InventoryDeletionError } from "@/types/Inventory/IInventory";
import { Head, router, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ClipboardList, Edit2, Package, Plus, Trash2, View, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface IInventoryIndexProps {
    inventories: PaginatedResponse<Inventory>;
    sort?: string;
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
        error?: string;
        deletion_error?: InventoryDeletionError;
    };
};

const InventoryIndex = ({
    inventories,
    sort: initialSort = 'newest'
}: IInventoryIndexProps) => {
    const { props } = usePage<InertiaPageProps>();

    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState(initialSort);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setSearch(value);

        setIsSearching(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            router.get(
                route('admin.inventories.index'), 
                { search: value, sort }, 
                { preserveState: true, replace: true }
            );

            setIsSearching(false);
        }, 500);
    };

    // Clear search
    const handleClear = () => {
        setSearch('');
        setSort('newest');

        router.get(
            route('admin.inventories.index'), 
            {}, 
            { preserveState: true, replace: true }
        );
    };

    // Handle filter/sort change for shadcn UI Select
    const handleSortChange = (value: string) => {
        setSort(value);

        router.get(
            route('admin.inventories.index'), 
            { search, sort: value }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDeleteInventory = (inventoryId: number) => {
        router.delete(route('admin.inventories.destroy', inventoryId), {
            preserveScroll: true,
            onSuccess: () => {
                // Success message will be handled by the flash message
            },
            onError: () => {
                toast.error('Failed to delete inventory', {
                    description: 'The inventory could not be deleted. It may be in use.',
                    duration: 4000,
                });
            }
        });
    };

    useEffect(() => {
        if (props.flash && props.flash.success) {
            toast.success(props.flash.success, {
                duration: 4000,
                style: { fontWeight: 'bold', fontSize: '1.1rem' },
                icon: <CheckCircle2 className="text-green-600 w-6 h-6" />,
            });
        }

        if (props.flash && props.flash.error) {
            toast.error(props.flash.error, {
                description: 'Please try again or contact support if the problem persists.',
                duration: 4000,
                style: { fontWeight: 'bold', fontSize: '1.1rem' },
            });
        }
    }, [props.flash]);

    return (
        <Authenticated
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-7 h-7 text-blue-600" />
                        Inventory Management
                    </h2>
                </motion.div>
            }
        >
            <Head title="Inventories" />
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="py-12"
            >
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filter/Search UI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                    >
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <Input 
                                type="text"
                                placeholder="Search inventories..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full max-w-xs shadow-sm focus:ring-2 focus:ring-blue-200"
                                aria-label="Search inventories"
                            />
                        {search && (
                            <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={ handleClear }
                                    title="Clear Search"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}
                            <motion.div whileHover={{ scale: 1.03 }}>
                                <Select
                                    value={ sort } 
                                    onValueChange={ handleSortChange }
                                >
                                    <SelectTrigger className="w-[180px] shadow-sm focus:ring-2 focus:ring-blue-200">
                                        <SelectValue placeholder="Filter inventories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Select Filter</SelectLabel>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="oldest">Oldest First</SelectItem>
                                            <SelectItem value="az">Product Name</SelectItem>
                                            <SelectItem value="za">Warehouse Name</SelectItem>
                                            <SelectItem value="quantity_high">Highest Stock</SelectItem>
                                            <SelectItem value="quantity_low">Lowest Stock</SelectItem>
                                            <SelectItem value="low_stock">Low Stock Alert</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>
                        <motion.div whileHover={{ scale: 1.04 }}>
                            <Button
                                onClick={() => router.visit(route('admin.inventories.create'))}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-150"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Inventory
                            </Button>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <Card className="shadow-lg border border-blue-100 rounded-xl bg-white/90">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-blue-100 bg-blue-50/60 rounded-t-xl">
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    <ClipboardList className="w-6 h-6 text-blue-600" />
                                    Inventories <span className="text-blue-400 font-normal">({ inventories.total })</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence mode="wait">
                                {inventories.data.length > 0 ? (
                                    <motion.div
                                        key="table"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-16">
                                                        #
                                                    </TableHead>
                                                    <TableHead>Product Information</TableHead>
                                                    <TableHead>Warehouse</TableHead>
                                                    <TableHead className="text-center">On Hand</TableHead>
                                                    <TableHead className="text-center">Reserved</TableHead>
                                                    <TableHead className="text-center">Available</TableHead>
                                                    <TableHead className="text-center">Status</TableHead>
                                                    <TableHead className="w-32 text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {inventories.data.map((inventory, idx) => {
                                                const rowNumber = (inventories.current_page - 1) * inventories.per_page + idx + 1;
                                                const isLowStock = inventory.quantity_available <= (inventory.product?.min_stock_level || 0);
                                                const isOutOfStock = inventory.quantity_on_hand <= 0;

                                                return (
                                                    <motion.tr
                                                        key={inventory.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                        className="hover:bg-blue-50/60 transition-colors"
                                                    >
                                                        <TableCell className="w-16 font-semibold text-blue-700">
                                                            { rowNumber }
                                                        </TableCell>

                                                        {/* Product Information */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Package className="w-4 h-4 text-blue-500" />
                                                                <div>
                                                                    <div className="font-medium truncate" title={inventory.product?.name || 'Unknown Product'}>
                                                                        {inventory.product?.name || 'Unknown Product'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 truncate" title={inventory.product?.sku || 'No SKU'}>
                                                                        SKU: {inventory.product?.sku || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Warehouse */}
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium truncate" title={inventory.warehouse?.name || 'Unknown Warehouse'}>
                                                                    {inventory.warehouse?.name || 'Unknown Warehouse'}
                                                                </div>
                                                                <div className="text-sm text-gray-500 truncate" title={inventory.warehouse?.code || 'No Code'}>
                                                                    CODE: {inventory.warehouse?.code || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Quantity On Hand */}
                                                        <TableCell className="text-center">
                                                            <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {inventory.quantity_on_hand.toLocaleString()}
                                                            </span>
                                                        </TableCell>

                                                        {/* Quantity Reserved */}
                                                        <TableCell className="text-center">
                                                            <span className="text-gray-600">
                                                                {inventory.quantity_reserved.toLocaleString()}
                                                            </span>
                                                        </TableCell>

                                                        {/* Quantity Available */}
                                                        <TableCell className="text-center">
                                                            <span className={`font-semibold ${
                                                                isOutOfStock ? 'text-red-600' : 
                                                                isLowStock ? 'text-orange-600' : 'text-green-600'
                                                            }`}>
                                                                {inventory.quantity_available.toLocaleString()}
                                                            </span>
                                                        </TableCell>

                                                        {/* Status */}
                                                        <TableCell className="text-center">
                                                            <div className="flex flex-col gap-1">
                                                                {isOutOfStock ? (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Out of Stock
                                                                    </Badge>
                                                                ) : isLowStock ? (
                                                                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                                        Low Stock
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                                                        In Stock
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Actions */}
                                                        <TableCell className="w-32">
                                                            <div className="flex gap-2 justify-center">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="View Inventory Details"
                                                                    onClick={() => router.visit(route('admin.inventories.show', inventory.id))}
                                                                >
                                                                    <View className="w-4 h-4" />
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="Edit Inventory"
                                                                    onClick={() => router.visit(route('admin.inventories.edit', inventory.id))}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </motion.button>

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.15 }}
                                                                            className="p-2 rounded hover:bg-red-100 text-red-600"
                                                                            title="Delete Inventory"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Inventory</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete this inventory record for "{inventory.product?.name}" in "{inventory.warehouse?.name}"? This action cannot be undone and will permanently remove the inventory data.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteInventory(inventory.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete Inventory
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                );
                                            })}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-6">
                                            <CustomPagination data={ inventories } />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }} 
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <ClipboardList className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                                        </motion.div>
                                        <h3 className="text-xl font-semibold mb-2 text-blue-700">
                                            No Inventories Found
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            Get started by creating your first inventory.
                                        </p>
                                        <motion.div whileHover={{ scale: 1.08 }}>
                                            <Button
                                                onClick={() => router.visit(route('admin.inventories.create'))}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Inventory
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </Authenticated>
    );
}

export default InventoryIndex;