import { router } from "@inertiajs/react";
import { toast } from "sonner";

export const handleDeleteData = (warehouseId: number, routePath: string) => {
    router.delete(route(routePath, warehouseId), {
        preserveScroll: true,
        onSuccess: () => {
            // Success message will be handled by the flash message
        },
        onError: () => {
            toast.error('Failed to delete data', {
                description: 'The data could not be deleted. It may be in use.',
                duration: 4000,
            });
        }
    });
};