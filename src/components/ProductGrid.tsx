import { useState, useRef, useEffect } from 'react';
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
}

export default function ProductGrid({ products, onLikeToggle, searchTerm, onSearch, totalDonations, hoveredProduct }: ProductGridProps) {
	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const [canScrollDown, setCanScrollDown] = useState(false);
	const [bounceAnimation, setBounceAnimation] = useState<'top' | 'bottom' | null>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const hideTimeoutRef = useRef<number | null>(null);
	const lastScrollTop = useRef(0);

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

	const checkScrollability = () => {
		const container = scrollContainerRef.current;
		if (container) {
			const canScroll = container.scrollHeight > container.clientHeight;
			const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
			setCanScrollDown(canScroll && !isAtBottom);
		}
	};

	useEffect(() => {
		checkScrollability();
	}, [products]);

	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		checkScrollability();

		const currentScrollTop = container.scrollTop;
		const maxScrollTop = container.scrollHeight - container.clientHeight;

		// 스크롤이 최상단에 도달했을 때
		if (currentScrollTop <= 0 && lastScrollTop.current > 0) {
			setBounceAnimation('top');
			setTimeout(() => setBounceAnimation(null), 300);
		}
		// 스크롤이 최하단에 도달했을 때
		else if (currentScrollTop >= maxScrollTop && lastScrollTop.current < maxScrollTop) {
			setBounceAnimation('bottom');
			setTimeout(() => setBounceAnimation(null), 300);
		}

		lastScrollTop.current = currentScrollTop;
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
			<div className="relative">
				<div
					ref={scrollContainerRef}
					className={`overflow-y-auto w-fit max-h-[80vh] scrollbar-hide transition-transform duration-300 ease-out ${
						bounceAnimation === 'top' ? 'animate-bounce-top' : bounceAnimation === 'bottom' ? 'animate-bounce-bottom' : ''
					}`}
					style={{
						msOverflowStyle: 'none',
						WebkitOverflowScrolling: 'touch',
						scrollbarWidth: 'none'
					}}
					onScroll={handleScroll}>
					<div className="grid grid-cols-4 gap-4 w-fit">
						{products.map((product) => (
							<ProductCard 
								key={product.id} 
								product={product} 
								onLikeToggle={onLikeToggle}
								isHovered={hoveredProduct?.id === product.id}
							/>
						))}
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

				{/* 하단 페이드 그라데이션 */}
				{canScrollDown && (
					<div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0D0C0C] to-transparent pointer-events-none z-10" />
				)}
			</div>
		</div>
	);
}
