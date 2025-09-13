import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { motion } from "framer-motion";
import { Category, PaginatedResponse } from "@/types";
import CustomPagination from "@/Components/CustomPagination";
import { Plus, Edit2, Trash2, Package, CheckCircle2 } from "lucide-react";
import { toast } from 'sonner';
import { useEffect } from 'react';


interface ICategoryProps {
    categories: PaginatedResponse<Category>;
}


import type { PageProps } from '@/types';

type InertiaPageProps = PageProps & {
    flash?: {
        success?: string;
    };
};

export default function CategoryIndex({ categories }: ICategoryProps) {
    const { props } = usePage<InertiaPageProps>();

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
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Category Management
                </h2>
            }
        >
            <Head title="Categories" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-6 h-6 text-blue-600" />
                                Categories ({categories.total})
                            </CardTitle>
                            <Button
                                onClick={() => router.visit(route('admin.category.create'))}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Category
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {categories.data.length > 0 ? (
                                <>
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
                                                    <TableRow key={category.id} className="hover:bg-gray-50">
                                                        <TableCell>{rowNumber}</TableCell>
                                                        <TableCell className="font-medium">{category.name}</TableCell>
                                                        <TableCell>{category.description}</TableCell>
                                                        <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <Button size="sm" variant="outline">
                                                                    <Edit2 className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="text-red-600">
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    <div className="mt-6">
                                        <CustomPagination data={categories} />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                                    <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Category
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
