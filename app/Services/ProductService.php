<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductService
{
    protected ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Get all products with filtering and pagination
     */
    public function getAllProducts(array $filters = []): LengthAwarePaginator
    {
        // Add default filters
        $filters = array_merge([
            'per_page' => 15,
            'is_active' => true
        ], $filters);

        return $this->productRepository->findAll($filters);
    }

    /**
     * Get a single product by ID with full details
     */
    public function getProductById(int $id): ?Product
    {
        return $this->productRepository->findWithInventory($id);
    }

    /**
     * Create a new product with validation
     */
    public function createProduct(array $data): Product
    {
        // Validate required fields
        $this->validateProductData($data);

        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        // Generate SKU if not provided
        if (empty($data['sku'])) {
            $data['sku'] = $this->generateUniqueSku();
        }

        // Set default values
        $data = $this->setDefaultValues($data);

        return DB::transaction(function () use ($data) {
            return $this->productRepository->create($data);
        });
    }

    /**
     * Update an existing product
     */
    public function updateProduct(int $id, array $data): bool
    {
        $product = $this->productRepository->findById($id);
        
        if (!$product) {
            throw new ModelNotFoundException('Product not found');
        }

        // Validate data for update
        $this->validateProductData($data, $id);

        // Update slug if name changed
        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $id);
        }

        return DB::transaction(function () use ($id, $data) {
            return $this->productRepository->update($id, $data);
        });
    }

    /**
     * Soft delete a product
     */
    public function deleteProduct(int $id): bool
    {
        $product = $this->productRepository->findById($id);
        
        if (!$product) {
            throw new ModelNotFoundException('Product not found');
        }

        // Check if product has inventory
        if ($this->hasActiveInventory($id)) {
            throw new ValidationException('Cannot delete product with active inventory');
        }

        return $this->productRepository->delete($id);
    }

    /**
     * Get products by category
     */
    public function getProductsByCategory(int $categoryId): Collection
    {
        return $this->productRepository->findByCategory($categoryId);
    }

    /**
     * Get products by brand
     */
    public function getProductsByBrand(int $brandId): Collection
    {
        return $this->productRepository->findByBrand($brandId);
    }

    /**
     * Get products with low stock levels
     */
    public function getLowStockProducts(): Collection
    {
        return $this->productRepository->findLowStock();
    }

    /**
     * Search products by query
     */
    public function searchProducts(string $query): Collection
    {
        return $this->productRepository->searchProducts($query);
    }

    /**
     * Get products needing reorder
     */
    public function getProductsNeedingReorder(): Collection
    {
        return $this->productRepository->findNeedingReorder();
    }

    /**
     * Get product stock summary across all warehouses
     */
    public function getProductStockSummary(int $productId): array
    {
        $product = $this->productRepository->findWithInventory($productId);
        
        if (!$product) {
            throw new ModelNotFoundException('Product not found');
        }

        $totalStock = $product->inventories->sum('quantity_on_hand');
        $totalReserved = $product->inventories->sum('quantity_reserved');
        $totalAvailable = $product->inventories->sum('quantity_available');

        return [
            'product_id' => $productId,
            'product_name' => $product->name,
            'total_stock' => $totalStock,
            'total_reserved' => $totalReserved,
            'total_available' => $totalAvailable,
            'min_stock_level' => $product->min_stock_level,
            'max_stock_level' => $product->max_stock_level,
            'is_low_stock' => $totalAvailable <= $product->min_stock_level,
            'locations' => $product->inventories->map(function ($inventory) {
                return [
                    'warehouse_id' => $inventory->warehouse_id,
                    'warehouse_name' => $inventory->warehouse->name,
                    'quantity_on_hand' => $inventory->quantity_on_hand,
                    'quantity_reserved' => $inventory->quantity_reserved,
                    'quantity_available' => $inventory->quantity_available,
                    'is_low_stock' => $inventory->quantity_available <= $inventory->product->min_stock_level
                ];
            })
        ];
    }

    /**
     * Check if product is available in sufficient quantity
     */
    public function checkAvailability(int $productId, int $requestedQuantity, int $warehouseId = null): array
    {
        $product = $this->productRepository->findWithInventory($productId);
        
        if (!$product) {
            return [
                'available' => false,
                'message' => 'Product not found'
            ];
        }

        if (!$product->track_quantity) {
            return [
                'available' => true,
                'message' => 'Product does not require quantity tracking'
            ];
        }

        $inventories = $warehouseId 
            ? $product->inventories->where('warehouse_id', $warehouseId)
            : $product->inventories;

        $totalAvailable = $inventories->sum('quantity_available');

        if ($totalAvailable >= $requestedQuantity) {
            return [
                'available' => true,
                'available_quantity' => $totalAvailable,
                'requested_quantity' => $requestedQuantity,
                'message' => 'Product is available'
            ];
        }

        return [
            'available' => false,
            'available_quantity' => $totalAvailable,
            'requested_quantity' => $requestedQuantity,
            'shortage' => $requestedQuantity - $totalAvailable,
            'message' => "Insufficient stock. Available: {$totalAvailable}, Requested: {$requestedQuantity}"
        ];
    }

    /**
     * Get inventory analytics for a product
     */
    public function getInventoryAnalytics(int $productId): array
    {
        $product = $this->productRepository->findWithInventory($productId);
        
        if (!$product) {
            throw new ModelNotFoundException('Product not found');
        }

        $totalStock = $product->inventories->sum('quantity_on_hand');
        $totalReserved = $product->inventories->sum('quantity_reserved');
        $totalAvailable = $product->inventories->sum('quantity_available');

        // Get recent movements for trend analysis
        $recentMovements = $product->inventoryMovements()
            ->where('movement_date', '>=', now()->subDays(30))
            ->orderBy('movement_date', 'desc')
            ->get();

        $stockIn = $recentMovements->where('type', 'in')->sum('quantity');
        $stockOut = $recentMovements->whereIn('type', ['out', 'transfer'])->sum('quantity');
        $adjustments = $recentMovements->where('type', 'adjustment')->sum('quantity');

        return [
            'product_id' => $productId,
            'current_stock' => [
                'total_on_hand' => $totalStock,
                'total_reserved' => $totalReserved,
                'total_available' => $totalAvailable,
                'stock_value' => $totalStock * $product->cost_price
            ],
            'stock_levels' => [
                'min_level' => $product->min_stock_level,
                'max_level' => $product->max_stock_level,
                'reorder_needed' => $totalAvailable <= $product->min_stock_level,
                'overstock' => $product->max_stock_level ? $totalStock > $product->max_stock_level : false
            ],
            'recent_activity' => [
                'stock_in' => $stockIn,
                'stock_out' => abs($stockOut),
                'adjustments' => $adjustments,
                'net_movement' => $stockIn + $stockOut + $adjustments,
                'movement_count' => $recentMovements->count()
            ],
            'locations' => $product->inventories->count(),
            'last_movement' => $recentMovements->first()?->movement_date
        ];
    }

    /**
     * Validate product data
     */
    protected function validateProductData(array $data, int $excludeId = null): void
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'min_stock_level' => 'integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0'
        ];

        // Add unique validation for SKU and slug if provided
        if (isset($data['sku'])) {
            $rules['sku'] = 'required|string|unique:products,sku' . ($excludeId ? ",{$excludeId}" : '');
        }

        if (isset($data['slug'])) {
            $rules['slug'] = 'required|string|unique:products,slug' . ($excludeId ? ",{$excludeId}" : '');
        }

        if (isset($data['barcode']) && $data['barcode']) {
            $rules['barcode'] = 'string|unique:products,barcode' . ($excludeId ? ",{$excludeId}" : '');
        }

        // Validate max stock level is greater than min stock level
        if (isset($data['max_stock_level']) && isset($data['min_stock_level'])) {
            if ($data['max_stock_level'] <= $data['min_stock_level']) {
                throw ValidationException::withMessages([
                    'max_stock_level' => 'Maximum stock level must be greater than minimum stock level'
                ]);
            }
        }

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Generate unique slug for product
     */
    protected function generateUniqueSlug(string $name, int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while ($this->slugExists($slug, $excludeId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if slug exists
     */
    protected function slugExists(string $slug, int $excludeId = null): bool
    {
        $query = Product::where('slug', $slug);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Generate unique SKU
     */
    protected function generateUniqueSku(): string
    {
        do {
            $sku = 'PRD-' . strtoupper(Str::random(3)) . '-' . rand(100, 999);
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Set default values for product data
     */
    protected function setDefaultValues(array $data): array
    {
        return array_merge([
            'is_active' => true,
            'track_quantity' => true,
            'min_stock_level' => 0,
            'cost_price' => $data['price'] * 0.7 // Default cost price 70% of selling price
        ], $data);
    }

    /**
     * Check if product has active inventory
     */
    protected function hasActiveInventory(int $productId): bool
    {
        return Product::where('id', $productId)
            ->whereHas('inventories', function ($query) {
                $query->where('quantity_on_hand', '>', 0)
                    ->orWhere('quantity_reserved', '>', 0);
            })
            ->exists();
    }
}