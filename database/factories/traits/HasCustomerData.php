<?php

namespace Database\Factories\Traits;

trait HasCustomerData
{
    /**
     * Generate realistic customer data
     */
    protected function generateCustomerData(): array
    {
        $customers = [
            [
                'name' => 'Acme Corporation',
                'email' => 'orders@acmecorp.com',
                'phone' => '+1-555-1001',
                'contact_person' => 'Alice Williams',
                'address' => '123 Business Plaza, Los Angeles, CA 90210'
            ],
            [
                'name' => 'Metro Retail Group',
                'email' => 'purchasing@metroretail.com',
                'phone' => '+1-555-1002',
                'contact_person' => 'David Martinez',
                'address' => '456 Shopping Center Dr, Miami, FL 33101'
            ],
            [
                'name' => 'TechStart Solutions',
                'email' => 'procurement@techstart.io',
                'phone' => '+1-555-1003',
                'contact_person' => 'Jennifer Lee',
                'address' => '789 Innovation Way, Austin, TX 78701'
            ],
            [
                'name' => 'Global Enterprises Ltd',
                'email' => 'orders@globalent.com',
                'phone' => '+1-555-1004',
                'contact_person' => 'Mark Thompson',
                'address' => '321 Corporate Blvd, Seattle, WA 98101'
            ],
            [
                'name' => 'Regional Distribution Co.',
                'email' => 'buyers@regionaldist.com',
                'phone' => '+1-555-1005',
                'contact_person' => 'Lisa Garcia',
                'address' => '654 Distribution Center, Phoenix, AZ 85001'
            ]
        ];

        $customer = $this->faker->randomElement($customers);

        return [
            'customer_name' => $customer['name'],
            'customer_email' => $customer['email'],
            'customer_phone' => $customer['phone'],
            'customer_contact_person' => $customer['contact_person'],
            'customer_address' => $customer['address'],
            'shipping_address' => $this->faker->optional(0.8)->randomElement([
                $customer['address'], // Same as billing address
                $this->faker->streetAddress . ', ' . $this->faker->city . ', ' . $this->faker->stateAbbr . ' ' . $this->faker->postcode,
            ]),
            'customer_reference' => $this->faker->optional(0.6)->regexify('[A-Z]{3}-[0-9]{5}'),
        ];
    }
}