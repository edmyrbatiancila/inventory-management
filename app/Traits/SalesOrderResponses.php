<?php

namespace App\Traits;

use App\Models\SalesOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

trait SalesOrderResponses
{
    /**
     * Success response for sales order operations
     */
    protected function successResponse(string $message, $data = null, string $route = 'admin.sales-orders.index', $routeParameters = []): JsonResponse|RedirectResponse
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
     * Error response for sales order operations
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
     * Sales order not found response
     */
    protected function notFoundResponse(): JsonResponse|RedirectResponse
    {
        return $this->errorResponse('Sales order not found', 404);
    }

    /**
     * Render index page with sales orders
     */
    protected function renderIndex($salesOrders, array $additionalData = []): Response
    {
        $user = Auth::user();
        return Inertia::render('admin/sales-orders/Index', array_merge([
            'sales_orders' => $salesOrders,
            'filters' => request()->only(['search', 'status', 'priority', 'warehouse_id', 'payment_status']),
            'can' => [
                'create' => Gate::allows('create', SalesOrder::class),
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
            ]
        ], $additionalData));
    }

    /**
     * Render show page for sales order
     */
    protected function renderShow(SalesOrder $salesOrder): Response
    {
        $salesOrder->load([
            'items.product.category',
            'items.product.brand',
            'warehouse',
            'createdBy',
            'approvedBy',
            'fulfilledBy',
            'shippedBy'
        ]);

        return Inertia::render('admin/sales-orders/View', [
            'sales_order' => $salesOrder,
            'statuses' => SalesOrder::STATUSES,
            'payment_statuses' => SalesOrder::PAYMENT_STATUSES,
            'priorities' => ['low' => 'Low', 'normal' => 'Normal', 'high' => 'High', 'urgent' => 'Urgent'],
            'can' => [
                'view' => Gate::allows('view', $salesOrder),
                'update' => Gate::allows('update', $salesOrder),
                'delete' => Gate::allows('delete', $salesOrder),
                'approve' => $salesOrder->status === 'pending_approval' && Gate::allows('approve', $salesOrder),
                'confirm' => in_array($salesOrder->status, ['draft', 'approved']) && Gate::allows('confirm', $salesOrder),
                'fulfill' => in_array($salesOrder->status, ['confirmed', 'partially_fulfilled']) && Gate::allows('fulfill', $salesOrder),
                'ship' => $salesOrder->status === 'fully_fulfilled' && Gate::allows('ship', $salesOrder),
                'deliver' => $salesOrder->status === 'shipped' && Gate::allows('deliver', $salesOrder),
                'cancel' => $salesOrder->canBeCancelled() && Gate::allows('cancel', $salesOrder),
            ]
        ]);
    }

    /**
     * Render edit page for sales order
     */
    protected function renderEdit(SalesOrder $salesOrder, $warehouses, $products): Response
    {
        return Inertia::render('admin/sales-orders/Edit', [
            'sales_order' => $salesOrder,
            'warehouses' => $warehouses,
            'products' => $products,
            'statuses' => SalesOrder::STATUSES,
            'payment_statuses' => SalesOrder::PAYMENT_STATUSES,
            'priorities' => ['low' => 'Low', 'normal' => 'Normal', 'high' => 'High', 'urgent' => 'Urgent'],
            'defaultCurrency' => 'USD',
            'can' => [
                'update' => Gate::allows('update', $salesOrder),
                'delete' => Gate::allows('delete', $salesOrder),
                'addItems' => $salesOrder->canBeEdited() && Gate::allows('update', $salesOrder),
                'editItems' => $salesOrder->canBeEdited() && Gate::allows('update', $salesOrder),
            ]
        ]);
    }

    /**
     * Render create page for sales order
     */
    protected function renderCreate($warehouses, $products): Response
    {
        return Inertia::render('admin/sales-orders/Create', [
            'warehouses' => $warehouses,
            'products' => $products,
            'statuses' => SalesOrder::STATUSES,
            'payment_statuses' => SalesOrder::PAYMENT_STATUSES,
            'priorities' => ['low' => 'Low', 'normal' => 'Normal', 'high' => 'High', 'urgent' => 'Urgent'],
            'defaultCurrency' => 'USD',
            'nextSoNumber' => SalesOrder::generateNumber('SO'),
        ]);
    }

    /**
     * Render fulfill page for sales order
     */
    protected function renderFulfill(SalesOrder $salesOrder): Response
    {
        return Inertia::render('admin/sales-orders/Fulfill', [
            'sales_order' => $salesOrder,
            'statuses' => SalesOrder::STATUSES,
            'can' => [
                'fulfill' => Gate::allows('fulfill', $salesOrder),
                'updateItems' => Gate::allows('update', $salesOrder),
            ]
        ]);
    }

    /**
     * Render shipping form for sales order
     */
    protected function renderShipping(SalesOrder $salesOrder): Response
    {
        return Inertia::render('admin/sales-orders/Shipping', [
            'sales_order' => $salesOrder,
            'carriers' => ['FedEx', 'UPS', 'DHL', 'USPS', 'Ground'],
            'shipping_methods' => ['Standard', 'Express', 'Overnight', 'Ground'],
            'can' => [
                'ship' => Gate::allows('ship', $salesOrder),
            ]
        ]);
    }

    /**
     * Render pending approvals page
     */
    protected function renderPendingApprovals($salesOrders): Response
    {
        return Inertia::render('admin/sales-orders/PendingApprovals', [
            'sales_orders' => $salesOrders,
            'can' => [
                'approve' => Auth::user()->can('approveAny', SalesOrder::class),
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
            ]
        ]);
    }

    /**
     * Render overdue sales orders page
     */
    protected function renderOverdue($salesOrders): Response
    {
        return Inertia::render('admin/sales-orders/Overdue', [
            'sales_orders' => $salesOrders,
            'can' => [
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
                'update' => Auth::user()->can('updateAny', SalesOrder::class),
            ]
        ]);
    }

    /**
     * Render unfulfilled orders page
     */
    protected function renderUnfulfilled($salesOrders): Response
    {
        return Inertia::render('admin/sales-orders/Unfulfilled', [
            'sales_orders' => $salesOrders,
            'can' => [
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
                'fulfill' => Auth::user()->can('fulfillAny', SalesOrder::class),
            ]
        ]);
    }

    /**
     * Render fulfilled but unshipped orders page
     */
    protected function renderFulfilledUnshipped($salesOrders): Response
    {
        return Inertia::render('admin/sales-orders/FulfilledUnshipped', [
            'sales_orders' => $salesOrders,
            'can' => [
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
                'ship' => Auth::user()->can('shipAny', SalesOrder::class),
            ]
        ]);
    }

    /**
     * Render customer orders page
     */
    protected function renderCustomerOrders($salesOrders, string $customerName): Response
    {
        return Inertia::render('admin/sales-orders/ByCustomer', [
            'sales_orders' => $salesOrders,
            'customer_name' => $customerName,
            'can' => [
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
            ]
        ]);
    }

    /**
     * Render payment status orders page
     */
    protected function renderPaymentStatusOrders($salesOrders, string $paymentStatus): Response
    {
        return Inertia::render('admin/sales-orders/ByPaymentStatus', [
            'sales_orders' => $salesOrders,
            'payment_status' => $paymentStatus,
            'payment_statuses' => SalesOrder::PAYMENT_STATUSES,
            'can' => [
                'viewAny' => Gate::allows('viewAny', SalesOrder::class),
                'update' => Auth::user()->can('updateAny', SalesOrder::class),
            ]
        ]);
    }
}
