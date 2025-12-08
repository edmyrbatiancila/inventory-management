import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Settings, Mail, Calendar, Zap } from 'lucide-react';

interface Props {}

const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export default function Create({}: Props) {
    const [data, setData] = useState({
        title: '',
        description: '',
        type: '',
        frequency: 'on_demand',
        auto_generate: false,
        email_on_completion: false,
        email_recipients: [],
        generate_now: false
    });

    const [emailList, setEmailList] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            ...data,
            email_recipients: emailList ? emailList.split(',').map(email => email.trim()).filter(Boolean) : []
        };

        router.post(route('admin.analytics.store'), submitData);
    };

    const reportTypes = [
        { value: 'inventory_summary', label: 'Inventory Summary', description: 'Comprehensive overview of inventory levels and valuations' },
        { value: 'stock_movement', label: 'Stock Movement Analysis', description: 'Track stock movements and identify patterns' },
        { value: 'purchase_analytics', label: 'Purchase Analytics', description: 'Purchase order performance and vendor analysis' },
        { value: 'sales_analytics', label: 'Sales Analytics', description: 'Sales performance and trend analysis' },
        { value: 'warehouse_performance', label: 'Warehouse Performance', description: 'Warehouse efficiency and utilization metrics' },
        { value: 'financial_summary', label: 'Financial Summary', description: 'Financial performance and cost analysis' },
        { value: 'operational_kpis', label: 'Operational KPIs', description: 'Key performance indicators and metrics' },
    ];

    const frequencies = [
        { value: 'on_demand', label: 'On Demand' },
        { value: 'real_time', label: 'Real-time' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(route('admin.analytics.index'))}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Reports
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">Create Analytics Report</h2>
                </div>
            }
        >
            <Head title="Create Analytics Report" />

            <motion.div
                className="max-w-4xl mx-auto space-y-6"
                initial="initial"
                animate="animate"
                variants={{
                    animate: {
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <motion.div variants={animationVariants}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Report Information</CardTitle>
                                </div>
                                <CardDescription>
                                    Define the basic details of your analytics report
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Report Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Daily Inventory Summary"
                                            value={data.title}
                                            onChange={(e) => setData({ ...data, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="type">Report Type *</Label>
                                        <Select value={data.type} onValueChange={(value) => setData({ ...data, type: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select report type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reportTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div>
                                                            <div className="font-medium">{type.label}</div>
                                                            <div className="text-xs text-gray-500">{type.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Optional description of what this report covers..."
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Schedule & Automation */}
                    <motion.div variants={animationVariants}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <CardTitle>Schedule & Automation</CardTitle>
                                </div>
                                <CardDescription>
                                    Configure when and how often this report should be generated
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="frequency">Generation Frequency</Label>
                                    <Select value={data.frequency} onValueChange={(value) => setData({ ...data, frequency: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frequencies.map((freq) => (
                                                <SelectItem key={freq.value} value={freq.value}>
                                                    {freq.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-orange-500" />
                                        <div>
                                            <Label>Auto-Generate Reports</Label>
                                            <p className="text-sm text-gray-600">
                                                Automatically generate this report based on the frequency schedule
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={data.auto_generate}
                                        onCheckedChange={(checked) => setData({ ...data, auto_generate: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Settings className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <Label>Generate Now</Label>
                                            <p className="text-sm text-gray-600">
                                                Generate this report immediately after creation
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={data.generate_now}
                                        onCheckedChange={(checked) => setData({ ...data, generate_now: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Email Notifications */}
                    <motion.div variants={animationVariants}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                    <CardTitle>Email Notifications</CardTitle>
                                </div>
                                <CardDescription>
                                    Configure email notifications for report completion
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <Label>Email on Completion</Label>
                                            <p className="text-sm text-gray-600">
                                                Send email notifications when the report is generated
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={data.email_on_completion}
                                        onCheckedChange={(checked) => setData({ ...data, email_on_completion: checked })}
                                    />
                                </div>

                                {data.email_on_completion && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Label htmlFor="email_recipients">Email Recipients</Label>
                                        <Input
                                            id="email_recipients"
                                            placeholder="Enter email addresses separated by commas"
                                            value={emailList}
                                            onChange={(e) => setEmailList(e.target.value)}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Separate multiple email addresses with commas
                                        </p>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Actions */}
                    <motion.div variants={animationVariants}>
                        <div className="flex gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('admin.analytics.index'))}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                Create Report
                            </Button>
                        </div>
                    </motion.div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}