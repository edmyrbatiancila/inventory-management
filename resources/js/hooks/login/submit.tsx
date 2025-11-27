import { useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

// Custom hook for login form
export const useLoginForm = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
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