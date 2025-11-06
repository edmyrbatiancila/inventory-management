<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Repositories\ProductRepository;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    protected ProductService $productService;
    protected ProductRepository $productRepository;

    public function __construct(ProductService $productService, ProductRepository $productRepository)
    {
        $this->productService = $productService;
        $this->productRepository = $productRepository;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $startTime = microtime(true);

        $filters = $request->only([
            'search', 'category_id', 'brand_id', 'is_active', 'per_page',
            'global_search', 'name', 'sku', 'description', 'barcode',
            'categories', 'brands', 'price_min', 'price_max',
            'cost_price_min', 'cost_price_max', 'min_stock_min', 'min_stock_max',
            'is_active', 'track_quantity', 'created_after', 'created_before',
            'has_inventory', 'is_low_stock', 'is_out_of_stock',
            'sort', 'per_page'
        ]);
        
        try {
            $products = $this->productService->getAllProducts($filters);
            
            // Only calculate search stats if we have active filters (to improve performance)
            $searchStats = null;
            if (!empty(array_filter($filters))) {
                $searchStats = $this->productRepository->getSearchStats($filters);
                $searchTime = round((microtime(true) - $startTime) * 1000, 2);
                $searchStats['searchTime'] = $searchTime;
            }

            $categories = $this->productService->getAllCategories();
            $brands = $this->productService->getAllBrands();

            // Debug logging
            Log::info('ProductController@index - Data check:', [
                'products_count' => $products?->total() ?? 0,
                'categories_count' => $categories?->count() ?? 0,
                'brands_count' => $brands?->count() ?? 0,
                'filters' => $filters
            ]);

            return Inertia::render('admin/product/Index', [
                'products' => $products,
                'categories' => $categories,
                'brands' => $brands,
                'searchStats' => $searchStats,
                'currentFilters' => $filters
            ]);
        } catch (\Exception $e) {
            Log::error('ProductController@index - Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return empty data to prevent crashes
            return Inertia::render('admin/product/Index', [
                'products' => new LengthAwarePaginator([], 0, 15),
                'categories' => [],
                'brands' => [],
                'searchStats' => ['totalResults' => 0, 'statusCounts' => [], 'priceRanges' => []],
                'currentFilters' => [],
                'error' => 'Failed to load products. Please try again.'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        try {
            $categories = Category::select('id', 'name')->orderBy('name')->get();
            $brands = Brand::select('id', 'name')->where('is_active', true)->orderBy('name')->get();

            return Inertia::render('admin/product/Create', [
                'categories' => $categories,
                'brands' => $brands
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load product creation page: ' . $e->getMessage());

            return Inertia::render('admin/product/Create', [
                'categories' => collect(),
                'brands' => collect(),
                'error' => 'Failed to load product creation page.'
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        try {
            $product = $this->productService->createProduct($request->validated());

            return redirect()
                ->route('admin.products.index')
                ->with('success', 'Product created successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to create product: ' . $e->getMessage());
            
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): Response
    {
        try {
            $product = $this->productService->getProductById($id);

            if (!$product) {
                abort(404, 'Product not found');
            }

            // Get additional data for the product details
            $stockSummary = $this->productService->getProductStockSummary($id);
            $analytics = $this->productService->getInventoryAnalytics($id);

            return Inertia::render('admin/product/View', [
                'product' => $product,
                'stockSummary' => $stockSummary,
                'analytics' => $analytics
            ]);

        } catch (\Exception $e) {
            abort(404, 'Product not found');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id): Response
    {
        try {
            $product = $this->productService->getProductById($id);

            if (!$product) {
                abort(404, 'Product not found');
            }

            $categories = \App\Models\Category::select('id', 'name')->orderBy('name')->get();
            $brands = \App\Models\Brand::select('id', 'name')->where('is_active', true)->orderBy('name')->get();

            return Inertia::render('admin/product/Edit', [
                'product' => $product,
                'categories' => $categories,
                'brands' => $brands
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load product edit page: ' . $e->getMessage());
            abort(404, 'Product not found');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, int $id): RedirectResponse
    {
        try {
            $updated = $this->productService->updateProduct($id, $request->validated());

            if (!$updated) {
                Log::error('Failed to update product with ID: ' . $id);
                return redirect()
                    ->back()
                    ->withInput()
                    ->with('error', 'Failed to update product');
            }

            return redirect()
                ->route('admin.products.index')
                ->with('success', 'Product updated successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to update product: ' . $e->getMessage());
            
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update product: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $deleted = $this->productService->deleteProduct($id);

            if (!$deleted) {
                return redirect()
                    ->back()
                    ->with('error', 'Failed to delete product');
            }

            return redirect()
                ->route('admin.products.index')
                ->with('success', 'Product deleted successfully!');
                
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Product not found for deletion: ' . $e->getMessage());
            
            return redirect()
                ->back()
                ->with('error', 'Product not found');
                
        } catch (\Exception $e) {
            Log::error('Failed to delete product: ' . $e->getMessage());
            
            return redirect()
                ->route('admin.products.index')
                ->with('error', 'Failed to delete product: ' . $e->getMessage());
        }
    }

    /**
     * Get products with low stock
     */
    public function lowStock(): Response
    {
        $products = $this->productService->getLowStockProducts();

        return Inertia::render('Products/LowStock', [
            'products' => $products
        ]);
    }

    /**
     * Get products needing reorder
     */
    public function needingReorder(): Response
    {
        $products = $this->productService->getProductsNeedingReorder();

        return Inertia::render('Products/NeedingReorder', [
            'products' => $products
        ]);
    }

    /**
     * Check product availability
     */
    public function checkAvailability(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'warehouse_id' => 'nullable|integer|exists:warehouses,id'
        ]);

        $availability = $this->productService->checkAvailability(
            $id,
            $request->quantity,
            $request->warehouse_id
        );

        return response()->json($availability);
    }

    /**
     * Search products
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $products = $this->productService->searchProducts($request->input('query'));

        return response()->json([
            'products' => $products
        ]);
    }
}
