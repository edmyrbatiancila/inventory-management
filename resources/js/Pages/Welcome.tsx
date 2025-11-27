import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { 
    Package, 
    CheckCircle,
    ArrowRight,
} from "lucide-react";
import { benefits, features, stats } from '@/utils/welcome/welcome-utils';
import { fadeInUp, staggerContainer } from '@/utils/welcome/animationVariants';


export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {

    return (
        <>
            <Head title="Welcome to InvenTrack" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Navigation */}
                <motion.nav 
                    className="relative z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-800"
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Package className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">InvenTrack</span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={route('dashboard')}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <Button variant="ghost" asChild>
                                            <Link href={route('login')}>
                                                Sign In
                                            </Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={route('register')}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.nav>

                <main>
                    {/* Hero Section */}
                    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <motion.div 
                                className="text-center"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                <motion.div variants={fadeInUp}>
                                    <Badge variant="secondary" className="mb-4">
                                        Advanced Inventory Management Solution
                                    </Badge>
                                </motion.div>
                                
                                <motion.h1 
                                    className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl"
                                    variants={fadeInUp}
                                >
                                    Revolutionize Your{' '}
                                    <span className="bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent dark:from-slate-300 dark:to-slate-100">
                                        Inventory Operations
                                    </span>
                                </motion.h1>
                                
                                <motion.p 
                                    className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300"
                                    variants={fadeInUp}
                                >
                                    InvenTrack provides comprehensive, real-time inventory tracking and management 
                                    across multiple locations with advanced analytics, automated workflows, and 
                                    complete audit trails.
                                </motion.p>
                                
                                <motion.div 
                                    className="mt-10 flex items-center justify-center gap-x-6"
                                    variants={fadeInUp}
                                >
                                    {!auth.user && (
                                        <>
                                            <Button size="lg" asChild>
                                                <Link href={route('register')}>
                                                    Start Free Trial
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="lg" asChild>
                                                <Link href={route('login')}>
                                                    Sign In
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    {auth.user && (
                                        <Button size="lg" asChild>
                                            <Link href={route('dashboard')}>
                                                Go to Dashboard
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </motion.div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="border-y bg-white dark:bg-slate-900 dark:border-slate-800">
                        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                            <motion.div 
                                className="grid grid-cols-2 gap-8 md:grid-cols-4"
                                variants={staggerContainer}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                            >
                                {stats.map((stat, index) => (
                                    <motion.div key={index} className="text-center" variants={fadeInUp}>
                                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {stat.value}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <motion.div 
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                    Powerful Features for Modern Businesses
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                                    Everything you need to optimize your inventory operations and drive business growth.
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                variants={staggerContainer}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                            >
                                {features.map((feature, index) => (
                                    <motion.div key={index} variants={fadeInUp}>
                                        <Card className="h-full border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
                                            <CardHeader>
                                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    <feature.icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                                                </div>
                                                <CardTitle className="text-slate-900 dark:text-white">
                                                    {feature.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                                    {feature.description}
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>

                    {/* Benefits Section */}
                    <section className="bg-white px-4 py-20 dark:bg-slate-900 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                        Transform Your Business Operations
                                    </h2>
                                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                        Join thousands of businesses that have streamlined their inventory management 
                                        and achieved remarkable operational efficiency with InvenTrack.
                                    </p>
                                    
                                    <div className="mt-8">
                                        {!auth.user && (
                                            <Button size="lg" asChild>
                                                <Link href={route('register')}>
                                                    Get Started Today
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                                
                                <motion.div 
                                    className="space-y-4"
                                    variants={staggerContainer}
                                    initial="initial"
                                    whileInView="animate"
                                    viewport={{ once: true }}
                                >
                                    {benefits.map((benefit, index) => (
                                        <motion.div 
                                            key={index} 
                                            className="flex items-center space-x-3"
                                            variants={fadeInUp}
                                        >
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    {!auth.user && (
                        <section className="px-4 py-20 sm:px-6 lg:px-8">
                            <motion.div 
                                className="mx-auto max-w-3xl text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-slate-900 dark:text-white sm:text-3xl">
                                            Ready to Optimize Your Inventory?
                                        </CardTitle>
                                        <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                                            Start your free trial today and experience the power of intelligent inventory management.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                                            <Button size="lg" asChild>
                                                <Link href={route('register')}>
                                                    Start Free Trial
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="lg" asChild>
                                                <Link href={route('login')}>
                                                    Sign In
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="border-t bg-white dark:bg-slate-900 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    InvenTrack © 2024
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                                <span>Laravel v{laravelVersion}</span>
                                <span>PHP v{phpVersion}</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
