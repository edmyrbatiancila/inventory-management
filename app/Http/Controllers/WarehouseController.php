<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Http\Requests\WarehouseAdvancedSearchRequest;
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
                'per_page' => $request->input('per_page', 15),

                // Advanced search filters
                'globalSearch' => $request->get('globalSearch'),
                'name' => $request->get('name'),
                'code' => $request->get('code'),
                'address' => $request->get('address'),
                'state' => $request->get('state'),
                'postalCode' => $request->get('postalCode'),
                'phone' => $request->get('phone'),
                'email' => $request->get('email'),
                'isActive' => $request->get('isActive'),
                'createdAfter' => $request->get('createdAfter'),
                'createdBefore' => $request->get('createdBefore'),
                'updatedAfter' => $request->get('updatedAfter'),
                'updatedBefore' => $request->get('updatedBefore'),
                'recentlyUpdated' => $request->boolean('recentlyUpdated'),
                'newWarehouses' => $request->boolean('newWarehouses'),
            ];

            // Remove null/emppty values
            $filters = array_filter($filters, function ($value) {
                return $value !== null && $value !== '';
            });

            $warehouses = $this->warehouseService->getAllWarehouses($filters);

            // Get search statistics only if advanced filters are applied
            $searchStats = null;
            $hasAdvancedFilters = $this->hasAdvancedFilters($filters);

            if ($hasAdvancedFilters) {
                $searchStats = $this->warehouseService->getSearchStats($filters);
            }

            $warehouses->getCollection()->transform(function ($warehouse) {
                $warehouse->full_address = $warehouse->getFullAddressAttribute();
                return $warehouse;
            });

            return Inertia::render('admin/warehouse/Index', [
                'warehouses' => $warehouses,
                'sort' => $filters['sort'] ?? 'newest',
                'searchStats' => $searchStats,
                'hasAdvancedFilters' => $hasAdvancedFilters,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching warehouses: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('admin/warehouse/Index', [
                'warehouses' => collect(),
                'error' => 'Failed to load warehouses. Please try again.'
            ]);
        }
    }

    /**
     * Check if advanced filters are applied
     */
    private function hasAdvancedFilters(array $filters): bool
    {
        $advancedFilterKeys = [
            'globalSearch', 'name', 'code', 'address', 'state', 'postalCode',
            'phone', 'email', 'isActive', 'createdAfter', 'createdBefore',
            'updatedAfter', 'updatedBefore', 'recentlyUpdated', 'newWarehouses'
        ];

        foreach ($advancedFilterKeys as $key) {
            if (isset($filters[$key]) && $filters[$key] !== null && $filters[$key] !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * Advanced search endpoint (AJAX)
     */
    public function advancedSearch(WarehouseAdvancedSearchRequest $request): JsonResponse
    {
        try {
            $filters = $request->validated();
            
            // Remove null/empty values
            $filters = array_filter($filters, function ($value) {
                return $value !== null && $value !== '';
            });

            $warehouses = $this->warehouseService->getAllWarehouses($filters);
            $searchStats = $this->warehouseService->getSearchStats($filters);

            return response()->json([
                'success' => true,
                'data' => [
                    'warehouses' => $warehouses,
                    'searchStats' => $searchStats,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in warehouse advanced search: ' . $e->getMessage(), [
                'filters' => $request->all(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Advanced search failed. Please try again.',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
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
            $warehouse = $this->warehouseService->getWarehouseById($id);

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
