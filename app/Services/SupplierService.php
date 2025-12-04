<?php

namespace App\Services;

use App\Models\ContactLog;
use App\Models\Supplier;

class SupplierService
{
    public function generateSupplierCode(): string
    {
        do {
            $code = 'SUP-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        } while (Supplier::where('supplier_code', $code)->exists());

        return $code;
    }

    public function getDisplayName(Supplier $supplier): string
    {
        return $supplier->trade_name ?: $supplier->company_name;
    }

    public function getFullAddress(Supplier $supplier): string
    {
        $address = $supplier->address_line_1;
        if ($supplier->address_line_2) {
            $address .= ', ' . $supplier->address_line_2;
        }
        $address .= ', ' . $supplier->city;
        if ($supplier->state_province) {
            $address .= ', ' . $supplier->state_province;
        }
        if ($supplier->postal_code) {
            $address .= ' ' . $supplier->postal_code;
        }
        $address .= ', ' . $supplier->country;
        
        return $address;
    }

    public function getAvailableCredit(Supplier $supplier): float
    {
        return max(0, $supplier->credit_limit - $supplier->current_balance);
    }

    public function getPerformanceScore(Supplier $supplier): float
    {
        $scores = [
            $supplier->overall_rating,
            $supplier->quality_rating,
            $supplier->delivery_rating,
            $supplier->service_rating
        ];
        
        $validScores = array_filter($scores, fn($score) => $score > 0);
        
        return empty($validScores) ? 0 : round(array_sum($validScores) / count($validScores), 2);
    }

    public function isActive(Supplier $supplier): bool
    {
        return $supplier->status === 'active';
    }

    public function canReceiveOrders(Supplier $supplier): bool
    {
        return in_array($supplier->status, ['active', 'pending_approval']);
    }

    public function updatePerformanceMetrics(Supplier $supplier): void
    {
        $orders = $supplier->purchaseOrders()
            ->where('status', '!=', 'cancelled')
            ->get();

        $supplier->update([
            'total_orders' => $orders->count(),
            'total_order_value' => $orders->sum('total_amount'),
            'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
            'last_order_date' => $orders->max('created_at'),
        ]);
    }

    public function addContactLog(Supplier $supplier, array $data): ContactLog
    {
        return $supplier->contactLogs()->create($data);
    }

    public function getNextOrderNumber(Supplier $supplier): string
    {
        $lastOrder = $supplier->purchaseOrders()
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = $lastOrder ? 
            intval(substr($lastOrder->po_number, -3)) + 1 : 1;

        return $supplier->supplier_code . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }
}