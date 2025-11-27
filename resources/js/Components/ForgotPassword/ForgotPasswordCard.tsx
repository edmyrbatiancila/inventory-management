import { motion } from "framer-motion";
import { Mail, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from '@inertiajs/react';
import { useForgotPasswordForm } from '@/hooks/forgotPassword/submit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import InputError from '@/Components/InputError';
import { fadeInUp } from '@/utils/welcome/animationVariants';

interface IForgotPasswordCardProps {
    status?: string;
}

const ForgotPasswordCard = ({
    status
}: IForgotPasswordCardProps) => {
    const { data, setData, errors, processing, submit } = useForgotPasswordForm();

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Forgot your password? No problem. Enter your email address and we'll send you a password reset link to help you regain access to your account.
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
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                                <Input 
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-12 pl-10 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 focus:border-slate-500 dark:focus:border-slate-400"
                                    placeholder="Enter your email address"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending Reset Link...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Password Reset Link
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
                                    Remember your password?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-4 transition-colors group"
                            >
                                <ArrowLeft className="h-3 w-3 mr-1 transition-transform group-hover:-translate-x-0.5" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default ForgotPasswordCard;