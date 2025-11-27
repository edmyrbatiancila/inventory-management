import { fadeInUp } from '@/utils/welcome/animationVariants';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useLoginForm } from '@/hooks/login/submit';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import InputError from '../InputError';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Link } from '@inertiajs/react';

interface ILoginCardProps {
    status?: string;
    isResetPassword: boolean; 
}

const LoginCard = ({
    status,
    isResetPassword
}: ILoginCardProps) => {
    const { data, setData, errors, processing, submit } = useLoginForm();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                        Sign in to access your inventory dashboard
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
                                autoFocus
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
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            />
                            <Label 
                                htmlFor="remember" 
                                className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                            >
                                Remember me for 30 days
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent dark:border-slate-900 dark:border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 space-y-4">
                        {isResetPassword && (
                            <div className="text-center">
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                                    New to InvenTrack?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href={route('register')}
                                className="text-sm text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-300 font-medium transition-colors"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default LoginCard;