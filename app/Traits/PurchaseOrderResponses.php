<?php

namespace App\Traits;

use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

trait PurchaseOrderResponses
{
    /**
     * Success response for purchase order operations
     */
    protected function successResponse(string $message, $data = null, string $route = 'admin.purchase-orders.index'): JsonResponse|RedirectResponse
    {
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $data
            ]);
        }

        return redirect()->route($route)->with('success', $message);
    }

    /**
     * Error response for purchase order operations
     */
    protected function errorResponse(string $message, int $status = 400): JsonResponse|RedirectResponse
    {
        if (request()->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message
            ], $status);
        }

        return back()->withErrors(['error' => $message]);
    }

    /**
     * Purchase order not found response
     */
    protected function notFoundResponse(): JsonResponse|RedirectResponse
    {
        return $this->errorResponse('Purchase order not found', 404);
    }

    /**
     * Render index page with purchase orders
     */
    protected function renderIndex($purchaseOrders, array $additionalData = []): Response
    {
        return Inertia::render('admin/purchase-orders/Index', array_merge([
            'purchase_orders' => $purchaseOrders,
            'filters' => request()->only(['search', 'status', 'priority', 'warehouse_id']),
            'can' => [
                'create' => auth()->user()->can('create', PurchaseOrder::class),
                'viewAny' => auth()->user()->can('viewAny', PurchaseOrder::class),
            ]
        ], $additionalData));
    }

    /**
     * Render show page for purchase order
     */
    protected function renderShow(PurchaseOrder $purchaseOrder): Response
    {
        return Inertia::render('Admin/PurchaseOrders/Show', [
            'purchase_order' => $purchaseOrder->load(['items.product', 'warehouse', 'createdBy', 'approvedBy']),
            'can' => [
                'approve' => $purchaseOrder->canBeApproved() && auth()->user()->can('approve', $purchaseOrder),
                'send' => $purchaseOrder->canBeSent() && auth()->user()->can('send', $purchaseOrder),
                'receive' => $purchaseOrder->canBeReceived() && auth()->user()->can('receive', $purchaseOrder),
                'cancel' => $purchaseOrder->canBeCancelled() && auth()->user()->can('cancel', $purchaseOrder),
                'update' => auth()->user()->can('update', $purchaseOrder),
            ]
        ]);
    }
}
