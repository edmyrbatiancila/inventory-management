<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    private $faker;

    public function __construct()
    {
        $this->faker = \Faker\Factory::create();
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating Customers...');

        // Create different types of customers
        $this->createCustomersByType();
        $this->createCustomersByPriority();
        $this->createCustomersByStatus();

        $this->command->info('Customers seeding completed!');
    }

    /**
     * Create customers with different types
     */
    private function createCustomersByType(): void
    {
        // Individual customers
        Customer::factory(12)->individual()->state(['status' => 'active'])->create();
        
        // Business customers (majority)
        Customer::factory(25)->business()->state(['status' => 'active'])->create();
        
        // Government customers
        Customer::factory(3)->state([
            'customer_type' => 'government',
            'status' => 'active',
            'payment_terms' => 'net_45',
            'credit_limit' => $this->faker->randomFloat(2, 50000, 200000)
        ])->create();
        
        // Non-profit customers
        Customer::factory(2)->state([
            'customer_type' => 'non_profit',
            'status' => 'active',
            'tax_exempt' => true,
            'default_discount_percentage' => 10.00
        ])->create();
    }

    /**
     * Create customers with different priorities
     */
    private function createCustomersByPriority(): void
    {
        // VIP customers (high value, special treatment)
        Customer::factory(8)->vip()->create();
        
        // High priority customers
        Customer::factory(6)->highValue()->create();
        
        // Regular customers are created in other methods
    }

    /**
     * Create customers with different statuses
     */
    private function createCustomersByStatus(): void
    {
        // Prospects (potential customers)
        Customer::factory(10)->prospect()->create();
        
        // Suspended customers
        Customer::factory(3)->suspended()->create();
        
        // Inactive customers
        Customer::factory(2)->state(['status' => 'inactive'])->create();
    }
}
