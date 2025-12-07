<?php

namespace App\Http\Controllers;

use App\Constants\SupplierConstants;
use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Services\SupplierService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SupplierController extends Controller
{
    protected $supplierService;

    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Authorization check
        if (!auth()->user() || !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized access to suppliers.');
        }

        $filters = $request->only(['status', 'type', 'search', 'country', 'min_rating']);
        
        try {
            $suppliers = $this->supplierService->getAllSuppliers($filters);
            
            return Inertia::render('admin/supplier/Index', [
                'suppliers' => SupplierResource::collection($suppliers)->toArray($request),
                'filters' => $filters,
                'constants' => [
                    'supplier_types' => SupplierConstants::SUPPLIER_TYPES,
                    'statuses' => SupplierConstants::STATUSES,
                    'payment_terms' => SupplierConstants::PAYMENT_TERMS,
                    'payment_methods' => SupplierConstants::PAYMENT_METHODS,
                    'contract_types' => SupplierConstants::CONTRACT_TYPES,
                ],
                'can' => [
                    'create' => auth()->user()->isAdmin(),
                    'edit' => auth()->user()->isAdmin(),
                    'delete' => auth()->user()->isAdmin(),
                    'viewAny' => auth()->user()->isAdmin(),
                ]
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to load suppliers: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Suppliers/Create', [
            'constants' => [
                'supplier_types' => SupplierConstants::SUPPLIER_TYPES,
                'statuses' => SupplierConstants::STATUSES,
                'payment_terms' => SupplierConstants::PAYMENT_TERMS,
                'payment_methods' => SupplierConstants::PAYMENT_METHODS,
                'contract_types' => SupplierConstants::CONTRACT_TYPES,
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request)
    {
        try {
            $supplier = $this->supplierService->createSupplier($request->validated());
            
            return redirect()
                ->route('admin.suppliers.show', $supplier)
                ->with('success', 'Supplier created successfully.');
                
        } catch (ValidationException $e) {
            return back()
                ->withInput()
                ->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create supplier: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        try {
            $supplier = $this->supplierService->getSupplierById($id);
            $metrics = $this->supplierService->getSupplierMetrics($id);
            
            return Inertia::render('Admin/Suppliers/Show', [
                'supplier' => new SupplierResource($supplier),
                'metrics' => $metrics,
                'can' => [
                    'edit' => auth()->user()->isAdmin(),
                    'delete' => auth()->user()->isAdmin(),
                ]
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Supplier not found']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        try {
            $supplier = $this->supplierService->getSupplierById($id);
            
            return Inertia::render('Admin/Suppliers/Edit', [
                'supplier' => new SupplierResource($supplier),
                'constants' => [
                    'supplier_types' => SupplierConstants::SUPPLIER_TYPES,
                    'statuses' => SupplierConstants::STATUSES,
                    'payment_terms' => SupplierConstants::PAYMENT_TERMS,
                    'payment_methods' => SupplierConstants::PAYMENT_METHODS,
                    'contract_types' => SupplierConstants::CONTRACT_TYPES,
                ]
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Supplier not found']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        try {
            $supplier = $this->supplierService->updateSupplier($id, $request->validated());
            
            return redirect()
                ->route('admin.suppliers.show', $supplier)
                ->with('success', 'Supplier updated successfully.');
                
        } catch (ValidationException $e) {
            return back()
                ->withInput()
                ->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update supplier: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        try {
            $this->supplierService->deleteSupplier($supplier->id);
            
            return redirect()
                ->route('admin.suppliers.index')
                ->with('success', 'Supplier deleted successfully.');
                
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete supplier: ' . $e->getMessage()]);
        }
    }

    // API endpoints for AJAX calls
    public function search(Request $request)
    {
        $term = $request->get('q');
        $filters = $request->only(['status', 'type']);
        
        $suppliers = $this->supplierService->searchSuppliers($term, $filters);
        
        return response()->json([
            'data' => SupplierResource::collection($suppliers)
        ]);
    }

    public function getMetrics(int $id)
    {
        try {
            $metrics = $this->supplierService->getSupplierMetrics($id);
            return response()->json(['data' => $metrics]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }
}
