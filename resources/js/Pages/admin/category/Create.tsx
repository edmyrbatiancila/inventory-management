import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { motion } from 'framer-motion';
import { Textarea } from '@/Components/ui/textarea';
import { PackagePlus, ArrowLeft } from 'lucide-react';
import InputError from '@/Components/InputError';

export default function CategoryCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.category.store'), {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <PackagePlus className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Category</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new category to your inventory</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Category" />
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
                                    <PackagePlus className="w-6 h-6 text-blue-600" />
                                    New Category
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
                                        {/* {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>} */}
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
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => reset()} 
                                            disabled={processing}
                                        >
                                            Reset
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white" 
                                            disabled={processing}
                                        >
                                            {processing ? 'Saving...' : 'Create Category'}
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