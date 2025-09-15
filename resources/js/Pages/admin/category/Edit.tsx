import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Category } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, LucidePackageOpen, PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import InputError from '@/Components/InputError';
import { Textarea } from '@/Components/ui/textarea';
import { useEffect } from 'react';

interface IEditProps {
    category: Category;
}

const CategoryEdit = ({ category }: IEditProps) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: category.name || '',
        description: category.description || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.category.update', category.id), {
            onSuccess: () => {
                // Optionally reset or show a toast
            }
        });
    };

    useEffect(() => {
        setData({
            name: category.name || '',
            description: category.description || ''
        })
    }, [category]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <LucidePackageOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Edit Category</h2>
                        <p className="text-sm text-gray-600 mt-1">Edit the details of the category in your inventory</p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Category - ${category.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => router.visit(route('admin.category.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to List
                            </Button>
                        </div>
                        <Card className="shadow-lg border-0 bg-white/90 px-2 sm:px-6 md:px-10 py-6">
                            <CardHeader className="mb-2">
                                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <LucidePackageOpen className="w-6 h-6 text-blue-600" />
                                    Update Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Enter category name"
                                            className="w-full"
                                            autoFocus
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description <span className="text-gray-400">(optional)</span>
                                        </label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Enter category description"
                                            className="w-full min-h-[100px]"
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => reset()} disabled={processing}>
                                            Reset
                                        </Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={processing}>
                                            {processing ? 'Updating...' : 'Update Category'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}

export default CategoryEdit;