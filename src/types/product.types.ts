/**
 * 상품 관련 타입 정의
 */

// 기본 상품 인터페이스
export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  images?: string[];
  condition?: string;
  donorName?: string;
}

// 즐겨찾기 정보가 포함된 상품
export interface ProductWithFavorites extends Product {
  favorites?: number;
  isLiked?: boolean;
}

// 상품 카드 props
export interface ProductCardProps {
  product: ProductWithFavorites;
  onLikeToggle: (productId: number) => void;
  isHovered?: boolean;
  keyPressed?: string | null;
  layoutConfig?: LayoutConfig;
  isShaking?: boolean;
}

// 드래그 앤 드롭 관련
export interface DragDropState {
  isDragging: boolean;
  hoveredProductId: number | null;
  isLikeMode: boolean;
  canDrop: boolean;
}

// 상품 관련 이벤트 핸들러
export interface ProductEventHandlers {
  onLikeToggle: (productId: number) => void;
  onHeartDrop: (productId: number, isLike: boolean) => void;
  onHoverProduct: (productId: number | null, isLikeMode: boolean, canDrop: boolean) => void;
  onProductShake: (productId: number) => void;
}

// 재사용을 위한 import  
import type { LayoutConfig } from './layout.types';