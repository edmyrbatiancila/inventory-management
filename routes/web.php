<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
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

        // Warehouse Routes:
        Route::resource('warehouses', WarehouseController::class)->except(['analytics']);
        Route::get('/warehouses/{id}/analytics', [WarehouseController::class, 'analytics'])
            ->name('warehouses.analytics');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
