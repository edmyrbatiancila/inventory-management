<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category_id', 'brand_id', 'is_active', 'per_page']);
        
        $products = $this->productService->getAllProducts($filters);

        return Inertia::render('admin/product/Index', [
            'products' => $products,
            'filters' => $filters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        try {
            $product = $this->productService->createProduct($request->validated());

            return redirect()
                ->route('products.show', $product)
                ->with('success', 'Product created successfully!');

        } catch (\Exception $e) {
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

            return Inertia::render('Products/Show', [
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

            return Inertia::render('Products/Edit', [
                'product' => $product
            ]);

        } catch (\Exception $e) {
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
                return redirect()
                    ->back()
                    ->withInput()
                    ->with('error', 'Failed to update product');
            }

            return redirect()
                ->route('products.show', $id)
                ->with('success', 'Product updated successfully!');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update produc: ' . $e->getMessage());
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
                ->route('products.index')
                ->with('success', 'Product deleted successfully!');
        } catch (\Exception $e) {

            return redirect()
                ->back()
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
