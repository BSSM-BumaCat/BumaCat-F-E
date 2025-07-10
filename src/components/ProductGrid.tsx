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
}

export default function ProductGrid({ products, onLikeToggle, searchTerm, onSearch, totalDonations }: ProductGridProps) {
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
		<div className="relative">
			{/* 검색바 호버 영역 */}
			<div
				className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-[35rem] h-20"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
				{/* 검색바 */}
				<div className={`transition-all duration-600 ${isSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
					<SearchBar searchTerm={searchTerm} onSearch={onSearch} totalDonations={totalDonations} />
				</div>
			</div>

			{/* 스크롤 가능한 제품 그리드 */}
			<div
				ref={scrollContainerRef}
				className="overflow-y-auto w-fit max-h-[80vh] scrollbar-hide overscroll-none"
				style={{
					msOverflowStyle: 'none',
				}}>
				<div className="grid grid-cols-4 gap-4 w-fit">
					{products.map((product) => (
						<ProductCard key={product.id} product={product} onLikeToggle={onLikeToggle} />
					))}
				</div>
			</div>
		</div>
	);
}
