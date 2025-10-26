<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Services\WarehouseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    protected WarehouseService $warehouseService;

    public function __construct(WarehouseService $warehouseService)
    {
        $this->warehouseService = $warehouseService;
    }

    /**
     * Display a listing of the warehouses.
     */
    public function index(Request $request): Response
    {
        try {
            $filters = [
                'search' => $request->input('search'),
                'is_active' => $request->input('is_active'),
                'city' => $request->input('city'),
                'country' => $request->input('country'),
                'sort' => $request->input('sort', 'newest'),
                'per_page' => $request->input('per_page', 15)
            ];

            $warehouses = $this->warehouseService->getAllWarehouses($filters);

            $warehouses->getCollection()->transform(function ($warehouse) {
                $warehouse->full_address = $warehouse->getFullAddressAttribute();
                return $warehouse;
            });

            return Inertia::render('admin/warehouse/Index', [
                'warehouses'=> $warehouses,
                'filters' => $filters,
                'success' => session('success'),
                'error' => session('error')
            ]);

        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@index: ' . $e->getMessage());

            return Inertia::render('admin/warehouse/Index', [
                'warehouses' => collect([]),
                'filters' => [],
                'error' => 'Error loading warehouses. Please try again.'
            ]);
        }
    }

    /**
     * Show the form for creating a new warehouse.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            return Inertia::render('admin/warehouse/Create');
        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@create: ' . $e->getMessage());

            return redirect()->route('admin.warehouses.index')
                ->with('error', 'Error loading create form.');
        }
    }

    /**
     * Store a newly created warehouse.
     */
    public function store(StoreWarehouseRequest $request): RedirectResponse
    {
        try {
            $warehouse = $this->warehouseService->createWarehouse($request->validated());

            return redirect()->route('admin.warehouses.edit', $warehouse->id)
                ->with('success', 'Warehouse created successfully.');

        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@store: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Error creating warehouse: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified warehouse.
     */
    public function show(int $id): Response|RedirectResponse
    {
        try {
            $warehouse = $this->warehouseService->getWarehouseWithInventories($id);

            if (!$warehouse) {
                return redirect()->route('admin.warehouses.index')
                    ->with('error', 'Warehouse not found.');
            }

            $analytics = $this->warehouseService->getWarehouseAnalytics($id);

            $warehouse->full_address = $warehouse->getFullAddressAttribute();

            return Inertia::render('admin/warehouse/View', [
                'warehouse' => $warehouse,
                'analytics' => $analytics
            ]);
        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@show: ' . $e->getMessage());

            return redirect()->route('admin.warehouses.index')
                ->with('error', 'Error loading warehouse details.');
        }
    }

    /**
     * Show the form for editing the specified warehouse.
     */
    public function edit(int $id): Response|RedirectResponse
    {
        try {
            $warehouse = $this->warehouseService->getWarehouseById($id);

            if (!$warehouse) {
                return redirect()->route('admin.warehouses.index')
                    ->with('error', 'Warehouse not found.');
            }

            return Inertia::render('admin/warehouse/Edit', [
                'warehouse' => $warehouse
            ]);
        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@edit: ' . $e->getMessage());

            return redirect()->route('admin.warehouses.index')
                ->with('error', 'Error loading edit form.');
        }
    }

    /**
     * Update the specified warehouse.
     */
    public function update(UpdateWarehouseRequest $request, int $id): RedirectResponse
    {
        try {
            $result = $this->warehouseService->updateWarehouse($id, $request->validated());

            if (!$result) {
                return redirect()->back()
                    ->withInput()
                    ->with('error', 'Failed to update warehouse.');
            }

            return redirect()->route('admin.warehouses.edit', $id)
                ->with('success', 'Warehouse updated successfully.');

        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@update: ' . $e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating warehouse: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified warehouse.
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            $result = $this->warehouseService->deleteWarehouse($id);

            if (!$result) {
                return redirect()->route('admin.warehouses.index')
                    ->with('error', 'Failed to delete warehouse. It may be in use.');
            }

            return redirect()->route('admin.warehouses.index')
                ->with('success', 'Warehouse deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@destroy: ' . $e->getMessage());

            return redirect()->route('admin.warehouses.index')
                ->with('error', 'Error deleting warehouse: ' . $e->getMessage());

        }
    }

    /**
     * Get warehouse analytics (API endpoint)
     */
    public function analytics(int $id): JsonResponse
    {
        try {
            $analytics = $this->warehouseService->getWarehouseAnalytics($id);

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            Log::error('Error in WarehouseController@analytics: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching warehouse analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}
