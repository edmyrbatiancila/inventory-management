import { Head, Link } from '@inertiajs/react';
import { motion } from "framer-motion";
import { Package, Shield } from "lucide-react";
import { fadeIn, fadeInUp } from '@/utils/welcome/animationVariants';
import ForgotPasswordCard from '@/Components/ForgotPassword/ForgotPasswordCard';

export default function ForgotPassword({ 
    status 
}: { 
    status?: string 
}) {
    return (
        <>
            <Head title="Reset Password - InvenTrack" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-20" />
                
                <div className="relative w-full max-w-md">
                    {/* Header Section */}
                    <motion.div 
                        className="text-center mb-8"
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div 
                            className="flex items-center justify-center mb-6"
                            variants={fadeInUp}
                        >
                            <Link href="/" className="flex items-center space-x-3 group transition-transform hover:scale-105">
                                <div className="p-2 bg-slate-900 dark:bg-white rounded-lg group-hover:shadow-lg transition-shadow">
                                    <Package className="h-8 w-8 text-white dark:text-slate-900" />
                                </div>
                                <div className="text-left">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">InvenTrack</h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Inventory Management</p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Reset Password Form */}
                    <ForgotPasswordCard 
                        status={status}
                    />

                    {/* Security Notice */}
                    <motion.div 
                        className="mt-6 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                            <Shield className="h-3 w-3" />
                            <span>Secure password recovery for your inventory data</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
