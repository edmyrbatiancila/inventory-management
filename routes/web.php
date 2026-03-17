<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InsightsController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\SalesOrderController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [UserController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

// Admin Routes:
Route::middleware(['auth', 'admin'])->group(function () {

    // Category Routes:
    Route::get('/admin/categories', [AdminController::class, 'indexCategory'])->name('admin.category.index'); // List for categories
    Route::get('/admin/categories/create', [AdminController::class, 'createCategory'])->name('admin.category.create'); // Show create category form
    Route::post('/admin/categories/store', [AdminController::class, 'storeCategory'])->name('admin.category.store'); // Handle create category form submission
    Route::get('/admin/categories/{category}/edit', [AdminController::class, 'editCategory'])->name('admin.category.edit'); // Show edit category form
    Route::put('/admin/categories/{category}', [AdminController::class, 'updateCategory'])->name('admin.category.update'); // Update category
    Route::delete('/admin/categories/{category}', [AdminController::class, 'destroyCategory'])->name('admin.category.destroy'); // Delete category

    // Brand Routes:
    Route::get('/admin/brands', [AdminController::class, 'indexBrand'])->name('admin.brand.index'); // Index page for brands
    Route::get('/admin/brands/create', [AdminController::class, 'createBrand'])->name('admin.brand.create'); // Show create brand form
    Route::post('/admin/brands/store', [AdminController::class, 'storeBrand'])->name('admin.brand.store'); // Handle create brand form submission
    Route::get('/admin/brands/{brand}/edit', [AdminController::class, 'editBrand'])->name('admin.brand.edit'); // Show edit brand form
    Route::put('/admin/brands/{brand}', [AdminController::class, 'updateBrand'])->name('admin.brand.update'); // Update brand
    Route::delete('/admin/brands/{brand}', [AdminController::class, 'destroyBrand'])->name('admin.brand.destroy'); // Delete brand

    // Product Routes:
    // Route::get('/admin/products', [ProductController::class,'index'])->name('admin.products.index');
    // Route::get('/admin/products/create', [ProductController::class, 'create'])->name('admin.products.create'); // Show create product form
    // Route::post('/admin/products', [ProductController::class, 'store'])->name('admin.products.store'); // Handle create product form submission
    // Route::get('/admin/products/{id}', [ProductController::class, 'show'])->name('admin.products.show'); // Show single product details
    // Route::get('/admin/products/{id}/edit', [ProductController::class, 'edit'])->name('admin.products.edit'); // Show edit product form
    // Route::put('/admin/products/{id}', [ProductController::class, 'update'])->name('admin.products.update'); // Update product
    // Route::delete('/admin/products/{id}', [ProductController::class, 'destroy'])->name('admin.products.destroy'); // Delete product

    // Business Intelligence Routes:
    // Route::get('/admin/products/reports/low-stock', [ProductController::class, 'lowStock'])->name('admin.products.low-stock'); // Low stock report
    // Route::get('/admin/products/reports/needing-reorder', [ProductController::class, 'needingReorder'])->name('admin.products.needing-reorder'); // Reorder report
    // Route::get('/admin/products/{id}/check-availability', [ProductController::class, 'checkAvailability'])->name('admin.products.check-availability'); // Check product availability

    Route::prefix('admin')->name('admin.')->group(function () {
        // Product Routes:
        Route::resource('products', ProductController::class)->except(['lowStock', 'needingReorder', 'checkAvailability']);
        Route::get('/products/reports/low-stock', [ProductController::class, 'lowStock'])->name('products.reports.low-stock');
        Route::get('/products/reports/needing-reorder', [ProductController::class, 'needingReorder'])->name('products.reports.needing-reorder');
        Route::get('/products/{id}/check-availability', [ProductController::class, 'checkAvailability'])->name('products.check-availability');

        // Product Advanced Search Route:
        Route::post('/products/advanced-search', [ProductController::class, 'advancedSearch'])->name('products.advanced-search');

        // Warehouse Routes:
        Route::resource('warehouses', WarehouseController::class)->except(['analytics']);
        Route::get('/warehouses/{id}/analytics', [WarehouseController::class, 'analytics'])
            ->name('warehouses.analytics');

        // Warehouse Advanced Search Route:
        Route::post('/warehouses/advanced-search', [WarehouseController::class, 'advancedSearch'])->name('warehouses.advanced-search');

        // Inventory Routes:
        Route::resource('inventories', InventoryController::class);
        Route::post('/inventories/{id}/adjust', [InventoryController::class, 'adjustStock'])->name('inventories.adjust');
        Route::post('/inventories/transfer', [InventoryController::class, 'transferStock'])->name('inventories.transfer');
        Route::get('/inventories/reports/low-stock', [InventoryController::class, 'lowStockReport'])->name('inventories.reports.low-stock');

        // Inventory Advanced Search Route:
        Route::post('/inventories/advanced-search', [InventoryController::class, 'advancedSearch'])->name('inventories.advanced-search');

        // Stock Adjustment Routes:
        Route::resource('stock-adjustments', StockAdjustmentController::class)->parameters([
            'stock-adjustments' => 'stockAdjustment',
        ]);
        Route::get('/api/stock-adjustments/inventory/{inventoryId}', [StockAdjustmentController::class, 'getByInventory'])->name('api.stock-adjustments.by-inventory');

        // Stock Transfer Routes:
        Route::resource('stock-transfers', StockTransferController::class)->parameters([
            'stock-transfers' => 'stockTransfer',
        ]);

        // Additional workflow routes
        Route::patch('/stock-transfers/{stockTransfer}/approve', [StockTransferController::class, 'approve'])
            ->name('stock-transfers.approve');
        Route::patch('/stock-transfers/{stockTransfer}/mark-in-transit', [StockTransferController::class, 'markInTransit'])
            ->name('stock-transfers.mark-in-transit');
        Route::patch('/stock-transfers/{stockTransfer}/complete', [StockTransferController::class, 'complete'])
            ->name('stock-transfers.complete');

        Route::post('/stock-transfers/bulk-approve', [StockTransferController::class, 'bulkApprove'])
            ->name('stock-transfers.bulk-approve');
        Route::post('/stock-transfers/bulk-cancel', [StockTransferController::class, 'bulkCancel'])
            ->name('stock-transfers.bulk-cancel');

        // Stock Movement Routes:
        Route::resource('stock-movements', StockMovementController::class)->parameters([
            'stock-movements' => 'stockMovement',
        ]);
        Route::post('stock-movements/{id}/approve', [StockMovementController::class, 'approve'])->name('stock-movements.approve');
        Route::post('stock-movements/{id}/reject', [StockMovementController::class, 'reject'])->name('stock-movements.reject');
        Route::get('stock-movements/api/analytics', [StockMovementController::class, 'analytics'])->name('stock-movements.api.analytics');

        // Stock Movement Advanced Search Route:
        Route::post('stock-movements/advanced-search', [StockMovementController::class, 'advancedSearch'])->name('stock-movements.advanced-search');

        // =========== Purchase Order Routes ============

        Route::resource('purchase-orders', PurchaseOrderController::class)->parameters([
            'purchase-orders' => 'purchaseOrder',
        ]);

        // Purchase Order Status Actions
        Route::prefix('purchase-orders/{purchaseOrder}')->name('purchase-orders.')->group(function () {
            Route::post('approve', [PurchaseOrderController::class, 'approve'])->name('approve');
            Route::post('send-to-supplier', [PurchaseOrderController::class, 'sendToSupplier'])->name('send-to-supplier');
            Route::post('cancel', [PurchaseOrderController::class, 'cancel'])->name('cancel');
            Route::get('receive', [PurchaseOrderController::class, 'showReceive'])->name('receive'); // GET for show receive page
            Route::post('receive', [PurchaseOrderController::class, 'receive'])->name('receive.submit'); // POST for processing
        });

        // Purchase Order Item Actions
        Route::prefix('purchase-orders/{purchaseOrder}/items')->name('purchase-orders.items.')->group(function () {
            Route::post('/', [PurchaseOrderController::class, 'addItem'])->name('store');
            Route::put('{item}', [PurchaseOrderController::class, 'updateItem'])->name('update');
            Route::delete('{item}', [PurchaseOrderController::class, 'removeItem'])->name('destroy');
        });

        // Quick Actions & Reports
        Route::prefix('purchase-orders-reports')->name('purchase-orders.reports.')->group(function () {
            Route::get('pending-approvals', [PurchaseOrderController::class, 'pendingApprovals'])->name('pending-approvals');
            Route::get('overdue', [PurchaseOrderController::class, 'overdue'])->name('overdue');
            Route::get('statistics', [PurchaseOrderController::class, 'statistics'])->name('statistics');
        });

        // ===================== Sales Order Routes =====================
        Route::resource('sales-orders', SalesOrderController::class)->parameters([
            'sales-orders' => 'salesOrder',
        ]);

        // Sales Order Status Actions
        Route::prefix('sales-orders/{salesOrder}')->name('sales-orders.')->group(function () {
            Route::post('approve', [SalesOrderController::class, 'approve'])->name('approve');
            Route::post('confirm', [SalesOrderController::class, 'confirm'])->name('confirm');
            Route::post('cancel', [SalesOrderController::class, 'cancel'])->name('cancel');
            Route::get('fulfill', [SalesOrderController::class, 'showFulfill'])->name('fulfill'); // GET for show fulfill page
            Route::post('fulfill', [SalesOrderController::class, 'fulfill'])->name('fulfill.submit'); // POST for processing
            Route::post('ship', [SalesOrderController::class, 'ship'])->name('ship');
            Route::post('deliver', [SalesOrderController::class, 'deliver'])->name('deliver');
        });

        // Sales Order Item Actions
        Route::prefix('sales-orders/{salesOrder}/items')->name('sales-orders.items.')->group(function () {
            Route::post('/', [SalesOrderController::class, 'addItem'])->name('store');
            Route::put('{item}', [SalesOrderController::class, 'updateItem'])->name('update');
            Route::delete('{item}', [SalesOrderController::class, 'removeItem'])->name('destroy');
        });

        // Quick Actions & Reports
        Route::prefix('sales-orders-reports')->name('sales-orders.reports.')->group(function () {
            Route::get('pending-approvals', [SalesOrderController::class, 'pendingApprovals'])->name('pending-approvals');
            Route::get('overdue', [SalesOrderController::class, 'overdue'])->name('overdue');
            Route::get('fulfilled-unshipped', [SalesOrderController::class, 'fulfilledUnshipped'])->name('fulfilled-unshipped');
            Route::get('statistics', [SalesOrderController::class, 'statistics'])->name('statistics');
        });

        // ============= Sprint 8: Advanced Analytics & Reporting =============

        // Analytics Reports
        Route::resource('analytics', AnalyticsController::class)->parameters([
            'analytics' => 'analyticsReport',
        ]);
        Route::post('analytics/{analyticsReport}/generate', [AnalyticsController::class, 'generate'])->name('analytics.generate');
        Route::get('analytics/{analyticsReport}/export', [AnalyticsController::class, 'export'])->name('analytics.export');
        Route::get('analytics-dashboard', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');

        // Dashboard Management
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
        Route::get('/dashboard/widgets', [DashboardController::class, 'widgets'])->name('dashboard.widgets');
        Route::get('/dashboard/widgets/create', [DashboardController::class, 'createWidget'])->name('dashboard.widgets.create');
        Route::post('/dashboard/widgets', [DashboardController::class, 'storeWidget'])->name('dashboard.widgets.store');
        Route::get('/dashboard/widgets/{widget}/edit', [DashboardController::class, 'editWidget'])->name('dashboard.widgets.edit');
        Route::put('/dashboard/widgets/{widget}', [DashboardController::class, 'updateWidget'])->name('dashboard.widgets.update');
        Route::delete('/dashboard/widgets/{widget}', [DashboardController::class, 'destroyWidget'])->name('dashboard.widgets.destroy');
        Route::post('/dashboard/widgets/{widget}/refresh', [DashboardController::class, 'refreshWidget'])->name('dashboard.widgets.refresh');
        Route::patch('/dashboard/layout', [DashboardController::class, 'updateLayout'])->name('dashboard.layout.update');

        // Business Insights
        Route::resource('insights', InsightsController::class)->only(['index', 'show']);
        Route::post('insights/{insight}/acknowledge', [InsightsController::class, 'acknowledge'])->name('insights.acknowledge');
        Route::post('insights/{insight}/assign', [InsightsController::class, 'assign'])->name('insights.assign');
        Route::patch('insights/{insight}/status', [InsightsController::class, 'updateStatus'])->name('insights.status');
        Route::post('insights/{insight}/feedback', [InsightsController::class, 'feedback'])->name('insights.feedback');
        Route::post('insights/detect', [InsightsController::class, 'detect'])->name('insights.detect');
        Route::post('insights/bulk-action', [InsightsController::class, 'bulkAction'])->name('insights.bulk-action');

        // ============= Supplier & Customer Management =============

        // Supplier Management Routes
        Route::prefix('suppliers')->name('suppliers.')->group(function () {
            Route::get('/', [SupplierController::class, 'index'])->name('index');
            Route::get('/create', [SupplierController::class, 'create'])->name('create');
            Route::post('/', [SupplierController::class, 'store'])->name('store');
            Route::get('/search', [SupplierController::class, 'search'])->name('search'); // Must be before {id} routes
            Route::get('/{supplier}', [SupplierController::class, 'show'])->name('show');
            Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('edit');
            Route::put('/{supplier}', [SupplierController::class, 'update'])->name('update');
            Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
            Route::get('/{id}/metrics', [SupplierController::class, 'getMetrics'])->name('metrics');
        });

        // Customer Management Routes (for future implementation)
        Route::prefix('customers')->name('customers.')->group(function () {
            Route::get('/', [CustomerController::class, 'index'])->name('index');
            Route::get('/create', [CustomerController::class, 'create'])->name('create');
            Route::post('/', [CustomerController::class, 'store'])->name('store');
            Route::get('/search', [CustomerController::class, 'search'])->name('search');
            Route::get('/{customer}', [CustomerController::class, 'show'])->name('show');
            Route::get('/{customer}/edit', [CustomerController::class, 'edit'])->name('edit');
            Route::put('/{customer}', [CustomerController::class, 'update'])->name('update');
            Route::delete('/{customer}', [CustomerController::class, 'destroy'])->name('destroy');
            Route::get('/{id}/metrics', [CustomerController::class, 'getMetrics'])->name('metrics');
        });
    });
});

// Inventory availability check route (moved outside admin middleware for AJAX accessibility)
Route::middleware(['auth'])->group(function () {
    Route::get('/api/stock-transfers/check-inventory', [StockTransferController::class, 'checkInventoryAvailability'])
        ->name('api.stock-transfers.check-inventory');
    Route::get('/api/stock-transfers/products-with-inventory', [StockTransferController::class, 'getProductsWithInventory'])
        ->name('api.stock-transfers.products-with-inventory');
});

// Temporary test route without middleware for debugging
Route::get('/test/inventory-check', [StockTransferController::class, 'checkInventoryAvailability'])
    ->name('test.inventory-check');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
