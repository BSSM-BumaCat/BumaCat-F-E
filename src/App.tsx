import { useState } from "react";
import { useProducts } from "./hooks/useProducts";
import ProductGrid from "./components/ProductGrid";
import NoiseOverlay from "./components/NoiseOverlay";
import DraggableHeart from "./components/DraggableHeart";

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

  const handleHeartDrop = (productId: number, isLike: boolean) => {
    const product = filteredProducts.find(p => p.id === productId);
    if (!product) return;
    
    const currentlyLiked = product.isLiked || false;
    
    // 좋아요 모드: 좋아요하지 않은 상품에만 적용
    // 취소 모드: 이미 좋아요한 상품에만 적용
    if ((isLike && !currentlyLiked) || (!isLike && currentlyLiked)) {
      handleLikeToggle(productId);
    }
  };

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
      
      <DraggableHeart onHeartDrop={handleHeartDrop} products={filteredProducts} />
      <NoiseOverlay />
    </div>
  );
}

export default App;