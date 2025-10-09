import { Search, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { on } from "events";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Brand, Category } from "@/types";
import { Button } from "../ui/button";

interface IProductsFilterSectionProps {
    onSearchInputRef: React.RefObject<HTMLInputElement>;
    onValue: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectValueCategory: string;
    onSelectChangeCategory: (value: string) => void;
    categories: Category[];
    onSelectValueBrand?: string;
    onSelectChangeBrand?: (value: string) => void;
    brands: Brand[];
    onSelectValueStatus?: string;
    onSelectChangeStatus?: (value: string) => void;
    onHandleClearFilters?: () => void;
}

const ProductsFilterSection = ({
    onSearchInputRef,
    onValue,
    onSearchChange,
    onSelectValueCategory,
    onSelectChangeCategory,
    categories,
    onSelectValueBrand,
    onSelectChangeBrand,
    brands,
    onSelectValueStatus,
    onSelectChangeStatus,
    onHandleClearFilters
}: IProductsFilterSectionProps) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg">
                    Search & Filters
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                                ref={ onSearchInputRef }
                                placeholder="Search products by name, SKU, or description..."
                                value={ onValue }
                                onChange={ onSearchChange }
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <Select
                        value={ onSelectValueCategory }
                        onValueChange={ onSelectChangeCategory }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Brand Filter */}
                    <Select
                        value={ onSelectValueBrand }
                        onValueChange={ onSelectChangeBrand }
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All Brands" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Brands</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select
                        value={onSelectValueStatus}
                        onValueChange={onSelectChangeStatus}
                    >
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear Filters Button */}
                    <Button
                        variant="outline"
                        onClick={ onHandleClearFilters }
                        className="flex items-center gap-2"
                    >
                        <XCircle className="w-4 h-4" />
                        Clear Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default ProductsFilterSection;