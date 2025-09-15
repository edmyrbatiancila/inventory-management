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
     * Display a listing of the category resource.
     */
    public function indexCategory()
    {
        $sort = request()->input('sort', 'newest');
        $categories = Category::select('id', 'name', 'description', 'created_at')
            ->searchAndFilter(request(), ['name', 'description'], 'created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/category/Index', [
            'categories' => $categories,
            'sort' => $sort,
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
    public function editCategory(Category $category)
    {
        
        return Inertia::render('admin/category/Edit', [
            'category' => $category
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function updateCategory(UpdateAdminRequest $request, Category $category)
    {
        $category->update($request->validated());
        return redirect()->route('admin.category.index')->with('success', 'Category successfully updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Admin $admin)
    {
        //
    }
}
