<?php

namespace App\Http\Controllers;

use App\Constants\CustomerConstants;
use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerController extends Controller
{
    protected $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
        $this->middleware('auth');
        $this->middleware('admin')->except(['index', 'show']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'customer_type', 'priority', 'credit_status', 'search']);
        
        try {
            $customers = $this->customerService->getAllCustomers($filters);
            
            return Inertia::render('Admin/Customers/Index', [
                'customers' => CustomerResource::collection($customers),
                'filters' => $filters,
                'constants' => [
                    'statuses' => CustomerConstants::STATUSES,
                    'types' => CustomerConstants::CUSTOMER_TYPES,
                    'priorities' => CustomerConstants::PRIORITIES,
                    'creditStatuses' => CustomerConstants::CREDIT_STATUSES,
                    'priceTiers' => CustomerConstants::PRICE_TIERS,
                ],
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to load customers: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Customers/Create', [
            'constants' => [
                'statuses' => CustomerConstants::STATUSES,
                'types' => CustomerConstants::CUSTOMER_TYPES,
                'priorities' => CustomerConstants::PRIORITIES,
                'creditStatuses' => CustomerConstants::CREDIT_STATUSES,
                'priceTiers' => CustomerConstants::PRICE_TIERS,
                'paymentTerms' => CustomerConstants::PAYMENT_TERMS,
                'companySizes' => CustomerConstants::COMPANY_SIZES,
                'leadSources' => CustomerConstants::LEAD_SOURCES,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        try {
            $customer = $this->customerService->createCustomer($request->validated());
            
            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', 'Customer created successfully!');
                
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create customer: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        try {
            $customer = $this->customerService->getCustomerById($customer->id);
            $metrics = $this->customerService->getCustomerMetrics($customer->id);
            
            return Inertia::render('Admin/Customers/Show', [
                'customer' => new CustomerResource($customer),
                'metrics' => $metrics,
                'constants' => [
                    'statuses' => CustomerConstants::STATUSES,
                    'types' => CustomerConstants::CUSTOMER_TYPES,
                    'priorities' => CustomerConstants::PRIORITIES,
                    'creditStatuses' => CustomerConstants::CREDIT_STATUSES,
                ],
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Customer not found: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        try {
            $customer = $this->customerService->getCustomerById($customer->id);
            
            return Inertia::render('Admin/Customers/Edit', [
                'customer' => new CustomerResource($customer),
                'constants' => [
                    'statuses' => CustomerConstants::STATUSES,
                    'types' => CustomerConstants::CUSTOMER_TYPES,
                    'priorities' => CustomerConstants::PRIORITIES,
                    'creditStatuses' => CustomerConstants::CREDIT_STATUSES,
                    'priceTiers' => CustomerConstants::PRICE_TIERS,
                    'paymentTerms' => CustomerConstants::PAYMENT_TERMS,
                    'companySizes' => CustomerConstants::COMPANY_SIZES,
                    'leadSources' => CustomerConstants::LEAD_SOURCES,
                ],
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Customer not found: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        try {
            $updatedCustomer = $this->customerService->updateCustomer($customer->id, $request->validated());
            
            return redirect()
                ->route('admin.customers.show', $updatedCustomer)
                ->with('success', 'Customer updated successfully!');
                
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update customer: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        try {
            $this->customerService->deleteCustomer($customer->id);
            
            return redirect()
                ->route('admin.customers.index')
                ->with('success', 'Customer deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete customer: ' . $e->getMessage()]);
        }
    }

    // API endpoints for AJAX calls
    public function search(Request $request)
    {
        $term = $request->get('term', '');
        $filters = $request->only(['status', 'customer_type', 'priority']);
        
        $customers = $this->customerService->searchCustomers($term, $filters);
        
        return CustomerResource::collection($customers);
    }

    public function getMetrics(int $id)
    {
        try {
            $metrics = $this->customerService->getCustomerMetrics($id);
            return response()->json($metrics);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }
}
