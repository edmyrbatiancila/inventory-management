<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasSearchAndFilter
{
    /**
     * Apply search and sort filters to a query builder.
     *
     * @param  Builder $query
     * @param  Request $request
     * @param  array $searchableColumns
     * @param  string $defaultSortColumn
     * @return Builder
     */
    public function scopeSearchAndFilter(Builder $query, Request $request, array $searchableColumns = ['name'], string $defaultSortColumn = 'created_at')
    {
        // Search
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search, $searchableColumns) {
                foreach ($searchableColumns as $col) {
                    $q->orWhere($col, 'like', "%$search%");
                }
            });
        }

        // Sort
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'oldest':
                $query->orderBy($defaultSortColumn, 'asc');
                break;
            case 'az':
                $query->orderBy('name', 'asc');
                break;
            case 'za':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy($defaultSortColumn, 'desc');
                break;
        }

        return $query;
    }
}
