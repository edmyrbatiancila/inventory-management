import { useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';

interface InventoryAvailabilityResponse {
    available_quantity: number;
    quantity_on_hand?: number;
    quantity_reserved?: number;
    warehouse_name?: string;
    product_name?: string;
    product_sku?: string;
    has_inventory: boolean;
    is_sufficient: boolean;
    message: string;
}

interface UseInventoryAvailabilityReturn {
    inventoryData: InventoryAvailabilityResponse | null;
    isLoading: boolean;
    error: string | null;
    checkInventory: (warehouseId: number, productId: number) => Promise<void>;
    clearInventoryData: () => void;
}

export const useInventoryAvailability = (): UseInventoryAvailabilityReturn => {
    const [inventoryData, setInventoryData] = useState<InventoryAvailabilityResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Ref to track the current request and allow cancellation
    const abortControllerRef = useRef<AbortController | null>(null);
    // Ref to track the last request params to avoid duplicate requests
    const lastRequestRef = useRef<{ warehouseId: number; productId: number } | null>(null);

    const checkInventory = useCallback(async (warehouseId: number, productId: number) => {
        console.log('🔍 checkInventory called with:', { warehouseId, productId });
        
        // Don't check if either value is 0 (not selected)
        if (!warehouseId || !productId) {
            console.log('❌ Invalid parameters, clearing data');
            setInventoryData(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        // Check if this is the same request as the last one
        const currentRequest = { warehouseId, productId };
        if (lastRequestRef.current && 
            lastRequestRef.current.warehouseId === warehouseId && 
            lastRequestRef.current.productId === productId) {
            console.log('🔄 Same request as last one, skipping');
            return;
        }

        // Cancel any previous request
        if (abortControllerRef.current) {
            console.log('🛑 Cancelling previous request');
            abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        lastRequestRef.current = currentRequest;

        console.log('🚀 Starting inventory check for:', { warehouseId, productId });
        setIsLoading(true);
        setError(null);
        // Clear previous data immediately
        setInventoryData(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use the auth-protected route (not admin-protected)
            const baseUrl = route('api.stock-transfers.check-inventory');
            const params = new URLSearchParams({
                warehouse_id: warehouseId.toString(),
                product_id: productId.toString(),
            });
            const url = `${baseUrl}?${params.toString()}`;
            
            console.log('📡 Making request to:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'same-origin', // Include cookies for authentication
                signal: abortController.signal,
            });

            // Check if request was aborted
            if (abortController.signal.aborted) {
                console.log('🛑 Request was aborted');
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ HTTP error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Inventory response received:', data);
            
            // Only update state if this request wasn't aborted
            if (!abortController.signal.aborted) {
                setInventoryData(data);
            }
        } catch (err: any) {
            // Don't handle abort errors
            if (err.name === 'AbortError') {
                console.log('🛑 Request aborted, ignoring error');
                return;
            }
            
            console.error('💥 Inventory check error:', err);
            
            let errorMessage = 'Failed to check inventory availability';
            
            if (err.message) {
                errorMessage = err.message;
            }
            
            // Only update error state if request wasn't aborted
            if (!abortController.signal.aborted) {
                setError(errorMessage);
                setInventoryData(null);
            }
        } finally {
            // Only update loading state if request wasn't aborted
            if (!abortController.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    const clearInventoryData = useCallback(() => {
        console.log('🧹 Clearing inventory data');
        
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        setInventoryData(null);
        setError(null);
        setIsLoading(false);
        lastRequestRef.current = null;
    }, []);

    return {
        inventoryData,
        isLoading,
        error,
        checkInventory,
        clearInventoryData,
    };
};