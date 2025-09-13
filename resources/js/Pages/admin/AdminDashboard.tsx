import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { User } from '@/types';
import { Head } from '@inertiajs/react';

interface IAdminDashboardProps {
    user: User;
}

export default function AdminDashboard({ user }: IAdminDashboardProps) {

    console.log(user);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in Good!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
