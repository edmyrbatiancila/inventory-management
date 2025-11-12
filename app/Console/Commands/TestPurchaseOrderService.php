<?php

namespace App\Console\Commands;

use App\Services\PurchaseOrderService;
use Illuminate\Console\Command;

class TestPurchaseOrderService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:purchase-order-service';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test PurchaseOrderService removeItem method';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = app(PurchaseOrderService::class);
        
        $this->info('PurchaseOrderService instantiated successfully');
        
        if (method_exists($service, 'removeItem')) {
            $this->info('✅ removeItem method exists');
        } else {
            $this->error('❌ removeItem method does NOT exist');
        }
        
        // Test all methods
        $methods = get_class_methods($service);
        $this->info('Available methods:');
        foreach ($methods as $method) {
            if (!str_starts_with($method, '__')) {
                $this->line("  - {$method}");
            }
        }
        
        return 0;
    }
}
