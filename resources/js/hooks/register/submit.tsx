import { useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

// Custom hook for register form
export const useRegisterForm = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
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