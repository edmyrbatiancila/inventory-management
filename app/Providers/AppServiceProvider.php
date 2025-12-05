<?php

namespace App\Providers;

use App\Contracts\ContactLogRepositoryInterface;
use App\Contracts\CustomerRepositoryInterface;
use App\Contracts\SupplierRepositoryInterface;
use App\Repositories\ContactLogRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\Interfaces\InventoryRepositoryInterface;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use App\Repositories\Interfaces\PurchaseOrderRepositoryInterface;
use App\Repositories\Interfaces\SalesOrderRepositoryInterface;
use App\Repositories\Interfaces\StockAdjustmentRepositoryInterface;
use App\Repositories\Interfaces\StockMovementRepositoryInterface;
use App\Repositories\Interfaces\StockTransferRepositoryInterface;
use App\Repositories\Interfaces\WarehouseRepositoryInterface;
use App\Repositories\InventoryRepository;
use App\Repositories\ProductRepository;
use App\Repositories\PurchaseOrderRepository;
use App\Repositories\SalesOrderRepository;
use App\Repositories\StockAdjustmentRepository;
use App\Repositories\StockMovementRepository;
use App\Repositories\StockTransferRepository;
use App\Repositories\SupplierRepository;
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
        $this->app->bind(StockMovementRepositoryInterface::class, StockMovementRepository::class);
        $this->app->bind(PurchaseOrderRepositoryInterface::class, PurchaseOrderRepository::class);
        $this->app->bind(SalesOrderRepositoryInterface::class, SalesOrderRepository::class);
        $this->app->bind(SupplierRepositoryInterface::class, SupplierRepository::class);
        $this->app->bind(CustomerRepositoryInterface::class, CustomerRepository::class);
        $this->app->bind(ContactLogRepositoryInterface::class, ContactLogRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
