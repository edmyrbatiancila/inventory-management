<?php

namespace App\Traits;

trait HasNumberGeneration
{
    public static function generateNumber(string $prefix): string
    {
        $year = date('Y');
        $month = date('m');
        
        $last = static::whereYear('created_at', $year)
                        ->whereMonth('created_at', $month)
                        ->orderBy('id', 'desc')
                        ->first();
        
        $numberField = strtolower($prefix) . '_number';
        $sequence = $last ? (int) substr($last->$numberField, -3) + 1 : 1;
        
        return sprintf('%s-%s%s-%03d', $prefix, $year, $month, $sequence);
    }
}
