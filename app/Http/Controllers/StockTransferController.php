<?php

namespace App\Http\Controllers;

use App\Models\StockTransfer;
use App\Http\Requests\StoreStockTransferRequest;
use App\Http\Requests\UpdateStockTransferRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\StockTransferService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StockTransferController extends Controller
{
    public function __construct(
        private StockTransferService $stockTransferService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'warehouse_id', 'product_id', 'search', 'per_page']);
        $transfers = $this->stockTransferService->searchTransfers($filters);

        return Inertia::render('admin/stock-transfers/Index', [
            'transfers' => $transfers,
            'filters' => $filters,
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'products' => Product::select('id', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/stock-transfers/Create', [
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'products' => Product::with('category')->select('id', 'name', 'category_id')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStockTransferRequest $request)
    {
        try {
            $transfer = $this->stockTransferService->initiateTransfer($request->validated());
            return redirect()
                ->route('admin.stock-transfers.show', $transfer)
                ->with('success', 'Stock transfer initiated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(StockTransfer $stockTransfer)
    {
        $stockTransfer->load(['fromWarehouse', 'toWarehouse', 'product', 'initiatedBy', 'approvedBy', 'completedBy']);

        return Inertia::render('admin/stock-transfers/Show', [
            'transfer' => $stockTransfer,
            'canApprove' => $stockTransfer->canBeApproved(),
            'canMarkInTransit' => $stockTransfer->canBeMarkedInTransit(),
            'canComplete' => $stockTransfer->canBeCompleted(),
            'canCancel' => $stockTransfer->canBeCancelled(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StockTransfer $stockTransfer)
    {
        return Inertia::render('admin/stock-transfers/Edit', [
            'transfer' => $stockTransfer->load(['fromWarehouse', 'toWarehouse', 'product']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStockTransferRequest $request, StockTransfer $stockTransfer)
    {
        try {
            $data = $request->validated();
            
            if (isset($data['transfer_status'])) {
                switch ($data['transfer_status']) {
                    case StockTransfer::STATUS_APPROVED:
                        $stockTransfer = $this->stockTransferService->approveTransfer($stockTransfer->id, Auth::id());
                        break;
                    case StockTransfer::STATUS_IN_TRANSIT:
                        $stockTransfer = $this->stockTransferService->markInTransit($stockTransfer->id);
                        break;
                    case StockTransfer::STATUS_COMPLETED:
                        $stockTransfer = $this->stockTransferService->completeTransfer($stockTransfer->id, Auth::id());
                        break;
                    case StockTransfer::STATUS_CANCELLED:
                        $stockTransfer = $this->stockTransferService->cancelTransfer($stockTransfer->id, $data['cancellation_reason'] ?? 'Manual cancellation');
                        break;
                }
            }

            return redirect()
                ->route('admin.stock-transfers.show', $stockTransfer)
                ->with('success', 'Stock transfer updated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockTransfer $stockTransfer)
    {
        if (!$stockTransfer->canBeCancelled()) {
            return back()->withErrors(['error' => 'This transfer cannot be deleted.']);
        }

        try {
            $this->stockTransferService->cancelTransfer($stockTransfer->id, 'Transfer deleted');
            return redirect()->route('admin.stock-transfers.index')
                ->with('success', 'Stock transfer cancelled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Additional workflow methods
    public function approve(StockTransfer $stockTransfer)
    {
        try {
            $transfer = $this->stockTransferService->approveTransfer($stockTransfer->id, Auth::id());
            return redirect()->route('admin.stock-transfers.show', $transfer->id)
                ->with('success', 'Transfer approved successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function markInTransit(StockTransfer $stockTransfer)
    {
        try {
            $transfer = $this->stockTransferService->markInTransit($stockTransfer->id);
            return redirect()->route('admin.stock-transfers.show', $transfer->id)
                ->with('success', 'Transfer marked as in transit.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function complete(StockTransfer $stockTransfer)
    {
        try {
            $transfer = $this->stockTransferService->completeTransfer($stockTransfer->id, Auth::id());
            return redirect()->route('admin.stock-transfers.show', $transfer->id)
                ->with('success', 'Transfer completed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
