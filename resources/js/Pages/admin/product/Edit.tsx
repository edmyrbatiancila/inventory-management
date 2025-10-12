import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Asterisk, Barcode, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import InputError from "@/Components/InputError";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Product } from "@/types/Product/IProduct";
import { Brand, Category } from "@/types";

interface IProductEditProps {
    product: Product;
    categories: Category[];
    brands: Brand[];
}

const ProductEdit = ({ product, categories, brands }: IProductEditProps) => {

    const { data, setData, put, processing, errors, reset } = useForm<{
        name: string;
        description: string;
        sku: string;
        barcode: string;
        slug: string;
        price: string;
        cost_price: string;
        category_id: string;
        brand_id: string;
        min_stock_level: string;
        max_stock_level: string;
        is_active: boolean;
        track_quantity: boolean;
    }>({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        slug: product.slug || '',
        price: product.price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        category_id: product.category_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        min_stock_level: product.min_stock_level?.toString() || '0',
        max_stock_level: product.max_stock_level?.toString() || '',
        is_active: product.is_active ?? true,
        track_quantity: product.track_quantity ?? true,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('admin.products.update', product.id), {
            onSuccess: () => {
                // Success message will be handled by the controller
            },
            preserveScroll: true,
        });
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <Barcode className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Edit Product</h2>
                        <p className="text-sm text-gray-600 mt-1">Update product information</p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${product.name}`} />
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
                                onClick={() => router.visit(route('admin.products.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Products List
                            </Button>
                        </div>

                        <Card className="shadow-lg border-0 bg-white/90 px-2 sm:px-6 md:px-10 py-6">
                            <CardHeader className="mb-2">
                                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Barcode className="w-6 h-6 text-blue-600" />
                                    Edit Product: {product.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Basic Information Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Product Name */}
                                        <div>
                                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Product Name
                                                <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={data.name}
                                                onChange={handleNameChange}
                                                placeholder="Enter product name"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.name} className="mt-1" />
                                        </div>

                                        {/* SKU */}
                                        <div>
                                            <Label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                                                SKU (Stock Keeping Unit)
                                                <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                            </Label>
                                            <Input
                                                id="sku"
                                                name="sku"
                                                value={data.sku}
                                                onChange={(e) => setData('sku', e.target.value)}
                                                placeholder="Enter SKU"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.sku} className="mt-1" />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                            <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Enter product description"
                                            rows={4}
                                            className="w-full"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>

                                    {/* Category and Brand */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category */}
                                        <div>
                                            <Label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                                <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                            </Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.category_id} className="mt-1" />
                                        </div>

                                        {/* Brand */}
                                        <div>
                                            <Label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Brand
                                                <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                            </Label>
                                            <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.brand_id} className="mt-1" />
                                        </div>
                                    </div>

                                    {/* Pricing Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Price */}
                                        <div>
                                            <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                                Selling Price (₱)
                                                <Asterisk className="inline-block w-3 h-3 text-red-500 ml-0.5" />
                                            </Label>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.price} className="mt-1" />
                                        </div>

                                        {/* Cost Price */}
                                        <div>
                                            <Label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-1">
                                                Cost Price (₱)
                                                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="cost_price"
                                                name="cost_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.cost_price}
                                                onChange={(e) => setData('cost_price', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.cost_price} className="mt-1" />
                                        </div>
                                    </div>

                                    {/* Inventory Management */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Min Stock Level */}
                                        <div>
                                            <Label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
                                                Min Stock Level
                                            </Label>
                                            <Input
                                                id="min_stock_level"
                                                name="min_stock_level"
                                                type="number"
                                                min="0"
                                                value={data.min_stock_level}
                                                onChange={(e) => setData('min_stock_level', e.target.value)}
                                                placeholder="0"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.min_stock_level} className="mt-1" />
                                        </div>

                                        {/* Max Stock Level */}
                                        <div>
                                            <Label htmlFor="max_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Stock Level
                                                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="max_stock_level"
                                                name="max_stock_level"
                                                type="number"
                                                min="0"
                                                value={data.max_stock_level}
                                                onChange={(e) => setData('max_stock_level', e.target.value)}
                                                placeholder="100"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.max_stock_level} className="mt-1" />
                                        </div>

                                        {/* Barcode */}
                                        <div>
                                            <Label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                                                Barcode
                                                <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                                            </Label>
                                            <Input
                                                id="barcode"
                                                name="barcode"
                                                value={data.barcode}
                                                onChange={(e) => setData('barcode', e.target.value)}
                                                placeholder="Enter barcode"
                                                className="w-full"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.barcode} className="mt-1" />
                                        </div>
                                    </div>

                                    {/* Auto-generated Slug */}
                                    <div>
                                        <Label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug (URL-friendly name)
                                        </Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            placeholder="Auto-generated from name"
                                            className="w-full bg-gray-50"
                                            disabled={processing}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Auto-generated from product name, but can be customized</p>
                                        <InputError message={errors.slug} className="mt-1" />
                                    </div>

                                    {/* Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Product Settings</h3>
                                        
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">Active Status</span>
                                                <span className="text-xs text-gray-500">Enable this product for sale</span>
                                            </div>
                                            <Switch
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">Track Quantity</span>
                                                <span className="text-xs text-gray-500">Monitor inventory levels for this product</span>
                                            </div>
                                            <Switch
                                                checked={data.track_quantity}
                                                onCheckedChange={(checked) => setData('track_quantity', checked)}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(route('admin.products.index'))}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Update Product
                                                </>
                                            )}
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
};

export default ProductEdit;