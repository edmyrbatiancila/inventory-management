<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating Suppliers...');

        // Create different types of suppliers
        $this->createSuppliersByStatus();
        $this->createSuppliersByType();
        $this->createSpecialSuppliers();

        $this->command->info('Suppliers seeding completed!');
    }

    /**
     * Create suppliers with different statuses
     */
    private function createSuppliersByStatus(): void
    {
        $statusDistribution = [
            'active' => 15,
            'pendingApproval' => 3,
            'inactive' => 2,
        ];

        foreach ($statusDistribution as $method => $count) {
            if (method_exists(Supplier::factory(), $method)) {
                Supplier::factory($count)->$method()->create();
            }
        }
    }

    /**
     * Create suppliers with different types
     */
    private function createSuppliersByType(): void
    {
        // Manufacturers (typically larger orders, longer lead times)
        Supplier::factory(8)->manufacturer()->active()->create();
        
        // Distributors (faster delivery, smaller minimums)
        Supplier::factory(10)->distributor()->active()->create();
        
        // Mix of other types
        Supplier::factory(2)->state(['supplier_type' => 'wholesaler'])->active()->create();
        Supplier::factory(1)->state(['supplier_type' => 'retailer'])->active()->create();
        Supplier::factory(1)->state(['supplier_type' => 'service_provider'])->active()->create();
    }

    /**
     * Create special category suppliers
     */
    private function createSpecialSuppliers(): void
    {
        // Preferred vendors (top performers)
        Supplier::factory(5)->preferredVendor()->highRated()->create();
        
        // High-rated active suppliers
        Supplier::factory(3)->active()->highRated()->create();
        
        // Recent suppliers pending approval
        Supplier::factory(2)->pendingApproval()->state([
            'created_at' => now()->subDays(rand(1, 7))
        ])->create();
    }
}
