<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Str;
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
     * Store a newly created resource in storage for category.
     */
    public function storeCategory(StoreCategoryRequest $request)
    {
        Category::create($request->validated());

        return redirect()->route('admin.category.index')->with('success', 'Category successfully created');
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
    public function updateCategory(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return redirect()->route('admin.category.index')->with('success', 'Category successfully updated');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroyCategory(Category $category)
    {
        try {
            $category->delete();
            return redirect()->route('admin.category.index')->with('success', 'Category successfully deleted');
        } catch (\Exception $e) {
            return redirect()->route('admin.category.index')->with('error', 'Failed to delete category. It may be in use.');
        }
    }

    // Brand functions here:
    public function indexBrand()
    {
        $sort = request()->input('sort', 'newest');
        $brands = Brand::select('id', 'name', 'description', 'logo_url', 'website_url', 'created_at')
            ->searchAndFilter(request(), ['name', 'description'], 'created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/brand/Index', [
            'brands' => $brands,
            'sort' => $sort,
        ]);
    }

    public function createBrand()
    {
        return Inertia::render('admin/brand/Create');
    }

    public function storeBrand(StoreBrandRequest $request)
    {
        $validated = $request->validated();

        // Handle logo file upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        } elseif (empty($validated['logo_url'])) {
            $validated['logo_url'] = null;
        }

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
            // Ensure slug is unique by appending a number if needed
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Brand::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        if (empty($validated['website_url'])) {
            $validated['website_url'] = null;
        }

        Brand::create($validated);

        return redirect()->route('admin.brand.index')->with('success', 'Brand successfully created');
    }

    public function editBrand(Brand $brand)
    {
        return Inertia::render('admin/brand/Edit', [
            'brand' => $brand
        ]);
    }

    public function updateBrand(UpdateBrandRequest $request, Brand $brand)
    {
        $validated = $request->validated();

        // Handle file upload
        if ($request->hasFile('logo')) {
            // Delete old logo if it exists
            if ($brand->logo_url && file_exists(public_path('storage/' . $brand->logo_url))) {
                unlink(public_path('storage/' . $brand->logo_url));
            }

            $logoFile = $request->file('logo');
            $logoName = time() . '_' . $logoFile->getClientOriginalName();
            $logoPath = $logoFile->storeAs('brands/logos', $logoName, 'public');
            $validated['logo_url'] = $logoPath;
        }

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;
            
            while (Brand::where('slug', $slug)->where('id', '!=', $brand->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        // Handle nullable fields
        $validated['website_url'] = empty($validated['website_url']) ? null : $validated['website_url'];
        $validated['description'] = empty($validated['description']) ? null : $validated['description'];

        // Update the brand
        $brand->update($validated);

        return redirect()->route('admin.brand.index')->with('success', 'Brand updated successfully.');
    }

    public function destroyBrand(Brand $brand)
    {
        try {
            $brand->delete();
            
            return redirect()->route('admin.brand.index')->with('success', 'Brand successfully deleted');
        } catch (\Exception $e) {
            return redirect()->route('admin.brand.index')->with('error', 'Failed to delete brand. It may be in use.');
        }
    }
}
