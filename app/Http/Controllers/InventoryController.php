<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display a listing of the inventories.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        try {
            $filters = $request->only([
                'search',
                'product_id',
                'warehouse_id',
                'low_stock',
                'out_of_stock',
                'sort',
                'per_page'
            ]);

            // Clean up filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $inventories = $this->inventoryService->getAllInventories($filters);

            return Inertia::render('admin/inventory/Index', [
                'inventories' => $inventories,
                'filters' => $filters,
                'sort' => $request->get('sort', 'newest')
            ]);

        } catch (\Exception $e) {
            Log::error('Error in InventoryController@index: ' . $e->getMessage());
        
            return redirect()->back()
                ->with('error', 'Error loading inventories.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $products = Product::where('is_active', true)
                ->where('track_quantity', true)
                ->with(['category', 'brand'])
                ->orderBy('name')
                ->get();
        
            $warehouses = Warehouse::where('is_active', true)
                ->orderBy('name')
                ->get();

            return Inertia::render('admin/inventory/Create', [
                'products' => $products,
                'warehouses' => $warehouses
            ]);

        } catch (\Exception $e) {
            Log::error('Error in InventoryController@create: ' . $e->getMessage());
        
            return redirect()->route('admin.inventories.index')
                ->with('error', 'Error loading create form.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryRequest $request): RedirectResponse
    {
        try {
            $inventory = $this->inventoryService->createInventory($request->validated());

            return redirect()->route('admin.inventories.edit', $inventory->id)
                ->with('success', 'Inventory created successfully.');

        } catch (\Exception $e) {
            Log::error('Error in InventoryController@store: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Error creating inventory: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory): Response|RedirectResponse
    {
        try {
            $inventory->load(['product.category', 'product.brand', 'warehouse']);

            // Calculate analytics
            $analytics = [
                'inventory_id' => $inventory->id,
                'stock_status' => $this->getStockStatus($inventory),
                'stock_percentage' => $this->calculateStockPercentage($inventory),
                'reorder_suggested' => $inventory->isLowStock(),
                'stock_value' => $inventory->quantity_on_hand * ($inventory->product->cost_price ?? $inventory->product->price),
            ];

            // Add stock status to inventory
            $inventory->is_low_stock = $inventory->isLowStock();
            $inventory->stock_status = $analytics['stock_status'];
        
            return Inertia::render('admin/inventory/View', [
                'inventory' => $inventory,
                'analytics' => $analytics
            ]);

        } catch (\Exception $e) {
            Log::error('Error in InventoryController@show: ' . $e->getMessage());
        
            return redirect()->route('admin.inventories.index')
                ->with('error', 'Error loading inventory details.');
        }
    }

    /**
     * Get stock status for analytics
     */
    private function getStockStatus(Inventory $inventory): string
    {
        if ($inventory->quantity_available <= 0) {
            return 'out_of_stock';
        }
        
        if ($inventory->quantity_available <= $inventory->product->min_stock_level * 0.5) {
            return 'critical';
        }
        
        if ($inventory->isLowStock()) {
            return 'low';
        }
        
        return 'healthy';
    }

    /**
     * Calculate stock percentage based on min/max levels
     */
    private function calculateStockPercentage(Inventory $inventory): float
    {
        $maxLevel = $inventory->product->max_stock_level ?? ($inventory->product->min_stock_level * 5);
        
        if ($maxLevel <= 0) {
            return 100.0;
        }
        
        return min(100, ($inventory->quantity_available / $maxLevel) * 100);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory): Response|RedirectResponse
    {
        try {
            $inventory->load(['product.category', 'product.brand', 'warehouse']);
        
            $products = Product::where('is_active', true)
                ->where('track_quantity', true)
                ->with(['category', 'brand'])
                ->orderBy('name')
                ->get();
            
            $warehouses = Warehouse::where('is_active', true)
                ->orderBy('name')
                ->get();

            return Inertia::render('admin/inventory/Edit', [
                'inventory' => $inventory,
                'products' => $products,
                'warehouses' => $warehouses
            ]);

        } catch (\Exception $e) {
            Log::error('Error in InventoryController@edit: ' . $e->getMessage());
        
            return redirect()->route('admin.inventories.index')
                ->with('error', 'Error loading edit form.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory): RedirectResponse
    {
        try {
            $updated = $this->inventoryService->updateInventory($inventory->id, $request->validated());
        
            if ($updated) {
                return redirect()->route('admin.inventories.edit', $inventory->id)
                    ->with('success', 'Inventory updated successfully.');
            }
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update inventory.');

        } catch (\Exception $e) {
            Log::error('Error in InventoryController@update: ' . $e->getMessage());
        
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating inventory: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory): RedirectResponse
    {
        try {
            // Check if inventory has reserved quantities before attempting deletion
            if ($inventory->quantity_reserved > 0) {
                return redirect()->back()
                    ->with('error', 'Cannot delete inventory with reserved quantities. Please release all reserved quantities first.');
            }
            
            $deleted = $this->inventoryService->deleteInventory($inventory->id);
            
            if ($deleted) {
                return redirect()->route('admin.inventories.index')
                    ->with('success', 'Inventory deleted successfully.');
            }
            
            return redirect()->back()
                ->with('error', 'Failed to delete inventory.');
                
        } catch (\Exception $e) {
            Log::error('Error in InventoryController@destroy: ' . $e->getMessage());
            
            return redirect()->back()
                ->with('error', 'Error deleting inventory: ' . $e->getMessage());
        }
    }
}
