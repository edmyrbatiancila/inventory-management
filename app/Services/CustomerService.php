<?php

namespace App\Services;

use App\Models\ContactLog;
use App\Models\Customer;

class CustomerService
{
    public function generateCustomerCode(): string
    {
        do {
            $code = 'CUS-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        } while (Customer::where('customer_code', $code)->exists());

        return $code;
    }

    public function getFullName(Customer $customer): string
    {
        if ($customer->customer_type === 'individual') {
            return trim($customer->first_name . ' ' . $customer->last_name);
        }
        
        return $customer->trade_name ?: $customer->company_name;
    }

    public function getDisplayName(Customer $customer): string
    {
        return $this->getFullName($customer);
    }

    public function getBillingAddress(Customer $customer): string
    {
        $address = $customer->billing_address_line_1;
        if ($customer->billing_address_line_2) {
            $address .= ', ' . $customer->billing_address_line_2;
        }
        $address .= ', ' . $customer->billing_city;
        if ($customer->billing_state_province) {
            $address .= ', ' . $customer->billing_state_province;
        }
        if ($customer->billing_postal_code) {
            $address .= ' ' . $customer->billing_postal_code;
        }
        $address .= ', ' . $customer->billing_country;
        
        return $address;
    }

    public function getShippingAddress(Customer $customer): string
    {
        if ($customer->same_as_billing) {
            return $this->getBillingAddress($customer);
        }
        
        $address = $customer->shipping_address_line_1;
        if ($customer->shipping_address_line_2) {
            $address .= ', ' . $customer->shipping_address_line_2;
        }
        $address .= ', ' . $customer->shipping_city;
        if ($customer->shipping_state_province) {
            $address .= ', ' . $customer->shipping_state_province;
        }
        if ($customer->shipping_postal_code) {
            $address .= ' ' . $customer->shipping_postal_code;
        }
        $address .= ', ' . $customer->shipping_country;
        
        return $address;
    }

    public function getCreditStatusColor(Customer $customer): string
    {
        return match($customer->credit_status) {
            'good' => 'green',
            'watch' => 'yellow',
            'hold' => 'red',
            'collections' => 'red',
            default => 'gray'
        };
    }

    public function isActive(Customer $customer): bool
    {
        return $customer->status === 'active';
    }

    public function canPlaceOrders(Customer $customer): bool
    {
        return $customer->status === 'active' && $customer->credit_status !== 'hold';
    }

    public function hasAvailableCredit(Customer $customer, float $amount = 0): bool
    {
        return $customer->available_credit >= $amount;
    }

    public function applyDiscount(Customer $customer, float $amount): float
    {
        if ($customer->default_discount_percentage > 0) {
            return $amount * (1 - $customer->default_discount_percentage / 100);
        }
        
        return $amount;
    }

    public function updateCustomerMetrics(Customer $customer): void
    {
        $orders = $customer->salesOrders()
            ->where('status', '!=', 'cancelled')
            ->get();

        $firstOrder = $orders->min('created_at');
        
        $customer->update([
            'total_orders' => $orders->count(),
            'total_order_value' => $orders->sum('total_amount'),
            'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
            'lifetime_value' => $orders->sum('total_amount'),
            'last_order_date' => $orders->max('created_at'),
            'first_purchase_date' => $firstOrder,
        ]);
    }

    public function addContactLog(Customer $customer, array $data): ContactLog
    {
        return $customer->contactLogs()->create($data);
    }
}