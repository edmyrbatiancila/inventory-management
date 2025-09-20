<?php

namespace App\Models;

use App\Traits\HasSearchAndFilter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, SoftDeletes, HasSearchAndFilter;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'category_id',
        'brand_id',
        'is_active',
        'sku',
        'barcode',
        'cost_price',
        'slug',
        'min_stock_level', 
        'max_stock_level',
        'images',
        'specifications', 
        'track_quantity'
    ];

    protected $casts = [
        'images' => 'array',
        'specifications' => 'array',
        'is_active' => 'boolean',
        'track_quantity' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand() {

        return $this->belongsTo(Brand::class);
    }
}
