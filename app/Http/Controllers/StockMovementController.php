<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Http\Requests\StoreStockMovementRequest;
use App\Http\Requests\UpdateStockMovementRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    protected StockMovementService $stockMovementService;

    public function __construct(StockMovementService $stockMovementService)
    {
        $this->stockMovementService = $stockMovementService;
    }


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = $request->only([
                'search', 'movement_types', 'status', 'product_id', 'warehouse_id',
                'user_id', 'date_from', 'date_to', 'quantity_min', 'quantity_max',
                'value_min', 'value_max', 'sort', 'per_page'
            ]);

            $movements = $this->stockMovementService->getAllMovements($filters);
            $searchStats = null;

            // Calculate search stats if filters are applied
            $hasFilters = !empty(array_filter($filters, function($value, $key) {
                return !in_array($key, ['per_page', 'sort']) && $value !== null && $value !== '';
            }, ARRAY_FILTER_USE_BOTH));

            if ($hasFilters) {
                $searchStats = $this->stockMovementService->getSearchStats($filters);
            }

            // Get analytics for dashboard
            $analytics = $this->stockMovementService->getMovementAnalytics();

            // Get filter options
            $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();
            $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();

            return Inertia::render('admin/stock-movement/Index', [
                'movements' => $movements,
                'searchStats' => $searchStats,
                'analytics' => $analytics,
                'products' => $products,
                'warehouses' => $warehouses,
                'currentFilters' => $filters
            ]);

        } catch (\Exception $e) {
            Log::error('StockMovementController@index - Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('admin/stock-movement/Index', [
                'movements' => collect([]),
                'error' => 'Failed to load stock movements. Please try again.'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStockMovementRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): Response
    {
        $movement = $this->stockMovementService->getMovementById($id);

        if (!$movement) {
            abort(404, 'Stock movement not found');
        }

        return Inertia::render('admin/stock-movement/Show', [
            'movement' => $movement
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StockMovement $stockMovement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStockMovementRequest $request, StockMovement $stockMovement)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockMovement $stockMovement)
    {
        //
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        try {
            $this->stockMovementService->approveMovement($id);

            return redirect()->back()->with('success', 'Stock movement approved successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to approve movement: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $this->stockMovementService->rejectMovement($id, $request->reason);

            return redirect()->back()->with('success', 'Stock movement rejected.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reject movement: ' . $e->getMessage());
        }
    }

    public function analytics(): JsonResponse
    {
        try {
            $analytics = $this->stockMovementService->getMovementAnalytics();
            return response()->json($analytics);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load analytics'], 500);
        }
    }
}
