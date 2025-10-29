import { useState, useCallback, useRef } from 'react';

// Minimal local implementation of `route` used by this hook to avoid relying on a missing module.
// It converts dotted route names into path segments and appends params as a query string.
function route(name: string, params?: Record<string, any>): string {
  const path = name.replace(/\./g, '/');
  if (!params || Object.keys(params).length === 0) return `/${path}`;
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `/${path}?${query}`;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
}

interface UseWarehouseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (warehouseId: number) => Promise<void>;
  clearProducts: () => void;
}

export function useWarehouseProducts(): UseWarehouseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (warehouseId: number) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const url = route('api.stock-transfers.products-with-inventory', {
        warehouse_id: warehouseId
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      const errorMessage = error.message || 'Failed to fetch products';
      console.error('💥 Error fetching products:', errorMessage);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProducts = useCallback(() => {
    setProducts([]);
    setError(null);
    setLoading(false);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    clearProducts,
  };
}