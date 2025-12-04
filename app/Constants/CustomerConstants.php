<?php

namespace App\Constants;

class CustomerConstants
{
    public const STATUSES = [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'suspended' => 'Suspended',
        'prospect' => 'Prospect',
    ];

    public const CUSTOMER_TYPES = [
        'individual' => 'Individual',
        'business' => 'Business',
        'government' => 'Government',
        'non_profit' => 'Non-Profit',
    ];

    public const CREDIT_STATUSES = [
        'good' => 'Good Standing',
        'watch' => 'Watch List',
        'hold' => 'Credit Hold',
        'collections' => 'Collections',
    ];

    public const PRIORITIES = [
        'low' => 'Low',
        'normal' => 'Normal',
        'high' => 'High',
        'vip' => 'VIP',
    ];

    public const PRICE_TIERS = [
        'standard' => 'Standard',
        'bronze' => 'Bronze',
        'silver' => 'Silver',
        'gold' => 'Gold',
        'platinum' => 'Platinum',
    ];

    public const PAYMENT_TERMS = [
        'cod' => 'Cash on Delivery',
        'net_15' => 'Net 15 Days',
        'net_30' => 'Net 30 Days',
        'net_45' => 'Net 45 Days',
        'net_60' => 'Net 60 Days',
        'prepaid' => 'Prepaid',
    ];

    public const COMPANY_SIZES = [
        'startup' => 'Startup (1-10 employees)',
        'small' => 'Small (11-50 employees)',
        'medium' => 'Medium (51-200 employees)',
        'large' => 'Large (201-1000 employees)',
        'enterprise' => 'Enterprise (1000+ employees)',
    ];

    public const LEAD_SOURCES = [
        'website' => 'Website',
        'referral' => 'Referral',
        'cold_call' => 'Cold Call',
        'trade_show' => 'Trade Show',
        'advertisement' => 'Advertisement',
        'social_media' => 'Social Media',
        'other' => 'Other',
    ];
}