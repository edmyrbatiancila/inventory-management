<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApprovePurchaseOrderRequest;
use App\Http\Requests\ReceivePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Models\PurchaseOrderItem;
use App\Models\Warehouse;
use App\Services\PurchaseOrderService;
use App\Traits\PurchaseOrderResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
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
    public function create()
    {
        //
    }

    /**
     * Store a newly created purchase order
     */
    public function store(StorePurchaseOrderRequest $request): JsonResponse|RedirectResponse
    {
        try {
            $purchaseOrder = $this->purchaseOrderService->createPurchaseOrder($request->validated());
            
            return $this->successResponse(
                'Purchase order created successfully', 
                $purchaseOrder,
                'admin.purchase-orders.show'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
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
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseOrder $purchaseOrder)
    {
        //
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
            
            return $this->successResponse('Purchase order updated successfully', $updated);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
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
