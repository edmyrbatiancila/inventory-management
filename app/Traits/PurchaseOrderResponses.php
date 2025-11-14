<?php

namespace App\Traits;

use App\Models\PurchaseOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

trait PurchaseOrderResponses
{
    /**
     * Success response for purchase order operations
     */
    protected function successResponse(string $message, $data = null, string $route = 'admin.purchase-orders.index', $routeParameters = []): JsonResponse|RedirectResponse
    {
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $data
            ]);
        }

        return redirect()->route($route, $routeParameters)->with('success', $message);
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
        $user = Auth::user();
        return Inertia::render('admin/purchase-orders/Index', array_merge([
            'purchase_orders' => $purchaseOrders,
            'filters' => request()->only(['search', 'status', 'priority', 'warehouse_id']),
            'can' => [
                'create' => Gate::allows('create', PurchaseOrder::class),
                'viewAny' => Gate::allows('viewAny', PurchaseOrder::class),
            ]
        ], $additionalData));
    }

    /**
     * Render show page for purchase order
     */
    protected function renderShow(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load([
            'items.product.category',
            'items.product.brand',
            'warehouse',
            'createdBy',
            'approvedBy',
            'receivedBy'
        ]);

        return Inertia::render('admin/purchase-orders/View', [
            'purchase_order' => $purchaseOrder,
            'statuses' => PurchaseOrder::STATUSES,
            'priorities' => PurchaseOrder::PRIORITIES,
            'can' => [
                'view' => Gate::allows('view', $purchaseOrder),
                'update' => Gate::allows('update', $purchaseOrder),
                'delete' => Gate::allows('delete', $purchaseOrder),
                'approve' => $purchaseOrder->canBeApproved() && Gate::allows('approve', $purchaseOrder),
                'send' => $purchaseOrder->canBeSent() && Gate::allows('send', $purchaseOrder),
                'receive' => $purchaseOrder->canBeReceived() && Gate::allows('receive', $purchaseOrder),
                'cancel' => $purchaseOrder->canBeCancelled() && Gate::allows('cancel', $purchaseOrder),
            ]
        ]);
    }

    /**
     * Render edit page for purchase order
     */
    protected function renderEdit(PurchaseOrder $purchaseOrder, $warehouses, $products): Response
    {
        return Inertia::render('admin/purchase-orders/Edit', [
            'purchase_order' => $purchaseOrder,
            'warehouses' => $warehouses,
            'products' => $products,
            'statuses' => PurchaseOrder::STATUSES,
            'priorities' => PurchaseOrder::PRIORITIES,
            'defaultCurrency' => 'USD',
            'can' => [
                'update' => Gate::allows('update', $purchaseOrder),
                'delete' => Gate::allows('delete', $purchaseOrder),
            ]
        ]);
    }
}
