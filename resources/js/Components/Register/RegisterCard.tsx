import { useState } from 'react';
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { Link } from '@inertiajs/react';
import { useRegisterForm } from '@/hooks/register/submit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import InputError from '@/Components/InputError';
import { fadeInUp } from '@/utils/welcome/animationVariants';
import { Spinner } from '../ui/spinner';

interface IRegisterCardProps {
    status?: string;
}

const RegisterCard = ({
    status
}: IRegisterCardProps) => {
    const { data, setData, errors, processing, submit } = useRegisterForm();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                        Join InvenTrack to start managing your inventory
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Status Message */}
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertDescription className="text-green-700 dark:text-green-300">
                                    {status}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    <form
                        onSubmit={submit} 
                        className="space-y-6"
                    >
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label 
                                htmlFor="name" 
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Full Name
                            </Label>
                            <Input 
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-12 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-slate-500 dark:focus:border-slate-400"
                                placeholder="Enter your full name"
                                autoComplete="name"
                                autoFocus
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label 
                                htmlFor="email" 
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Email Address
                            </Label>
                            <Input 
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-12 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-slate-500 dark:focus:border-slate-400"
                                placeholder="Enter your email"
                                autoComplete="username"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label 
                                htmlFor="password" 
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Input 
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="h-12 pr-12 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-slate-500 dark:focus:border-slate-400"
                                    placeholder="Create a secure password"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label 
                                htmlFor="password_confirmation" 
                                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input 
                                    id="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="h-12 pr-12 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-slate-500 dark:focus:border-slate-400"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Spinner />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href={route('login')}
                                className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-4 transition-colors"
                            >
                                Sign in to your account
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default RegisterCard;