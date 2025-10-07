import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Barcode } from "lucide-react";

const ProductCreate = () => {
    return (
        <Authenticated
            header={
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100">
                        <Barcode className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create Product</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new product to your inventory</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Product" />
        </Authenticated>
    );
}

export default ProductCreate;