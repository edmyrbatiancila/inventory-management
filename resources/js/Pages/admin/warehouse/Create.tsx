import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Asterisk, Building, MapPin, Plus, WarehouseIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import InputError from "@/Components/InputError";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";

const WarehouseCreate = () => {

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        code: string;
        address: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        phone: string;
        email: string;
        is_active: boolean;
    }>({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        email: '',
        is_active: true,
    });

    // Helper function to generate warehouse code from name
    const generateWarehouseCode = (name: string) => {
        const words = name.split(' ').filter(word => word.length > 0);
        const prefix = words.map(word => word.charAt(0).toUpperCase()).join('');
        const timestamp = Date.now().toString().slice(-3);
        return `WH${prefix}${timestamp}`;
    };

    // Handle name change and auto-generate code
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData(prev => ({
            ...prev,
            name: name,
            code: name ? generateWarehouseCode(name) : ''
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('admin.warehouses.store'), {
            // No need to reset form since we're redirecting to edit page
            preserveScroll: true,
        });
    };

    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <WarehouseIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Warehouse</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new warehouse to your inventory</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Warehouse" />
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
                                onClick={() => router.visit(route('admin.warehouses.index'))}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Warehouses List
                            </Button>
                        </div>

                        <form 
                            onSubmit={ handleSubmit }
                            className="space-y-8"
                        >
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Warehouse Name */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="flex items-center gap-1"
                                            >
                                                Warehouse Name
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input 
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={handleNameChange}
                                                placeholder="Enter warehouse name"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            <InputError message={ errors.name } />
                                        </div>

                                        {/* Warehouse Code */}
                                        <div className="space-y-2">
                                            <Label 
                                                htmlFor="code"
                                                className="flex items-center gap-1"
                                            >
                                                Warehouse Code
                                            </Label>
                                            <Input 
                                                id="code"
                                                type="text"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                placeholder="Auto-generated or enter custom code"
                                                className={errors.code ? 'border-red-500' : ''}
                                            />
                                            <InputError message={ errors.code } />
                                            <p className="text-sm text-gray-500">
                                                Leave empty for auto-generation or enter a custom code
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Location Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Address */}
                                    <div className="space-y-2">
                                        <Label 
                                            htmlFor="address" 
                                            className="flex items-center gap-1"
                                        >
                                            Street Address
                                            <Asterisk className="w-3 h-3 text-red-500" />
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Enter full street address"
                                            rows={3}
                                            className={errors.address ? 'border-red-500' : ''}
                                        />
                                        <InputError message={errors.address} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* City */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="city"
                                                className="flex items-center gap-1"
                                            >
                                                City
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input
                                                id="city"
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="Enter city"
                                                className={errors.city ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.city} />
                                        </div>

                                        {/* State */}
                                        <div className="space-y-2">
                                            <Label htmlFor="state" className="flex items-center gap-1">
                                                State/Province
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input 
                                                id="state"
                                                type="text"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                placeholder="Enter state or province"
                                                className={errors.state ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.state} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Postal Code */}
                                        <div className="space-y-2">
                                            <Label htmlFor="postal_code" className="flex items-center gap-1">
                                                Postal Code
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input
                                                id="postal_code"
                                                type="text"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                placeholder="Enter postal code"
                                                className={errors.postal_code ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.postal_code} />
                                        </div>

                                        {/* Country */}
                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="flex items-center gap-1">
                                                Country
                                                <Asterisk className="w-3 h-3 text-red-500" />
                                            </Label>
                                            <Input
                                                id="country"
                                                type="text"
                                                value={data.country}
                                                onChange={(e) => setData('country', e.target.value)}
                                                placeholder="Enter country"
                                                className={errors.country ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.country} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Phone Number
                                            </Label>
                                            <Input 
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.phone} />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email Address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter email address"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Warehouse Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Active Status</Label>
                                            <p className="text-sm text-gray-500">
                                                Enable this warehouse for inventory operations
                                            </p>
                                        </div>
                                        <Switch 
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.warehouses.index'))}
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Warehouse
                                    </>
                                )}
                                </Button>
                            </div>
                        </form>
                        {/* <Card className="shadow-lg border-0 bg-white/90 px-2 sm:px-6 md:px-10 py-6">
                            <CardHeader className="mb-2">
                                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <WarehouseIcon className="w-6 h-6 text-blue-600" />
                                    New Warehouse
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form 
                                    onSubmit={handleSubmit} 
                                    className="space-y-6"
                                >

                                </form>
                            </CardContent>
                        </Card> */}
                    </motion.div>
                </div>
            </div>
        </Authenticated>
    );
}

export default WarehouseCreate;