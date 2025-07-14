import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../api';
import type { Product } from '../Root';

const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addProduct,
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      
      const previousProducts = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      
      const optimisticProduct = {
        ...newProduct,
        id: Date.now(), // 임시 ID
      };
      
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old = []) => [
        ...old,
        optimisticProduct,
      ]);
      
      return { previousProducts };
    },
    onError: (_, __, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, product }: { id: number; product: Omit<Product, 'id'> }) =>
      updateProduct(id, product),
    onMutate: async ({ id, product }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      
      const previousProducts = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old = []) =>
        old.map(p => p.id === id ? { ...product, id } : p)
      );
      
      return { previousProducts };
    },
    onError: (_, __, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      
      const previousProducts = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old = []) =>
        old.filter(p => p.id !== id)
      );
      
      return { previousProducts };
    },
    onError: (_, __, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
};