<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Requests\UpdateStockTransferRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Inventory;
use App\Services\StockTransferService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Exception;

class StockTransferController extends Controller
{
    public function __construct(
        private StockTransferService $stockTransferService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only([
            'status', 
            'warehouse_id', 
            'product_id', 
            'search', 
            'per_page',
            'sort'
        ]);

        // Clean up filters
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });

        $transfers = $this->stockTransferService->getAllStockTransfers($filters);

        return Inertia::render('admin/stock-transfers/Index', [
            'transfers' => $transfers,
            'filters' => $filters,
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'sort' => $request->get('sort', 'newest'),
            'products' => Product::select('id', 'name')->get(),
            'transferStatus' => $request->get('status', '')
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $warehouses = Warehouse::select(
            'id', 
            'name', 
            'code', 
            'city', 
            'is_active'
        )->get();

        $products = Product::with('category', 'brand')
                        ->select(
                            'id', 
                            'name', 
                            'category_id', 
                            'brand_id',
                            'is_active', 
                            'track_quantity', 
                            'sku',
                            'min_stock_level',
                        )->get();
        
        return Inertia::render('admin/stock-transfers/Create', [
            'warehouses' => $warehouses,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStockTransferRequest $request)
    {
        try {
            $transfer = $this->stockTransferService->initiateTransfer($request->validated());
            return redirect()
                ->route('admin.stock-transfers.show', $transfer)
                ->with('success', 'Stock transfer initiated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(StockTransfer $stockTransfer)
    {
        $stockTransfer->load(['fromWarehouse', 'toWarehouse', 'product', 'initiatedBy', 'approvedBy', 'completedBy']);

        return Inertia::render('admin/stock-transfers/View', [
            'transfer' => $stockTransfer,
            'canApprove' => $stockTransfer->canBeApproved(),
            'canMarkInTransit' => $stockTransfer->canBeMarkedInTransit(),
            'canComplete' => $stockTransfer->canBeCompleted(),
            'canCancel' => $stockTransfer->canBeCancelled(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StockTransfer $stockTransfer)
    {
        return Inertia::render('admin/stock-transfers/Edit', [
            'transfer' => $stockTransfer->load(['fromWarehouse', 'toWarehouse', 'product']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStockTransferRequest $request, StockTransfer $stockTransfer)
    {
        try {
            $data = $request->validated();
            
            if (isset($data['transfer_status'])) {
                switch ($data['transfer_status']) {
                    case StockTransfer::STATUS_APPROVED:
                        $stockTransfer = $this->stockTransferService->approveTransfer($stockTransfer->id, Auth::id());
                        break;
                    case StockTransfer::STATUS_IN_TRANSIT:
                        $stockTransfer = $this->stockTransferService->markInTransit($stockTransfer->id);
                        break;
                    case StockTransfer::STATUS_COMPLETED:
                        $stockTransfer = $this->stockTransferService->completeTransfer($stockTransfer->id, Auth::id());
                        break;
                    case StockTransfer::STATUS_CANCELLED:
                        $stockTransfer = $this->stockTransferService->cancelTransfer($stockTransfer->id, $data['cancellation_reason'] ?? 'Manual cancellation');
                        break;
                }
            }

            return redirect()
                ->route('admin.stock-transfers.show', $stockTransfer)
                ->with('success', 'Stock transfer updated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockTransfer $stockTransfer)
    {
        if (!$stockTransfer->canBeCancelled()) {
            return back()->withErrors(['error' => 'This transfer cannot be deleted.']);
        }

        try {
            $this->stockTransferService->cancelTransfer($stockTransfer->id, 'Transfer deleted');
            return redirect()->route('admin.stock-transfers.index')
                ->with('success', 'Stock transfer cancelled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Additional workflow methods
    public function approve(StockTransfer $stockTransfer)
    {
        try {
            $transfer = $this->stockTransferService->approveTransfer($stockTransfer->id, Auth::id());
            return redirect()->route('admin.stock-transfers.show', $transfer->id)
                ->with('success', 'Transfer approved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function markInTransit(StockTransfer $stockTransfer)
    {
        try {
            $transfer = $this->stockTransferService->markInTransit($stockTransfer->id);
            return redirect()->route('admin.stock-transfers.show', $transfer->id)
                ->with('success', 'Transfer marked as in transit.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function complete(StockTransfer $stockTransfer)
    {
        try {
            $transfer = $this->stockTransferService->completeTransfer($stockTransfer->id, Auth::id());
            return redirect()->route('admin.stock-transfers.show', $transfer->id)
                ->with('success', 'Transfer completed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Get products that have inventory in a specific warehouse
     */
    public function getProductsWithInventory(Request $request)
    {
        try {
            $warehouseId = $request->input('warehouse_id');

            if (!$warehouseId) {
                return response()->json([
                    'products' => [],
                    'message' => 'Warehouse ID is required'
                ], 400);
            }

            // Get products that have inventory in the specified warehouse
            $products = Product::with(['category', 'brand'])
                ->whereHas('inventories', function ($query) use ($warehouseId) {
                    $query->where('warehouse_id', $warehouseId)
                          ->where('quantity_available', '>', 0);
                })
                ->where('is_active', true)
                ->where('track_quantity', true)
                ->select('id', 'name', 'sku', 'category_id', 'brand_id')
                ->get();

            Log::info('📦 Products with inventory fetched', [
                'warehouse_id' => $warehouseId,
                'products_count' => $products->count(),
                'product_ids' => $products->pluck('id')->toArray()
            ]);

            return response()->json([
                'products' => $products,
                'message' => "Found {$products->count()} products with available inventory"
            ]);

        } catch (Exception $e) {
            Log::error('💥 getProductsWithInventory exception', [
                'error' => $e->getMessage(),
                'warehouse_id' => $request->input('warehouse_id')
            ]);

            return response()->json([
                'products' => [],
                'message' => 'Error fetching products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check inventory availability for a specific warehouse and product
     */
    public function checkInventoryAvailability(Request $request)
    {
        try {
            Log::info('🔍 Inventory availability check started', [
                'request_data' => $request->all(),
                'timestamp' => now(),
                'user_id' => Auth::id(),
            ]);

            $request->validate([
                'warehouse_id' => 'required|integer|exists:warehouses,id',
                'product_id' => 'required|integer|exists:products,id',
            ]);

            Log::info('✅ Validation passed', [
                'warehouse_id' => $request->warehouse_id,
                'product_id' => $request->product_id,
            ]);

            $inventory = Inventory::where('warehouse_id', $request->warehouse_id)
                ->where('product_id', $request->product_id)
                ->with(['warehouse:id,name', 'product:id,name,sku'])
                ->first();

            Log::info('📊 Database query completed', [
                'inventory_found' => $inventory ? 'yes' : 'no',
                'inventory_data' => $inventory ? [
                    'id' => $inventory->id,
                    'quantity_on_hand' => $inventory->quantity_on_hand,
                    'quantity_reserved' => $inventory->quantity_reserved,
                    'quantity_available' => $inventory->quantity_available,
                ] : null,
            ]);

            if (!$inventory) {
                Log::warning('❌ No inventory found', [
                    'warehouse_id' => $request->warehouse_id,
                    'product_id' => $request->product_id,
                ]);

                $response = [
                    'available_quantity' => 0,
                    'warehouse_name' => Warehouse::find($request->warehouse_id)?->name,
                    'product_name' => Product::find($request->product_id)?->name,
                    'has_inventory' => false,
                    'is_sufficient' => false,
                    'message' => 'No inventory record found for this product in the selected warehouse.',
                ];

                Log::info('📤 Sending no inventory response', $response);
                return response()->json($response);
            }

            $response = [
                'available_quantity' => $inventory->quantity_available,
                'quantity_on_hand' => $inventory->quantity_on_hand,
                'quantity_reserved' => $inventory->quantity_reserved,
                'warehouse_name' => $inventory->warehouse->name,
                'product_name' => $inventory->product->name,
                'product_sku' => $inventory->product->sku,
                'has_inventory' => true,
                'is_sufficient' => $inventory->quantity_available > 0,
                'message' => $inventory->quantity_available > 0 
                    ? "Available for transfer: {$inventory->quantity_available} units"
                    : 'No stock available for transfer in this warehouse.',
            ];

            Log::info('📤 Sending successful response', $response);
            return response()->json($response);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ Validation error in inventory check', [
                'error' => $e->getMessage(),
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'error' => 'Validation failed',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('💥 Exception in inventory availability check', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'error' => 'Failed to check inventory availability',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
