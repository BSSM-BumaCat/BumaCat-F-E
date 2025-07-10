import { useState, useRef } from 'react';
import type { Product } from '../Root';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';

type ProductWithFavorites = Product & {
	favorites?: number;
	isLiked?: boolean;
};

interface ProductGridProps {
	products: ProductWithFavorites[];
	onLikeToggle: (productId: number) => void;
	searchTerm: string;
	onSearch: (term: string) => void;
	totalDonations: number;
	hoveredProduct?: {
		id: number;
		isLikeMode: boolean;
		canDrop: boolean;
	} | null;
	bounceAnimation?: 'top' | 'bottom' | null;
}

export default function ProductGrid({
	products,
	onLikeToggle,
	searchTerm,
	onSearch,
	totalDonations,
	hoveredProduct,
	bounceAnimation,
}: ProductGridProps) {
	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const hideTimeoutRef = useRef<number | null>(null);

	const handleMouseEnter = () => {
		// 기존 타이머가 있으면 취소
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
		setIsSearchVisible(true);
	};

	const handleMouseLeave = () => {
		// 1초 후에 검색바 숨기기
		hideTimeoutRef.current = window.setTimeout(() => {
			setIsSearchVisible(false);
		}, 1000);
	};

	return (
		<div className="relative" ref={scrollContainerRef}>
			{/* 제품 그리드 */}
			<div
				className={`w-fit transition-transform duration-300 ease-out relative ${
					bounceAnimation === 'top' ? 'animate-bounce-top' : bounceAnimation === 'bottom' ? 'animate-bounce-bottom' : ''
				}`}>
				<div className="grid grid-cols-4 gap-4 w-fit">
					{products.map((product) => (
						<ProductCard key={product.id} product={product} onLikeToggle={onLikeToggle} isHovered={hoveredProduct?.id === product.id} />
					))}
				</div>

				{/* 검색바 호버 영역 - ProductCard 위에 겹치게 배치 */}
				<div
					className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-[30rem] h-20"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}>
					{/* 검색바 */}
					<div className={`transition-all duration-600 ${isSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
						<SearchBar searchTerm={searchTerm} onSearch={onSearch} totalDonations={totalDonations} />
					</div>
				</div>
			</div>

			{/* CSS 애니메이션 정의 */}
			<style>{`
				/* 스크롤바 완전히 숨기기 */
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				
				@keyframes smooth-bounce-top {
					0% { transform: translateY(0); }
					15% { transform: translateY(-12px); }
					30% { transform: translateY(-8px); }
					45% { transform: translateY(-4px); }
					60% { transform: translateY(-2px); }
					75% { transform: translateY(-1px); }
					90% { transform: translateY(-0.5px); }
					100% { transform: translateY(0); }
				}
				@keyframes smooth-bounce-bottom {
					0% { transform: translateY(0); }
					15% { transform: translateY(12px); }
					30% { transform: translateY(8px); }
					45% { transform: translateY(4px); }
					60% { transform: translateY(2px); }
					75% { transform: translateY(1px); }
					90% { transform: translateY(0.5px); }
					100% { transform: translateY(0); }
				}
				.animate-bounce-top {
					animation: smooth-bounce-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
				}
				.animate-bounce-bottom {
					animation: smooth-bounce-bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
				}
			`}</style>
		</div>
	);
}
