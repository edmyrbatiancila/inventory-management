<?php

namespace Database\Seeders;

use App\Models\ContactLog;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContactLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating Contact Logs...');

        $this->createSupplierContactLogs();
        $this->createCustomerContactLogs();
        $this->createUrgentContactLogs();

        $this->command->info('Contact Logs seeding completed!');
    }

    /**
     * Create contact logs for suppliers
     */
    private function createSupplierContactLogs(): void
    {
        $suppliers = Supplier::active()->limit(15)->get();
        
        foreach ($suppliers as $supplier) {
            // Each supplier gets 1-5 contact logs
            $contactCount = rand(1, 5);
            ContactLog::factory($contactCount)->forSupplier($supplier)->create();
        }
        
        // Some additional supplier contacts
        ContactLog::factory(20)->forSupplier()->create();
    }

    /**
     * Create contact logs for customers
     */
    private function createCustomerContactLogs(): void
    {
        $customers = Customer::active()->limit(20)->get();
        
        foreach ($customers as $customer) {
            // Each customer gets 1-4 contact logs
            $contactCount = rand(1, 4);
            ContactLog::factory($contactCount)->forCustomer($customer)->create();
        }
        
        // VIP customers get more contact logs
        $vipCustomers = Customer::where('customer_priority', 'vip')->get();
        foreach ($vipCustomers as $vipCustomer) {
            ContactLog::factory(rand(3, 8))->forCustomer($vipCustomer)->create();
        }
        
        // Some additional customer contacts
        ContactLog::factory(25)->forCustomer()->create();
    }

    /**
     * Create urgent and follow-up contact logs
     */
    private function createUrgentContactLogs(): void
    {
        // Urgent contact logs that need immediate attention
        ContactLog::factory(5)->urgent()->forSupplier()->create();
        ContactLog::factory(8)->urgent()->forCustomer()->create();
        
        // Contact logs that need follow-up
        ContactLog::factory(12)->needsFollowUp()->forSupplier()->create();
        ContactLog::factory(15)->needsFollowUp()->forCustomer()->create();
    }
}
