import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Barcode } from "lucide-react";

const ProductIndex = () => {
    return (
        <Authenticated
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold leading-tight text-blue-800 tracking-tight flex items-center gap-2">
                        <Barcode className="w-7 h-7 text-blue-600" />
                        Product Management
                    </h2>
                </motion.div>
            }
        >
            <Head title="Product Management" />
        </Authenticated>
    );
}

export default ProductIndex;