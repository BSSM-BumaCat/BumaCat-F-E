import { useState, useEffect } from "react";
import type { Product } from "../Root";
import { fetchProducts } from "../api";

type ProductWithFavorites = Product & {
  favorites?: number;
  isLiked?: boolean;
};

export function useProducts() {
  const [products, setProducts] = useState<ProductWithFavorites[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductWithFavorites[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts();
        const productsWithFavorites = data.map((product) => ({
          ...product,
          favorites: Math.floor(Math.random() * 20) + 1,
          isLiked: false
        }));
        setProducts(productsWithFavorites);
        setFilteredProducts(productsWithFavorites);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLikeToggle = (productId: number) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            isLiked: !product.isLiked,
            favorites: product.isLiked ? (product.favorites || 1) - 1 : (product.favorites || 0) + 1
          }
        : product
    );
    setProducts(updatedProducts);
    
    if (searchTerm) {
      setFilteredProducts(updatedProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredProducts(updatedProducts);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  return {
    products,
    filteredProducts,
    loading,
    error,
    searchTerm,
    handleLikeToggle,
    handleSearch
  };
}