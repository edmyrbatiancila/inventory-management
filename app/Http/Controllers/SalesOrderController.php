<?php

namespace App\Http\Controllers;

use App\Models\SalesOrder;
use App\Http\Requests\StoreSalesOrderRequest;
use App\Http\Requests\UpdateSalesOrderRequest;
use App\Models\Product;
use App\Models\SalesOrderItem;
use App\Models\Warehouse;
use App\Services\SalesOrderService;
use App\Traits\SalesOrderResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SalesOrderController extends Controller
{
    use SalesOrderResponses;

    public function __construct(
        private SalesOrderService $salesOrderService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'priority', 'warehouse_id', 'payment_status', 'per_page']);
        $salesOrders = $this->salesOrderService->getSalesOrders($filters, $filters['per_page'] ?? 15);
        
        return $this->renderIndex($salesOrders, [
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'statuses' => SalesOrder::STATUSES,
            'payment_statuses' => SalesOrder::PAYMENT_STATUSES,
            'priorities' => ['low' => 'Low', 'normal' => 'Normal', 'high' => 'High', 'urgent' => 'Urgent'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            // Get all necessary data for the create form
            $warehouses = Warehouse::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'address']);

            $products = Product::where('is_active', true)
                ->with(['category:id,name', 'brand:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'price', 'min_stock_level', 'category_id', 'brand_id']);

            return Inertia::render('admin/sales-orders/Create', [
                'warehouses' => $warehouses,
                'products' => $products,
                'statuses' => SalesOrder::STATUSES,
                'payment_statuses' => SalesOrder::PAYMENT_STATUSES,
                'priorities' => ['low' => 'Low', 'normal' => 'Normal', 'high' => 'High', 'urgent' => 'Urgent'],
                'defaultCurrency' => 'USD',
                'nextSoNumber' => SalesOrder::generateNumber('SO'),
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading Sales Order create page: ' . $e->getMessage());
            return redirect()
                ->route('admin.sales-orders.index')
                ->with('error', 'Unable to load create form. Please try again.');
        }
    }

    /**
     * Store a newly created sales order
     */
    public function store(StoreSalesOrderRequest $request): JsonResponse|RedirectResponse
    {
        try {
            // Validate that we have items
            if (empty($request->items) || count($request->items) === 0) {
                return $this->errorResponse('Sales order must have at least one item.');
            }

            // Prepare sales order data
            $salesOrderData = [
                'sales_order' => [
                    'so_number' => $request->so_number ?: SalesOrder::generateNumber('SO'),
                    'customer_name' => $request->customer_name,
                    'customer_email' => $request->customer_email,
                    'customer_phone' => $request->customer_phone,
                    'customer_address' => $request->customer_address,
                    'customer_contact_person' => $request->customer_contact_person,
                    'customer_reference' => $request->customer_reference,
                    'warehouse_id' => $request->warehouse_id,
                    'requested_delivery_date' => $request->requested_delivery_date,
                    'promised_delivery_date' => $request->promised_delivery_date,
                    'priority' => $request->priority ?: 'normal',
                    'status' => 'draft',
                    'payment_status' => $request->payment_status ?: 'pending',
                    'payment_terms' => $request->payment_terms,
                    'currency' => $request->currency ?: 'USD',
                    'tax_rate' => $request->tax_rate !== '' ? (float)$request->tax_rate / 100 : null,
                    'shipping_cost' => $request->shipping_cost !== '' ? (float)$request->shipping_cost : null,
                    'discount_amount' => $request->discount_amount !== '' ? (float)$request->discount_amount : null,
                    'shipping_address' => $request->shipping_address,
                    'shipping_method' => $request->shipping_method,
                    'notes' => $request->notes,
                    'customer_notes' => $request->customer_notes,
                    'terms_and_conditions' => $request->terms_and_conditions,
                    'created_by' => Auth::id(),
                ],
                'items' => collect($request->items)->map(function ($item) {
                    // Convert discount percentage from percentage to decimal
                    if (isset($item['discount_percentage']) && $item['discount_percentage'] !== '') {
                        $item['discount_percentage'] = (float)$item['discount_percentage'] / 100;
                    } else {
                        $item['discount_percentage'] = null;
                    }
                    return $item;
                })->toArray()
            ];

            // Create the sales order through the service
            $salesOrder = $this->salesOrderService->createSalesOrder($salesOrderData);

            return $this->successResponse(
                'Sales order created successfully!',
                $salesOrder,
                'admin.sales-orders.edit',
                $salesOrder->id
            );

        } catch (\Exception $e) {
            Log::error('Error creating sales order: ' . $e->getMessage());
            return $this->errorResponse('Failed to create sales order. Please try again.');
        }
    }

    /**
     * Display the specified sales order
     */
    public function show(SalesOrder $salesOrder): Response
    {
        return $this->renderShow($salesOrder);
    }

    /**
     * Show the form for editing the specified sales order
     */
    public function edit(SalesOrder $salesOrder): Response|RedirectResponse
    {
        try {
            // Check if the sales order can be edited
            if (!$salesOrder->canBeEdited()) {
                return redirect()
                    ->route('admin.sales-orders.show', $salesOrder)
                    ->with('error', 'This sales order cannot be edited in its current status.');
            }

            // Get all necessary data for the edit form (same as create)
            $warehouses = Warehouse::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'address']);

            $products = Product::where('is_active', true)
                ->with(['category:id,name', 'brand:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'price', 'min_stock_level', 'category_id', 'brand_id']);

            // Load the sales order with its relationships
            $salesOrderWithItems = $salesOrder->load([
                'items.product.category',
                'items.product.brand',
                'warehouse',
                'createdBy:id,name',
                'approvedBy:id,name',
                'fulfilledBy:id,name',
                'shippedBy:id,name'
            ]);

            return $this->renderEdit($salesOrderWithItems, $warehouses, $products);

        } catch (\Exception $e) {
            Log::error('Error loading Sales Order edit page: ' . $e->getMessage());
            return redirect()
                ->route('admin.sales-orders.index')
                ->with('error', 'Unable to load edit form. Please try again.');
        }
    }

    /**
     * Update the specified sales order
     */
    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        try {
            // Convert percentage fields and process items if they exist
            $validatedData = $request->validated();
            
            // Convert percentage fields to decimals for main order
            if (isset($validatedData['tax_rate']) && $validatedData['tax_rate'] !== '') {
                $validatedData['tax_rate'] = (float)$validatedData['tax_rate'] / 100;
            }
            
            // Process items discount percentage if items are being updated
            if (isset($validatedData['items'])) {
                foreach ($validatedData['items'] as &$item) {
                    if (isset($item['discount_percentage']) && $item['discount_percentage'] !== '') {
                        $item['discount_percentage'] = (float)$item['discount_percentage'] / 100;
                    }
                }
            }

            $updated = $this->salesOrderService->updateSalesOrder(
                $salesOrder->id, 
                $validatedData
            );

            if ($updated) {
                return redirect()->route('admin.sales-orders.edit', $salesOrder->id)->with('success', 'Sales order updated successfully');
            }
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update sales order.');

        } catch (\Exception $e) {
            Log::error('Error updating sales order: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating sales order: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified sales order
     */
    public function destroy(SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        try {
            if (!$salesOrder->canBeCancelled()) {
                return $this->errorResponse('Sales order cannot be deleted in its current state');
            }

            $salesOrder->delete();
            
            return $this->successResponse('Sales order deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    // ====== STATUS ACTION METHODS ======

    /**
     * Approve sales order
     */
    public function approve(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        try {
            $this->salesOrderService->approveSalesOrder($salesOrder->id, Auth::id());
            
            return $this->successResponse('Sales order approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Confirm sales order
     */
    public function confirm(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        try {
            $this->salesOrderService->confirmSalesOrder($salesOrder->id);
            
            return $this->successResponse('Sales order confirmed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Cancel sales order
     */
    public function cancel(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);
        
        try {
            $this->salesOrderService->cancelSalesOrder($salesOrder->id, $request->reason);
            
            return $this->successResponse('Sales order cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Show fulfillment form
     */
    public function showFulfill(SalesOrder $salesOrder): Response|RedirectResponse
    {
        // Check authorization
        Gate::authorize('fulfill', $salesOrder);

        // Load relationships
        $salesOrder->load(['items.product', 'items.inventory', 'warehouse', 'createdBy']);

        return Inertia::render('admin/sales-orders/Fulfill', [
            'sales_order' => $salesOrder,
            'can' => [
                'fulfill' => Auth::user()->can('fulfill', $salesOrder),
            ],
        ]);
    }

    /**
     * Fulfill sales order items
     */
    public function fulfill(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:sales_order_items,id',
            'items.*.quantity_fulfilled' => 'required|integer|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        try {
            $this->salesOrderService->fulfillItems($salesOrder->id, $request->validated());
            
            return $this->successResponse('Items fulfilled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Ship sales order
     */
    public function ship(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        $request->validate([
            'tracking_number' => 'nullable|string|max:255',
            'carrier' => 'nullable|string|max:255',
            'shipped_by' => 'nullable|integer|exists:users,id',
        ]);

        try {
            $this->salesOrderService->shipSalesOrder($salesOrder->id, $request->validated());
            
            return $this->successResponse('Sales order shipped successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Mark sales order as delivered
     */
    public function deliver(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        try {
            $this->salesOrderService->markAsDelivered($salesOrder->id);
            
            return $this->successResponse('Sales order marked as delivered successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    // ====== ITEM MANAGEMENT METHODS ======

    /**
     * Add item to sales order
     */
    public function addItem(Request $request, SalesOrder $salesOrder): JsonResponse|RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity_ordered' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        try {
            $item = $this->salesOrderService->addItemToSalesOrder(
                $salesOrder->id, 
                $request->only(['product_id', 'quantity_ordered', 'unit_price', 'notes', 'customer_notes'])
            );
            
            return $this->successResponse('Item added successfully', $item);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Update sales order item
     */
    public function updateItem(Request $request, SalesOrder $salesOrder, SalesOrderItem $item): JsonResponse|RedirectResponse
    {
        $request->validate([
            'quantity_ordered' => 'sometimes|integer|min:1',
            'unit_price' => 'sometimes|numeric|min:0',
        ]);

        try {
            $this->salesOrderService->updateItem(
                $salesOrder->id, 
                $item->id, 
                $request->only(['quantity_ordered', 'unit_price', 'notes', 'customer_notes'])
            );
            
            return $this->successResponse('Item updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Remove item from sales order
     */
    public function removeItem(SalesOrder $salesOrder, SalesOrderItem $item): JsonResponse|RedirectResponse
    {
        try {
            $this->salesOrderService->removeItem($salesOrder->id, $item->id);
            
            return $this->successResponse('Item removed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    // ====== REPORT METHODS ======

    /**
     * Get pending approvals
     */
    public function pendingApprovals(): JsonResponse|Response
    {
        $pendingApprovals = $this->salesOrderService->getPendingApprovals();
        
        if (request()->expectsJson()) {
            return response()->json($pendingApprovals);
        }
        
        return inertia('Admin/SalesOrders/PendingApprovals', [
            'sales_orders' => $pendingApprovals
        ]);
    }

    /**
     * Get overdue sales orders
     */
    public function overdue(): JsonResponse|Response
    {
        $overdue = $this->salesOrderService->getOverdueSalesOrders();
        
        if (request()->expectsJson()) {
            return response()->json($overdue);
        }
        
        return inertia('Admin/SalesOrders/Overdue', [
            'sales_orders' => $overdue
        ]);
    }

    /**
     * Get unfulfilled sales orders
     */
    public function unfulfilled(): JsonResponse|Response
    {
        $unfulfilled = $this->salesOrderService->getUnfulfilledOrders();
        
        if (request()->expectsJson()) {
            return response()->json($unfulfilled);
        }
        
        return inertia('Admin/SalesOrders/Unfulfilled', [
            'sales_orders' => $unfulfilled
        ]);
    }

    /**
     * Get fulfilled but unshipped orders
     */
    public function fulfilledUnshipped(): JsonResponse|Response
    {
        $orders = $this->salesOrderService->getFulfilledUnshippedOrders();
        
        if (request()->expectsJson()) {
            return response()->json($orders);
        }
        
        return inertia('Admin/SalesOrders/FulfilledUnshipped', [
            'sales_orders' => $orders
        ]);
    }

    /**
     * Get sales order statistics
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->salesOrderService->getDashboardStatistics();
        
        return response()->json($statistics);
    }

    /**
     * Get orders by customer
     */
    public function byCustomer(Request $request): JsonResponse|Response
    {
        $request->validate(['customer_name' => 'required|string']);
        
        $orders = $this->salesOrderService->getOrdersByCustomer($request->customer_name);
        
        if (request()->expectsJson()) {
            return response()->json($orders);
        }
        
        return inertia('Admin/SalesOrders/ByCustomer', [
            'sales_orders' => $orders,
            'customer_name' => $request->customer_name
        ]);
    }

    /**
     * Get orders by payment status
     */
    public function byPaymentStatus(Request $request): JsonResponse|Response
    {
        $request->validate(['payment_status' => 'required|string']);
        
        $orders = $this->salesOrderService->getOrdersByPaymentStatus($request->payment_status);
        
        if (request()->expectsJson()) {
            return response()->json($orders);
        }
        
        return inertia('Admin/SalesOrders/ByPaymentStatus', [
            'sales_orders' => $orders,
            'payment_status' => $request->payment_status
        ]);
    }
}
