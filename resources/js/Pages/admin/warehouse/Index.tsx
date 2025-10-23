import CustomPagination from "@/Components/CustomPagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps, PaginatedResponse } from "@/types";
import { Warehouse } from "@/types/Warehouse/IWarehouse";
import { Head, router, usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Edit2, Plus, Trash2, View, WarehouseIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface IWarehouseIndexProps {
    warehouses: PaginatedResponse<Warehouse>;
    sort?: string;
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
        error?: string;
    };
};

const WarehouseIndex = ({
    warehouses,
    sort: initialSort = 'newest'
}: IWarehouseIndexProps) => {
    const { props } = usePage<InertiaPageProps>();

    const [search, setSearch] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [sort, setSort] = useState(initialSort);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search input with debounce
        const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            setIsSearching(true);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(route('admin.warehouses.index'), { search: value, sort }, { preserveState: true, replace: true });
                setIsSearching(false);
            }, 500);
        };

    // Clear search
    const handleClear = () => {
        setSearch('');
        setSort('newest');
        router.get(route('admin.warehouses.index'), {}, { preserveState: true, replace: true });
    };

    // Handle filter/sort change for shadcn UI Select
    const handleSortChange = (value: string) => {
        setSort(value);
        router.get(route('admin.warehouses.index'), { search, sort: value }, { preserveState: true, replace: true });
    };

    const handleDeleteWarehouse = (warehouseId: number) => {
        router.delete(route('admin.warehouses.destroy', warehouseId), {
            preserveScroll: true,
            onSuccess: () => {
                // Success message will be handled by the flash message
            },
            onError: () => {
                toast.error('Failed to delete warehouse', {
                    description: 'The warehouse could not be deleted. It may be in use.',
                    duration: 4000,
                });
            }
        });
    };

    useEffect(() => {
        if (props.flash && props.flash.success) {
            toast.success(props.flash.success, {
                description: 'Warehouse operation completed successfully.',
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
                    <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight flex items-center gap-2"></h2>
                    <WarehouseIcon className="w-7 h-7 text-blue-600" />
                    Warehouse Management
                </motion.div>
            }
        >
            <Head title="Warehouses" />
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
                                placeholder="Search brands..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full max-w-xs shadow-sm focus:ring-2 focus:ring-blue-200"
                                aria-label="Search brands"
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
                                        <SelectValue placeholder="Filter warehouses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Select Filter</SelectLabel>
                                            <SelectItem value="newest">Newest</SelectItem>
                                            <SelectItem value="oldest">Oldest</SelectItem>
                                            <SelectItem value="az">A-Z</SelectItem>
                                            <SelectItem value="za">Z-A</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </motion.div>
                        </div>
                        <motion.div whileHover={{ scale: 1.04 }}>
                            <Button
                                onClick={() => router.visit(route('admin.warehouses.create'))}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-150"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Warehouse
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
                                    <WarehouseIcon className="w-6 h-6 text-blue-600" />
                                    Warehouses <span className="text-blue-400 font-normal">({ warehouses.total })</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence mode="wait">
                                {warehouses.data.length > 0 ? (
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
                                                    <TableHead className="w-16">#</TableHead>
                                                    <TableHead>Warehouse Name</TableHead>
                                                    <TableHead>Address</TableHead>
                                                    <TableHead>City</TableHead>
                                                    <TableHead>State</TableHead>
                                                    <TableHead>Postal Code</TableHead>
                                                    <TableHead>Country</TableHead>
                                                    <TableHead>Phone Number</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-32 text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                            {warehouses.data.map((warehouse, idx) => {
                                                const rowNumber = (warehouses.current_page - 1) * warehouses.per_page + idx + 1;

                                                return (
                                                    <motion.tr
                                                        key={warehouse.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                        className="hover:bg-blue-50/60 transition-colors"
                                                    >
                                                        <TableCell className="w-16 font-semibold text-blue-700">{rowNumber}</TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div
                                                                    className="font-medium truncate" 
                                                                    title={warehouse.name}
                                                                >
                                                                    {warehouse.name}
                                                                </div>
                                                                <div
                                                                    className="text-sm text-gray-500 truncate" 
                                                                    title={warehouse.code}
                                                                >
                                                                    CODE: { warehouse.code }
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-32 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.address || "No address"}
                                                            >
                                                                {warehouse.address}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-32 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.city || "No city"}
                                                            >
                                                                {warehouse.city}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-32 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.state || "No state"}
                                                            >
                                                                {warehouse.state}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-24 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.postal_code || "No postal code"}
                                                            >
                                                                {warehouse.postal_code}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-32 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.country || "No country"}
                                                            >
                                                                {warehouse.country}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-24 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.phone || "No phone"}
                                                            >
                                                                {warehouse.phone}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-24 text-gray-600">
                                                            <div
                                                                className="truncate" 
                                                                title={warehouse.email || "No email"}
                                                            >
                                                                {warehouse.email || "No email"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-24 text-gray-600">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                warehouse.is_active 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {warehouse.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="w-32">
                                                            <div className="flex gap-2 justify-center">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="View Warehouse Details"
                                                                    onClick={() => router.visit(route('admin.warehouses.show', warehouse.id))}
                                                                >
                                                                    <View className="w-4 h-4" />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.15 }}
                                                                    className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                    title="Edit Warehouse Details"
                                                                    onClick={() => router.visit(route('admin.warehouses.edit', warehouse.id))}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </motion.button>

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.15 }}
                                                                            className="p-2 rounded hover:bg-red-100 text-red-600"
                                                                            title="Delete Product"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete "{warehouse.name}"? 
                                                                                This action cannot be undone and will permanently remove this warehouse.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction 
                                                                                onClick={() => handleDeleteWarehouse(warehouse.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete
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
                                            <CustomPagination data={ warehouses } />
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
                                            <WarehouseIcon className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                                        </motion.div>
                                        <h3 className="text-xl font-semibold mb-2 text-blue-700">No Warehouses Found</h3>
                                        <p className="text-gray-500 mb-4">Get started by creating your first warehouse.</p>
                                        <motion.div whileHover={{ scale: 1.08 }}>
                                            <Button
                                                onClick={() => router.visit(route('admin.warehouses.create'))}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Warehouse
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

export default WarehouseIndex;