import { useState } from "react";
import { useProducts } from "./hooks/useProducts";
import ProductGrid from "./components/ProductGrid";
import NoiseOverlay from "./components/NoiseOverlay";

function App() {
  const [totalDonations] = useState(1003000);
  const {
    filteredProducts,
    loading,
    error,
    searchTerm,
    handleLikeToggle,
    handleSearch
  } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8 overscroll-none"
      style={{ 
        backgroundColor: '#0D0C0C'
      }}
    >
      <ProductGrid
        products={filteredProducts}
        onLikeToggle={handleLikeToggle}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        totalDonations={totalDonations}
      />
      
      <NoiseOverlay />
    </div>
  );
}

export default App;