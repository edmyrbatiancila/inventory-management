<?php

namespace App\Providers;

use App\Repositories\Interfaces\InventoryRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Interfaces\StockAdjustmentRepositoryInterface;
use App\Repositories\Interfaces\StockTransferRepositoryInterface;
use App\Repositories\Interfaces\WarehouseRepositoryInterface;
use App\Repositories\InventoryRepository;
use App\Repositories\ProductRepository;
use App\Repositories\StockAdjustmentRepository;
use App\Repositories\StockTransferRepository;
use App\Repositories\WarehouseRepository;
use App\Services\StockAdjustmentService;
use App\Services\StockTransferService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(WarehouseRepositoryInterface::class, WarehouseRepository::class);
        $this->app->bind(InventoryRepositoryInterface::class, InventoryRepository::class);
        $this->app->bind(StockAdjustmentRepositoryInterface::class, StockAdjustmentRepository::class);
        $this->app->bind(StockAdjustmentService::class, StockAdjustmentService::class);
        $this->app->bind(StockTransferRepositoryInterface::class, StockTransferRepository::class);
        $this->app->bind(StockTransferService::class, StockTransferService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
