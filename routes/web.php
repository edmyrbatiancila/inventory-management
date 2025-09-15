<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
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
    Route::get('/admin/category', [AdminController::class, 'indexCategory'])->name('admin.category.index'); // List for categories
    Route::get('/admin/category/create', [AdminController::class, 'createCategory'])->name('admin.category.create'); // Show create category form
    Route::post('/admin/category/store', [AdminController::class, 'storeCategory'])->name('admin.category.store'); // Handle create category form submission
    Route::get('/admin/category/{id}/edit', [AdminController::class, 'editCategory'])->name('admin.category.edit'); // Show edit category form
    Route::put('/admin/category/{category}', [AdminController::class, 'updateCategory'])->name('admin.category.update'); // Update category
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
