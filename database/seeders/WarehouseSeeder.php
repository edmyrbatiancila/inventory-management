<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating warehouses...');

        // Create 3 regular warehouses using default factory
        Warehouse::factory()
            ->count(3)
            ->create();

        // Create 2 distribution centers
        Warehouse::factory()
            ->distributionCenter()
            ->count(2)
            ->create();

        // Create 2 regional hubs
        Warehouse::factory()
            ->regionalHub()
            ->count(2)
            ->create();

        // Create 3 retail stores
        Warehouse::factory()
            ->retailStore()
            ->count(3)
            ->create();

        // Create specific demo warehouses
        $this->createSpecificWarehouses();

        $this->command->info('Warehouses created successfully!');
    }

    private function createSpecificWarehouses(): void
    {
        // Main Distribution Center
        Warehouse::factory()->create([
            'name' => 'Main Distribution Center',
            'code' => 'MAIN-DC',
            'address' => '1234 Industrial Blvd',
            'city' => 'Los Angeles',
            'state' => 'California',
            'postal_code' => '90210',
            'country' => 'United States',
            'phone' => '+1-555-123-4567',
            'email' => 'main.dc@inventrackapp.com',
            'is_active' => true
        ]);

        // East Coast Hub
        Warehouse::factory()->create([
            'name' => 'East Coast Regional Hub',
            'code' => 'EAST-HUB',
            'address' => '5678 Commerce Way',
            'city' => 'New York',
            'state' => 'New York',
            'postal_code' => '10001',
            'country' => 'United States',
            'phone' => '+1-555-987-6543',
            'email' => 'east.hub@inventrackapp.com',
            'is_active' => true
        ]);

        // West Coast Storage
        Warehouse::factory()->create([
            'name' => 'West Coast Storage Facility',
            'code' => 'WEST-SF',
            'address' => '9999 Storage Lane',
            'city' => 'San Francisco',
            'state' => 'California',
            'postal_code' => '94102',
            'country' => 'United States',
            'phone' => '+1-555-456-7890',
            'email' => 'west.storage@inventrackapp.com',
            'is_active' => true
        ]);

        // Inactive warehouse for testing
        Warehouse::factory()->create([
            'name' => 'Old Warehouse - Closed',
            'code' => 'OLD-WH',
            'address' => '1111 Abandoned St',
            'city' => 'Detroit',
            'state' => 'Michigan',
            'postal_code' => '48201',
            'country' => 'United States',
            'phone' => null,
            'email' => null,
            'is_active' => false
        ]);
    }

}
