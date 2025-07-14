import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Product } from '../Root';
import ProductCard from './ProductCard';

interface VirtualizedGridProps {
  products: Product[];
  onLikeToggle: (productId: number) => void;
  hoveredProduct?: { id: number; x: number; y: number } | null;
  keyPressed?: string | null;
  layoutConfig: {
    cardWidth: string;
    cardHeight: string;
    maxCardWidth?: string;
    maxCardHeight?: string;
    searchBarTop?: string;
  };
  shakingProducts?: Set<number>;
}

const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  products,
  onLikeToggle,
  hoveredProduct,
  keyPressed,
  layoutConfig,
  shakingProducts = new Set()
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  // 카드 크기 계산
  const cardWidth = parseInt(layoutConfig.cardWidth.replace('rem', '')) * 16; // rem to px
  const cardHeight = parseInt(layoutConfig.cardHeight.replace('rem', '')) * 16;
  const gap = 16; // 1rem = 16px

  // 그리드 계산
  const { visibleItems, totalHeight } = useMemo(() => {
    if (!containerDimensions.width) return { visibleItems: [], totalHeight: 0 };

    const cols = Math.floor((containerDimensions.width + gap) / (cardWidth + gap));
    const rowHeight = cardHeight + gap;
    const visibleRowsCount = Math.ceil(containerDimensions.height / rowHeight) + 2; // 버퍼 추가
    
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const endRow = Math.min(
      Math.ceil(products.length / cols),
      startRow + visibleRowsCount
    );

    const items = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index < products.length) {
          items.push({
            product: products[index],
            index,
            row,
            col,
            x: col * (cardWidth + gap),
            y: row * rowHeight
          });
        }
      }
    }

    const totalRows = Math.ceil(products.length / cols);
    const height = totalRows * rowHeight;

    return {
      visibleItems: items,
      totalHeight: height
    };
  }, [products, containerDimensions, scrollTop, cardWidth, cardHeight, gap]);

  // 컨테이너 크기 감지
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 스크롤 처리
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: '100%' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ product, index, x, y }) => {
          if (!product) return null;
          return (
            <div
              key={`${product.id}-${index}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: cardWidth,
                height: cardHeight
              }}
            >
              <ProductCard
                product={product}
                onLikeToggle={onLikeToggle}
                isHovered={hoveredProduct?.id === product.id}
                keyPressed={keyPressed || null}
                layoutConfig={layoutConfig}
                isShaking={shakingProducts.has(product.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(VirtualizedGrid);