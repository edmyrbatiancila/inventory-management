<?php

namespace App\Constants;

class SupplierConstants
{
    public const STATUSES = [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'blacklisted' => 'Blacklisted',
        'pending_approval' => 'Pending Approval',
    ];

    public const SUPPLIER_TYPES = [
        'manufacturer' => 'Manufacturer',
        'distributor' => 'Distributor',
        'wholesaler' => 'Wholesaler',
        'retailer' => 'Retailer',
        'service_provider' => 'Service Provider',
    ];

    public const PAYMENT_TERMS = [
        'cod' => 'Cash on Delivery',
        'net_15' => 'Net 15 Days',
        'net_30' => 'Net 30 Days',
        'net_45' => 'Net 45 Days',
        'net_60' => 'Net 60 Days',
        'net_90' => 'Net 90 Days',
        'prepaid' => 'Prepaid',
    ];

    public const PAYMENT_METHODS = [
        'bank_transfer' => 'Bank Transfer',
        'check' => 'Check',
        'credit_card' => 'Credit Card',
        'cash' => 'Cash',
        'letter_of_credit' => 'Letter of Credit',
    ];

    public const CONTRACT_TYPES = [
        'one_time' => 'One Time',
        'short_term' => 'Short Term',
        'long_term' => 'Long Term',
        'preferred_vendor' => 'Preferred Vendor',
    ];
}