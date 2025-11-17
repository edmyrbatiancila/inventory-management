<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApprovePurchaseOrderRequest;
use App\Http\Requests\ReceivePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\PurchaseOrderService;
use App\Traits\PurchaseOrderResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    use PurchaseOrderResponses;

    public function __construct(
        private PurchaseOrderService $purchaseOrderService
    ) {}

    /**
     * Display a listing of purchase orders
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'priority', 'warehouse_id', 'per_page']);
        $purchaseOrders = $this->purchaseOrderService->getPurchaseOrders($filters, $filters['per_page'] ?? 15);
        
        return $this->renderIndex($purchaseOrders, [
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'statuses' => PurchaseOrder::STATUSES,
            'priorities' => PurchaseOrder::PRIORITIES,
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

            return Inertia::render('admin/purchase-orders/Create', [
                'warehouses' => $warehouses,
                'products' => $products,
                'statuses' => PurchaseOrder::STATUSES,
                'priorities' => PurchaseOrder::PRIORITIES,
                'defaultCurrency' => 'USD',
                'nextPoNumber' => PurchaseOrder::generatePoNumber(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading Purchase Order create page: ' . $e->getMessage());
            return redirect()
                ->route('admin.purchase-orders.index')
                ->with('error', 'Unable to load create form. Please try again.');
        }
    }

    /**
     * Store a newly created purchase order
     */
    public function store(StorePurchaseOrderRequest $request): JsonResponse|RedirectResponse
    {
        try {
            // Validate that we have items
            if (empty($request->items) || count($request->items) === 0) {
                return $this->errorResponse('Purchase order must have at least one item.');
            }

            // Prepare purchase order data
            $purchaseOrderData = [
                'purchase_order' => [
                    'po_number' => $request->po_number ?: PurchaseOrder::generatePoNumber(),
                    'supplier_name' => $request->supplier_name,
                    'supplier_email' => $request->supplier_email,
                    'supplier_phone' => $request->supplier_phone,
                    'supplier_address' => $request->supplier_address,
                    'supplier_contact_person' => $request->supplier_contact_person,
                    'warehouse_id' => $request->warehouse_id,
                    'expected_delivery_date' => $request->expected_delivery_date,
                    'priority' => $request->priority ?: PurchaseOrder::PRIORITY_NORMAL,
                    'status' => PurchaseOrder::STATUS_DRAFT,
                    'currency' => $request->currency ?: 'PHP',
                    'notes' => $request->notes,
                    'terms_and_conditions' => $request->terms_and_conditions,
                    'created_by' => Auth::id(),
                ],
                'items' => $request->items
            ];

            // Create the purchase order through the service
            $purchaseOrder = $this->purchaseOrderService->createPurchaseOrder($purchaseOrderData);

            return $this->successResponse(
                'Purchase order created successfully!',
                $purchaseOrder,
                'admin.purchase-orders.edit',
                $purchaseOrder->id
            );

        } catch (\Exception $e) {
            Log::error('Error creating purchase order: ' . $e->getMessage());
            return $this->errorResponse('Failed to create purchase order. Please try again.');
        }
    }

    /**
     * Display the specified purchase order
     */
    public function show(PurchaseOrder $purchaseOrder): Response
    {
        return $this->renderShow($purchaseOrder);
    }

    /**
     * Show the form for editing the specified purchase order
     */
    public function edit(PurchaseOrder $purchaseOrder): Response|RedirectResponse
    {
        try {
            // Check if the purchase order can be edited
            if (!$purchaseOrder->canBeEdited()) {
                return redirect()
                    ->route('admin.purchase-orders.show', $purchaseOrder)
                    ->with('error', 'This purchase order cannot be edited in its current status.');
            }

            // Get all necessary data for the edit form (same as create)
            $warehouses = Warehouse::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'address']);

            $products = Product::where('is_active', true)
                ->with(['category:id,name', 'brand:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'price', 'min_stock_level', 'category_id', 'brand_id']);

            // Load the purchase order with its relationships
            $purchaseOrderWithItems = $purchaseOrder->load([
                'items.product.category',
                'items.product.brand',
                'warehouse',
                'createdBy:id,name',
                'approvedBy:id,name'
            ]);

            return $this->renderEdit($purchaseOrderWithItems, $warehouses, $products);

        } catch (\Exception $e) {
            Log::error('Error loading Purchase Order edit page: ' . $e->getMessage());
            return redirect()
                ->route('admin.purchase-orders.index')
                ->with('error', 'Unable to load edit form. Please try again.');
        }
    }

    /**
     * Update the specified purchase order
     */
    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        try {
            $updated = $this->purchaseOrderService->updatePurchaseOrder(
                $purchaseOrder->id, 
                $request->validated()
            );

            if ($updated) {
                return redirect()->route('admin.purchase-orders.edit', $purchaseOrder->id)->with('success', 'Purchase order updated successfully');
            }
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update inventory.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating inventory: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified purchase order
     */
    public function destroy(PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        try {
            if (!$purchaseOrder->canBeCancelled()) {
                return $this->errorResponse('Purchase order cannot be deleted in its current state');
            }

            $purchaseOrder->delete();
            
            return $this->successResponse('Purchase order deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    // ====== STATUS ACTION METHODS ======

    /**
     * Approve purchase order
     */
    public function approve(ApprovePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        try {
            $this->purchaseOrderService->approvePurchaseOrder($purchaseOrder->id, Auth::id());
            
            return $this->successResponse('Purchase order approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Send purchase order to supplier
     */
    public function sendToSupplier(Request $request, PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        try {
            $this->purchaseOrderService->sendToSupplier($purchaseOrder->id);
            
            return $this->successResponse('Purchase order sent to supplier successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Cancel purchase order
     */
    public function cancel(Request $request, PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);
        
        try {
            $this->purchaseOrderService->cancelPurchaseOrder($purchaseOrder->id, $request->reason);
            
            return $this->successResponse('Purchase order cancelled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Show receive items form
     */
    public function showReceive(PurchaseOrder $purchaseOrder): Response|RedirectResponse
    {
        // Check authorization
        Gate::authorize('receive', $purchaseOrder);

        // Load relationships
        $purchaseOrder->load(['items.product', 'warehouse', 'createdBy']);

        return Inertia::render('admin/purchase-orders/Receive', [
            'purchase_order' => $purchaseOrder,
            'can' => [
                'receive' => Auth::user()->can('receive', $purchaseOrder),
            ],
        ]);
    }

    /**
     * Receive purchase order items
     */
    public function receive(ReceivePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        try {
            $this->purchaseOrderService->receiveItems($purchaseOrder->id, $request->validated());
            
            return $this->successResponse('Items received successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    // ====== ITEM MANAGEMENT METHODS ======

    /**
     * Add item to purchase order
     */
    public function addItem(Request $request, PurchaseOrder $purchaseOrder): JsonResponse|RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity_ordered' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
        ]);

        try {
            $item = $this->purchaseOrderService->addItemToPurchaseOrder(
                $purchaseOrder->id, 
                $request->only(['product_id', 'quantity_ordered', 'unit_cost', 'notes'])
            );
            
            return $this->successResponse('Item added successfully', $item);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Update purchase order item
     */
    public function updateItem(Request $request, PurchaseOrder $purchaseOrder, PurchaseOrderItem $item): JsonResponse|RedirectResponse
    {
        $request->validate([
            'quantity_ordered' => 'sometimes|integer|min:1',
            'unit_cost' => 'sometimes|numeric|min:0',
        ]);

        try {
            $this->purchaseOrderService->updateItem(
                $purchaseOrder->id, 
                $item->id, 
                $request->only(['quantity_ordered', 'unit_cost', 'notes'])
            );
            
            return $this->successResponse('Item updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Remove item from purchase order
     */
    public function removeItem(PurchaseOrder $purchaseOrder, PurchaseOrderItem $item): JsonResponse|RedirectResponse
    {
        try {
            $this->purchaseOrderService->removeItem($purchaseOrder->id, $item->id);
            
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
        $pendingApprovals = $this->purchaseOrderService->getPendingApprovals();
        
        if (request()->expectsJson()) {
            return response()->json($pendingApprovals);
        }
        
        return inertia('Admin/PurchaseOrders/PendingApprovals', [
            'purchase_orders' => $pendingApprovals
        ]);
    }

    /**
     * Get overdue purchase orders
     */
    public function overdue(): JsonResponse|Response
    {
        $overdue = $this->purchaseOrderService->getOverduePurchaseOrders();
        
        if (request()->expectsJson()) {
            return response()->json($overdue);
        }
        
        return inertia('Admin/PurchaseOrders/Overdue', [
            'purchase_orders' => $overdue
        ]);
    }

    /**
     * Get purchase order statistics
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->purchaseOrderService->getDashboardStatistics();
        
        return response()->json($statistics);
    }
}
