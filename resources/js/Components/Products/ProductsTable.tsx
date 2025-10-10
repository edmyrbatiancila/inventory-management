import { PaginatedResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Product } from "@/types/Product/IProduct";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import ProductTableSkeleton from "./ProductTableSkeleton";
import EmptyState from "./EmptyState";

interface IProductsTableProps {
    products: PaginatedResponse<Product>;
    onHandleView: (productId: number) => void;
    onHandleEdit: (productId: number) => void;
    onHandleDelete: (productId: number) => void;
    isLoading?: boolean;
    currentFilters: { [key: string]: any };
    handleClearFilters: () => void;
    handleCreate: () => void;
}

const ProductsTable = ({ 
    products,
    onHandleView,
    onHandleEdit,
    onHandleDelete,
    isLoading,
    currentFilters,
    handleClearFilters,
    handleCreate
}: IProductsTableProps) => {

    if (isLoading) {
        return <ProductTableSkeleton />;
    }

    if (products.data.length === 0) {
        return <EmptyState 
            currentFilters={ currentFilters }
            onHandleClearFilters={ handleClearFilters }
            onHandleCreate={ handleCreate }
        />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Products ({products.total})</CardTitle>
                <CardDescription>
                    Showing {products.from} to {products.to} of {products.total} products
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {products.data.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage 
                                            src={ product.images?.[0] || '' }
                                            alt={ product.name }
                                        />
                                        <AvatarFallback>
                                            {product.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="font-mono text-sm">
                                { product.sku }
                            </TableCell>

                            <TableCell>
                                {product.category.name}
                            </TableCell>

                            <TableCell>
                                {product.brand.name}
                            </TableCell>

                            <TableCell className="font-medium">
                                ${product.price.toFixed(2)}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{ product.inventories_count }</span>
                                    {product.inventories_count <= product.min_stock_level && (
                                        <Badge variant="destructive" className="text-xs">
                                            Low Stock
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant={product.is_active ? "default" : "secondary"}
                                    className={product.is_active ? "bg-green-100 text-green-800" : ""}
                                >
                                    {product.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem 
                                            onClick={ () => onHandleView(product.id) }
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => onHandleEdit(product.id)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4" />
                                            Edit Product
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => onHandleDelete(product.id)}
                                            className="flex items-center gap-2 text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Product
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default ProductsTable;