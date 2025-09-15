import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Category, PaginatedResponse } from "@/types";
import type { PageProps } from '@/types';
import CustomPagination from "@/Components/CustomPagination";
import { Plus, Edit2, Trash2, Package, CheckCircle2 } from "lucide-react";
import { toast } from 'sonner';
import { useEffect, useState, useRef } from 'react';


interface ICategoryProps {
    categories: PaginatedResponse<Category>;
    sort?: string;
}

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
    };
};

export default function CategoryIndex({ categories, sort: initialSort = 'newest' }: ICategoryProps) {
    const { props } = usePage<InertiaPageProps>();
    // ...existing hooks and logic...
    // (Insert the rest of the component code here, including the return statement)

    // Search state and debounce
    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sort, setSort] = useState(initialSort);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search input with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        setIsSearching(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                router.get(route('admin.category.index'), { search: value, sort }, { preserveState: true, replace: true });
                setIsSearching(false);
            }, 500);
        };

        // Handle filter/sort change for shadcn UI Select
        const handleSortChange = (value: string) => {
            setSort(value);
            router.get(route('admin.category.index'), { search, sort: value }, { preserveState: true, replace: true });
        };

        // Clear search
        const handleClear = () => {
            setSearch('');
            setSort('newest');
            router.get(route('admin.category.index'), {}, { preserveState: true, replace: true });
        };

        useEffect(() => {
            if (props.flash && props.flash.success) {
                toast.success(props.flash.success, {
                    description: 'The new category is now available in your inventory.',
                    duration: 4000,
                    style: { fontWeight: 'bold', fontSize: '1.1rem' },
                    icon: <CheckCircle2 className="text-green-600 w-6 h-6" />,
                });
            }
        }, [props.flash]);

        return (
            <AuthenticatedLayout
                header={(
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight flex items-center gap-2">
                            <Package className="w-7 h-7 text-blue-600" />
                            Category Management
                        </h2>
                        <div className="h-1 w-24 bg-blue-200 rounded mt-2 mb-1" />
                    </motion.div>
                )}
            >
                <Head title="Categories" />
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
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="w-full max-w-xs shadow-sm focus:ring-2 focus:ring-blue-200"
                                    aria-label="Search categories"
                                />
                                {search && (
                                    <motion.div whileHover={{ scale: 1.1 }}>
                                        <Button size="icon" variant="ghost" onClick={handleClear} title="Clear search">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </Button>
                                    </motion.div>
                                )}
                                <motion.div whileHover={{ scale: 1.03 }}>
                                    <Select value={sort} onValueChange={handleSortChange}>
                                        <SelectTrigger className="w-[180px] shadow-sm focus:ring-2 focus:ring-blue-200">
                                            <SelectValue placeholder="Filter categories" />
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
                                    onClick={() => router.visit(route('admin.category.create'))}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-150"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Category
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
                                        <Package className="w-6 h-6 text-blue-600" />
                                        Categories <span className="text-blue-400 font-normal">({categories.total})</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AnimatePresence mode="wait">
                                        {categories.data.length > 0 ? (
                                            <motion.div
                                                key="table"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-16">#</TableHead>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead>Description</TableHead>
                                                            <TableHead>Created At</TableHead>
                                                            <TableHead className="text-center">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {categories.data.map((category, idx) => {
                                                            const rowNumber = (categories.current_page - 1) * categories.per_page + idx + 1;
                                                            return (
                                                                <motion.tr
                                                                    key={category.id}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                                                                    className="hover:bg-blue-50/60 transition-colors"
                                                                >
                                                                    <TableCell className="font-semibold text-blue-700">{rowNumber}</TableCell>
                                                                    <TableCell className="font-medium">{category.name}</TableCell>
                                                                    <TableCell className="text-gray-600">{category.description}</TableCell>
                                                                    <TableCell className="text-gray-500">{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                                                    <TableCell className="flex gap-2 justify-center">
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.15 }}
                                                                            className="p-2 rounded hover:bg-blue-100 text-blue-600"
                                                                            title="Edit"
                                                                            onClick={() => router.visit(route('admin.category.edit', category.id))}
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.15 }}
                                                                            className="p-2 rounded hover:bg-red-100 text-red-600"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                    </TableCell>
                                                                </motion.tr>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                                <div className="mt-6">
                                                    <CustomPagination data={categories} />
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
                                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                                    <Package className="w-14 h-14 text-blue-200 mx-auto mb-4" />
                                                </motion.div>
                                                <h3 className="text-xl font-semibold mb-2 text-blue-700">No categories found</h3>
                                                <p className="text-gray-500 mb-4">Get started by creating your first category.</p>
                                                <motion.div whileHover={{ scale: 1.08 }}>
                                                    <Button
                                                        onClick={() => router.visit(route('admin.category.create'))}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Category
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
            </AuthenticatedLayout>
        );
}
