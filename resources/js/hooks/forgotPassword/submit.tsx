import { useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

// Custom hook for forgot password form
export const useForgotPasswordForm = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        submit
    };
};