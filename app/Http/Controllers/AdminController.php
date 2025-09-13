<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Models\Category;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function indexCategory()
    {
        $categories = Category::select('id', 'name', 'description', 'created_at')
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/category/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function createCategory()
    {
        return Inertia::render('admin/category/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storeCategory(StoreAdminRequest $request)
    {
        Category::create($request->validated());

        return redirect()->route('admin.category.index')->with('success', 'Category successfully created');
    }

    /**
     * Display the specified resource.
     */
    public function show(Admin $admin)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Admin $admin)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdminRequest $request, Admin $admin)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Admin $admin)
    {
        //
    }
}
