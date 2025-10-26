<?php

namespace App\Http\Controllers;

use App\Models\StockAdjustment;
use App\Http\Requests\StoreStockAdjustmentRequest;
use App\Http\Requests\UpdateStockAdjustmentRequest;
use App\Models\Inventory;
use App\Services\StockAdjustmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    protected StockAdjustmentService $stockAdjustmentService;

    public function __construct(StockAdjustmentService $stockAdjustmentService)
    {
        $this->stockAdjustmentService = $stockAdjustmentService;
    }

    /**
     * Display a listing of stock adjustments.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $filters = $request->only([
                'search',
                'inventory_id',
                'adjustment_type',
                'adjusted_by',
                'date_from',
                'date_to',
                'sort',
                'per_page'
            ]);

            // Clean up filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $stockAdjustments = $this->stockAdjustmentService->getAllStockAdjustments($filters);
            $analytics = $this->stockAdjustmentService->getAdjustmentAnalytics();

            return Inertia::render('admin/stock-adjustments/Index', [
                'stockAdjustments' => $stockAdjustments,
                'analytics' => $analytics,
                'filters' => $filters,
                'sort' => $request->get('sort', 'newest')
            ]);

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@index: ' . $e->getMessage());
        
            return redirect()->back()
                ->with('error', 'Error loading stock adjustments.');
        }
    }

    /**
     * Show the form for creating a new stock adjustment.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $inventories = Inventory::with(['product', 'warehouse'])
                ->whereHas('product', function($query) {
                    $query->where('is_active', true);
                })
                ->whereHas('warehouse', function($query) {
                    $query->where('is_active', true);
                })
                ->get();

            $reasons = $this->stockAdjustmentService->getAdjustmentReasons();

            return Inertia::render('admin/stock-adjustments/Create', [
                'inventories' => $inventories,
                'reasons' => $reasons
            ]);

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@create: ' . $e->getMessage());
        
            return redirect()->route('admin.stock-adjustments.index')
                ->with('error', 'Error loading create form.');
        }
    }

    /**
     * Store a newly created stock adjustment.
     */
    public function store(StoreStockAdjustmentRequest $request): RedirectResponse
    {
        try {
            $stockAdjustment = $this->stockAdjustmentService->createStockAdjustment($request->validated());

            return redirect()->route('admin.stock-adjustments.show', $stockAdjustment->id)
                ->with('success', 'Stock adjustment created successfully.');

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@store: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Error creating stock adjustment: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified stock adjustment.
     */
    public function show(StockAdjustment $stockAdjustment): Response|RedirectResponse
    {
        try {
            $stockAdjustment->load(['inventory.product', 'inventory.warehouse', 'adjustedBy']);
            $relatedAdjustments = $this->stockAdjustmentService->getAdjustmentsForInventory($stockAdjustment->inventory_id);

            return Inertia::render('admin/stock-adjustments/View', [
                'stockAdjustment' => $stockAdjustment,
                'relatedAdjustments' => $relatedAdjustments->where('id', '!=', $stockAdjustment->id)->take(5)
            ]);

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@show: ' . $e->getMessage());
        
            return redirect()->route('admin.stock-adjustments.index')
                ->with('error', 'Error loading stock adjustment details.');
        }
    }

    /**
     * Show the form for editing the specified stock adjustment.
     */
    public function edit(StockAdjustment $stockAdjustment): Response|RedirectResponse
    {
        try {
            $stockAdjustment->load(['inventory.product', 'inventory.warehouse', 'adjustedBy']);

            return Inertia::render('admin/stock-adjustments/Edit', [
                'stockAdjustment' => $stockAdjustment
            ]);

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@edit: ' . $e->getMessage());
        
            return redirect()->route('admin.stock-adjustments.index')
                ->with('error', 'Error loading edit form.');
        }
    }

    /**
     * Update the specified stock adjustment (notes only).
     */
    public function update(UpdateStockAdjustmentRequest $request, StockAdjustment $stockAdjustment): RedirectResponse
    {
        try {
            $stockAdjustment->update($request->validated());

            return redirect()->route('admin.stock-adjustments.show', $stockAdjustment->id)
                ->with('success', 'Stock adjustment updated successfully.');

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@update: ' . $e->getMessage());
        
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating stock adjustment: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified stock adjustment (soft delete only).
     */
    public function destroy(StockAdjustment $stockAdjustment): RedirectResponse
    {
        try {
            // Note: We only soft delete for audit trail purposes
            // Actual inventory quantities should not be reversed automatically
            $stockAdjustment->delete();
            
            return redirect()->route('admin.stock-adjustments.index')
                ->with('success', 'Stock adjustment record deleted successfully.');
                
        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@destroy: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Error deleting stock adjustment: ' . $e->getMessage());
        }
    }

    /**
     * Get stock adjustments for specific inventory (API endpoint)
     */
    public function getByInventory(int $inventoryId): JsonResponse
    {
        try {
            $adjustments = $this->stockAdjustmentService->getAdjustmentsForInventory($inventoryId);

            return response()->json([
                'success' => true,
                'data' => $adjustments
            ]);

        } catch (\Exception $e) {
            Log::error('Error in StockAdjustmentController@getByInventory: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching adjustments: ' . $e->getMessage()
            ], 500);
        }
    }
}
