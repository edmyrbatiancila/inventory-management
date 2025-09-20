import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Brand } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Globe, Tag, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import React, { useState, useEffect } from "react";
import { Label } from "@/Components/ui/label";
import InputError from "@/Components/InputError";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";

interface IBrandEditProps {
    brand: Brand;
}

const BrandEdit = ({ brand }: IBrandEditProps) => {

    const [logoPreview, setLogoPreview] = useState<string>('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');

    const { data, setData, put, processing, errors, reset } = useForm({
        name: brand.name || '',
        description: brand.description || '',
        website_url: brand.website_url || '',
        is_active: brand.is_active ? 1 : 0,
        logo: null as File | null,
        logo_url: brand.logo_url || '',
        slug: brand.slug || '',
    });

    // Initialize logo preview with existing logo
    useEffect(() => {
        if (brand.logo_url && !logoPreview) {
            setLogoPreview(`/storage/${brand.logo_url}`);
            // Extract file name from logo_url for display
            const fileName = brand.logo_url.split('/').pop() || '';
            setSelectedFileName(fileName);
        }
    }, [brand.logo_url]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('admin.brand.update', brand.id), {
            onSuccess: () => {
                console.log('Brand updated successfully');
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
            setSelectedFileName(file.name);
            setData('logo', file);
        } else {
            // Reset to existing logo if no new file selected
            if (brand.logo_url) {
                setLogoPreview(`/storage/${brand.logo_url}`);
                const fileName = brand.logo_url.split('/').pop() || '';
                setSelectedFileName(fileName);
            } else {
                setLogoPreview('');
                setSelectedFileName('');
            }
            setData('logo', null);
        }
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <Tag className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Edit Brand</h2>
                        <p className="text-sm text-gray-600 mt-1">Update the brand information</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Brand" />
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
                        <Card className="shadow-lg border-0 bg-white/90 px-2 sm:px-6 md:px-10 py-6">
                            <CardHeader className="mb-2">
                                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-blue-600" />
                                    Update Brand
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={ handleSubmit } className="space-y-6">
                                    <div>
                                        <Label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Brand Name
                                        </Label>
                                        <Input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
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
                                            className="w-full font-mono text-sm"
                                        />
                                        <InputError message={errors.slug} />
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="description"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Brand Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
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
                                        </Label>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        id="logo"
                                                        accept="image/*"
                                                        onChange={ handleLogoChange }
                                                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                                </div>
                                                {selectedFileName && (
                                                    <p className="mt-1 text-sm text-blue-600 font-medium">
                                                        📎 {selectedFileName}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-500">
                                                    PNG, JPG up to 2MB recommended size: 200x200px
                                                    {brand.logo_url && !data.logo && " (Current logo will be replaced)"}
                                                </p>
                                            </div>
                                        {(logoPreview || brand.logo_url) && (
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={logoPreview || `/storage/${brand.logo_url}`}
                                                    alt="Logo Preview"
                                                    className="h-16 w-16 rounded-lg border border-gray-200 object-cover shadow-sm"
                                                />
                                                <p className="text-xs text-center mt-1 text-gray-500">
                                                    {data.logo ? 'New Logo' : 'Current Logo'}
                                                </p>
                                            </div>
                                        )}
                                        </div>
                                        <InputError message={errors.logo || errors.logo_url} />
                                    </div>

                                    {/* Website URL */}
                                    <div>
                                        <Label
                                            htmlFor="website_url"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Website URL
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
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        <InputError message={errors.website_url} />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                reset();
                                                // Reset logo preview and file name to original or empty
                                                if (brand.logo_url) {
                                                    setLogoPreview(`/storage/${brand.logo_url}`);
                                                    const fileName = brand.logo_url.split('/').pop() || '';
                                                    setSelectedFileName(fileName);
                                                } else {
                                                    setLogoPreview('');
                                                    setSelectedFileName('');
                                                }
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
                                            {processing ? 'Updating...' : 'Update Brand'}
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

export default BrandEdit;