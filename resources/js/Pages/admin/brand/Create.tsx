import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Asterisk, Tag, Upload, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import InputError from "@/Components/InputError";
import { Textarea } from "@/Components/ui/textarea";
import { useState } from "react";

const BrandCreate = () => {
    const [logoPreview, setLogoPreview] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        slug: '',
        logo_url: '',
        website_url: '',
        is_active: true,
    });

    // Helper function to generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim();
    };

    // Handle name change and auto-generate slug
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData(prev => ({
            ...prev,
            name: name,
            slug: generateSlug(name)
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
            
            // For now, just store the file name. In production, you'd upload to storage
            setData('logo_url', file.name);
        } else {
            // Clear logo if no file selected
            setLogoPreview('');
            setData('logo_url', '');
        }
    };

    const clearLogo = () => {
        setLogoPreview('');
        setData('logo_url', '');
        // Clear the file input
        const fileInput = document.getElementById('logo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.brand.store'), {
            onSuccess: () => {
                reset();
                setLogoPreview('');
            },
            preserveScroll: true,
        });
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <Tag className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Brand</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new brand to your inventory</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Brand" />
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
                                onClick={() => router.visit(route('admin.brand.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to List
                            </Button>
                        </div>
                        <Card
                            className="shadow-lg border-0 bg-white/90 px-2 sm:px-6 md:px-10 py-6"
                        >
                            <CardHeader
                                className="mb-2"
                            >
                                <CardTitle
                                    className="text-xl font-semibold text-gray-900 flex items-center gap-2"
                                >
                                    <Tag className="w-6 h-6 text-blue-600" />
                                    New Brand
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form 
                                    onSubmit={ handleSubmit } 
                                    className="space-y-6"
                                >
                                    <div>
                                        <Label 
                                            htmlFor="name" 
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Brand Name
                                            <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                        </Label>
                                        <Input 
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={handleNameChange}
                                            placeholder="Enter brand name"
                                            className="w-full"
                                            autoFocus
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div>
                                        <Label 
                                            htmlFor="slug" 
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Slug (URL-friendly name)
                                            <span className="text-xs text-gray-500 ml-2">(auto-generated, but editable)</span>
                                        </Label>
                                        <Input 
                                            id="slug"
                                            name="slug"
                                            value={data.slug}
                                            onChange={e => setData('slug', e.target.value)}
                                            placeholder="brand-slug-example"
                                            className="w-full font-mono text-sm"
                                        />
                                        <InputError message={errors.slug} />
                                    </div>
                                    <div>
                                        <Label 
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Description
                                            <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Enter brand description"
                                            className="w-full min-h-[100px]"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <Label 
                                            htmlFor="logo"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Brand Logo
                                            <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                        </Label>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Input
                                                        id="logo"
                                                        name="logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    PNG, JPG up to 2MB recommended size: 200x200px
                                                </p>
                                            </div>
                                            {logoPreview && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="h-16 w-16 rounded-lg border border-gray-200 object-cover shadow-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.logo_url} />
                                    </div>

                                    {/* Website URL */}
                                    <div>
                                        <Label 
                                            htmlFor="website_url"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Website URL
                                            <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="website_url"
                                                name="website_url"
                                                type="url"
                                                value={data.website_url}
                                                onChange={e => setData('website_url', e.target.value)}
                                                placeholder="https://www.brandwebsite.com"
                                                className="w-full pl-10"
                                            />
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Enter the official brand website URL
                                        </p>
                                        <InputError message={errors.website_url} />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => {
                                                reset();
                                                setLogoPreview('');
                                            }} 
                                            disabled={processing}
                                        >
                                            Reset
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white" 
                                            disabled={processing}
                                        >
                                            {processing ? 'Creating...' : 'Create Brand'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Authenticated>
    );
}

export default BrandCreate;
