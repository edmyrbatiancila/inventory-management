<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockMovementAdvancedSearch;
use App\Models\StockMovement;
use App\Http\Requests\StoreStockMovementRequest;
use App\Http\Requests\UpdateStockMovementRequest;
use App\Models\Product;
use App\Models\User;
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
                'value_min', 'value_max', 'sort', 'per_page',
                // Advanced search filters
                'globalSearch', 'referenceNumber', 'reason', 'notes', 'productName',
                'productSku', 'warehouseName', 'userName', 'movementTypes', 'statuses',
                'productIds', 'warehouseIds', 'userIds', 'quantityMovedMin', 'quantityMovedMax',
                'quantityBeforeMin', 'quantityBeforeMax', 'quantityAfterMin', 'quantityAfterMax',
                'unitCostMin', 'unitCostMax', 'totalValueMin', 'totalValueMax',
                'createdAfter', 'createdBefore', 'approvedAfter', 'approvedBefore',
                'movementDirection', 'relatedDocumentTypes', 'myMovements', 'recentMovements',
                'pendingApproval', 'highValueMovements', 'hasApprover', 'hasDocumentReference'
            ]);

            $movements = $this->stockMovementService->getAllMovements($filters);
            $searchStats = null;
            $advancedSearchStats = null;

            // Calculate search stats if filters are applied
            $hasFilters = !empty(array_filter($filters, function($value, $key) {
                return !in_array($key, ['per_page', 'sort']) && $value !== null && $value !== '';
            }, ARRAY_FILTER_USE_BOTH));

            if ($hasFilters) {
                $searchStats = $this->stockMovementService->getSearchStats($filters);
            }

            // Check if advanced filters are being used
            $advancedFilterKeys = [
                'globalSearch', 'referenceNumber', 'reason', 'notes', 'productName',
                'productSku', 'warehouseName', 'userName', 'movementTypes', 'statuses',
                'productIds', 'warehouseIds', 'userIds', 'quantityMovedMin', 'quantityMovedMax',
                'totalValueMin', 'totalValueMax', 'createdAfter', 'createdBefore',
                'movementDirection', 'myMovements', 'pendingApproval', 'highValueMovements'
            ];

            $hasAdvancedFilters = !empty(array_intersect_key($filters, array_flip($advancedFilterKeys)));

            if ($hasAdvancedFilters) {
                $advancedSearchStats = $this->stockMovementService->getAdvancedSearchStats($filters);
            }

            // Get analytics for dashboard
            $analytics = $this->stockMovementService->getMovementAnalytics();

            // Get filter options
            $products = Product::select('id', 'name', 'sku')->orderBy('name')->get();
            $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
            $users = User::select('id', 'name')->orderBy('name')->get();

            return Inertia::render('admin/stock-movement/Index', [
                'movements' => $movements,
                'searchStats' => $searchStats,
                'advancedSearchStats' => $advancedSearchStats,
                'analytics' => $analytics,
                'products' => $products,
                'warehouses' => $warehouses,
                'users' => $users,
                'currentFilters' => $filters,
                'hasAdvancedFilters' => $hasAdvancedFilters
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

        return Inertia::render('admin/stock-movement/View', [
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

    /**
     * Handle advanced search for stock movements
     */
    public function advancedSearch(StockMovementAdvancedSearch $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            
            // Get movements with advanced filtering
            $movements = $this->stockMovementService->getAllMovements($filters);
            
            // Get search statistics
            $searchStats = $this->stockMovementService->getAdvancedSearchStats($filters);
            
            // Get filter options
            $filterOptions = $this->getFilterOptions();

            return response()->json([
                'movements' => $movements,
                'searchStats' => $searchStats,
                'filterOptions' => $filterOptions,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in StockMovementController@advancedSearch: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'An error occurred while performing the search.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get filter options for advanced search
     */
    private function getFilterOptions(): array
    {
        return [
            'movementTypes' => [
                'adjustment_increase' => 'Adjustment (Increase)',
                'adjustment_decrease' => 'Adjustment (Decrease)',
                'transfer_in' => 'Transfer In',
                'transfer_out' => 'Transfer Out',
                'purchase_receive' => 'Purchase Receive',
                'sale_fulfill' => 'Sale Fulfill',
                'return_customer' => 'Customer Return',
                'return_supplier' => 'Supplier Return',
                'damage_write_off' => 'Damage Write-off',
                'expiry_write_off' => 'Expiry Write-off',
            ],
            'statuses' => [
                'pending' => 'Pending',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'applied' => 'Applied',
            ],
            'movementDirections' => [
                'increase' => 'Stock Increase',
                'decrease' => 'Stock Decrease',
                'all' => 'All Movements',
            ],
            'relatedDocumentTypes' => [
                'adjustment' => 'Stock Adjustment',
                'transfer' => 'Stock Transfer',
                'purchase_order' => 'Purchase Order',
                'sale_order' => 'Sale Order',
                'return' => 'Return',
            ],
            'products' => Product::select('id', 'name', 'sku')->orderBy('name')->get(),
            'warehouses' => Warehouse::select('id', 'name')->orderBy('name')->get(),
            'users' => User::select('id', 'name', 'email')->orderBy('name')->get(),
        ];
    }
}
