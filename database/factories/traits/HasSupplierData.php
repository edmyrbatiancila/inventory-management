<?php

namespace Database\Factories\Traits;

trait HasSupplierData
{
    /**
     * Generate realistic supplier data
     */
    protected function generateSupplierData(): array
    {
        $suppliers = [
            [
                'name' => 'Tech Solutions Inc.',
                'email' => 'orders@techsolutions.com',
                'phone' => '+1-555-0123',
                'contact_person' => 'John Smith',
                'address' => '123 Technology Drive, Silicon Valley, CA 94025'
            ],
            [
                'name' => 'Global Supply Co.',
                'email' => 'procurement@globalsupply.com',
                'phone' => '+1-555-0234',
                'contact_person' => 'Sarah Johnson',
                'address' => '456 Commerce Street, New York, NY 10001'
            ],
            [
                'name' => 'Industrial Equipment Ltd.',
                'email' => 'sales@indequip.com',
                'phone' => '+1-555-0345',
                'contact_person' => 'Michael Brown',
                'address' => '789 Manufacturing Blvd, Detroit, MI 48201'
            ],
            [
                'name' => 'Office Supplies Direct',
                'email' => 'orders@officesupplies.com',
                'phone' => '+1-555-0456',
                'contact_person' => 'Emily Davis',
                'address' => '321 Business Park, Chicago, IL 60601'
            ],
            [
                'name' => 'Premium Materials Corp.',
                'email' => 'info@premiummaterials.com',
                'phone' => '+1-555-0567',
                'contact_person' => 'Robert Wilson',
                'address' => '654 Industrial Way, Houston, TX 77001'
            ]
        ];

        $supplier = $this->faker->randomElement($suppliers);

        return [
            'supplier_name' => $supplier['name'],
            'supplier_email' => $supplier['email'],
            'supplier_phone' => $supplier['phone'],
            'supplier_contact_person' => $supplier['contact_person'],
            'supplier_address' => $supplier['address'],
            'supplier_reference' => $this->faker->optional(0.7)->regexify('[A-Z]{2}-[0-9]{6}'),
        ];
    }
}