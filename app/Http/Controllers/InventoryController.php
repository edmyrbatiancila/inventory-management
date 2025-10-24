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
    public function store(StoreInventoryRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        //
    }
}
