import { CheckCircle2, XCircle } from "lucide-react";

export const actionConfig = {
    approve: {
        title: 'Approve Transfers',
        description: 'Are you sure you want to approve the following transfers?',
        icon: CheckCircle2,
        buttonText: 'Approve All',
        buttonClass: 'bg-green-600 hover:bg-green-700',
    },
    cancel: {
        title: 'Cancel Transfers',
        description: 'Are you sure you want to cancel the following transfers?',
        icon: XCircle,
        buttonText: 'Cancel All',
        buttonClass: 'bg-red-600 hover:bg-red-700',
    },
};
