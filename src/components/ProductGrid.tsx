import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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

export interface ProductGridRef {
	scrollToPosition: (deltaY: number) => void;
}

const ProductGrid = forwardRef<ProductGridRef, ProductGridProps>(({
	products,
	onLikeToggle,
	searchTerm,
	onSearch,
	totalDonations,
	hoveredProduct,
	bounceAnimation,
}, ref) => {
	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const [scrollTop, setScrollTop] = useState(0);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const hideTimeoutRef = useRef<number | null>(null);

	// 외부에서 스크롤 제어할 수 있는 함수 노출
	useImperativeHandle(ref, () => ({
		scrollToPosition: (deltaY: number) => {
			if (scrollContainerRef.current) {
				const container = scrollContainerRef.current;
				const newScrollTop = Math.max(0, Math.min(
					container.scrollTop + deltaY,
					container.scrollHeight - container.clientHeight
				));
				container.scrollTop = newScrollTop;
				setScrollTop(newScrollTop);
			}
		}
	}));

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

	// 스크롤 이벤트 핸들러 - 즉시 반영
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.target as HTMLDivElement;
		setScrollTop(target.scrollTop);
	};


	// 렌더링 안정화 및 레이아웃 준비 상태 관리
	useEffect(() => {
		// 1. products가 없으면 레이아웃 준비 안됨
		if (!products || products.length === 0) {
			setIsLayoutReady(false);
			return;
		}

		// 2. DOM이 완전히 렌더링될 때까지 기다림
		const checkLayoutReady = () => {
			if (scrollContainerRef.current) {
				// 실제 DOM 크기 확인
				const container = scrollContainerRef.current;
				const hasCorrectSize = container.offsetWidth > 0 && container.offsetHeight > 0;
				
				if (hasCorrectSize) {
					setIsLayoutReady(true);
					// 레이아웃 준비 후 스크롤 위치 동기화
					setScrollTop(container.scrollTop);
				}
			}
		};

		// 즉시 체크
		checkLayoutReady();
		
		// requestAnimationFrame으로 렌더링 완료 후 체크
		const rafId = requestAnimationFrame(() => {
			checkLayoutReady();
			
			// 추가 안전장치들
			const timeouts = [
				setTimeout(checkLayoutReady, 16), // 1프레임 후
				setTimeout(checkLayoutReady, 50),
				setTimeout(checkLayoutReady, 100),
				setTimeout(checkLayoutReady, 200)
			];
			
			return () => timeouts.forEach(timeout => clearTimeout(timeout));
		});

		return () => {
			cancelAnimationFrame(rafId);
		};
	}, [products]);

	// 스크롤 위치 재동기화 (레이아웃 준비 후)
	useEffect(() => {
		if (!isLayoutReady) return;

		const syncScrollPosition = () => {
			if (scrollContainerRef.current) {
				setScrollTop(scrollContainerRef.current.scrollTop);
			}
		};

		// 레이아웃 준비 완료 후 최종 동기화
		const rafId = requestAnimationFrame(syncScrollPosition);
		
		// 추가 보정
		const timeout = setTimeout(syncScrollPosition, 50);

		return () => {
			cancelAnimationFrame(rafId);
			clearTimeout(timeout);
		};
	}, [isLayoutReady]);

	// 페이지 포커스/가시성 변경 시 재동기화
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (!document.hidden && isLayoutReady && scrollContainerRef.current) {
				requestAnimationFrame(() => {
					if (scrollContainerRef.current) {
						setScrollTop(scrollContainerRef.current.scrollTop);
					}
				});
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', handleVisibilityChange);
		
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', handleVisibilityChange);
		};
	}, [isLayoutReady]);

	return (
		<div className="relative product-grid-container">
			{/* 후광 효과용 오버레이 - 레이아웃 준비 완료 후에만 렌더링 */}
			{isLayoutReady && products && products.length > 0 && (
				<div 
					className="absolute pointer-events-none z-0"
					style={{ 
						left: 0,
						top: 0,
						width: 'calc(4 * 12.5rem + 3 * 1rem)',
						height: 'calc(3 * 15.65rem + 2 * 1rem)',
						overflow: 'visible'
					}}
				>
					<div 
						style={{ 
							transform: `translateY(${-scrollTop}px)` // 스크롤에 따라 즉시 이동
						}}
					>
						{/* 후광 효과만을 위한 블러된 배경 */}
						<div className="grid grid-cols-4 gap-4 w-fit">
							{products.map((product) => (
								<div 
									key={`blur-${product.id}`}
									className="w-[12.5rem] h-[15.65rem] relative overflow-visible"
								>
									{/* 원본 이미지 블러 처리 */}
									<div 
										className="absolute -inset-1 bg-cover bg-center filter blur-xl opacity-15"
										style={{ 
											backgroundImage: `url(${product.imageUrl})`,
											transform: 'scale(1.03)'
										}}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* 스크롤 가능한 뷰포트 */}
			<div 
				className="overflow-y-auto overflow-x-hidden scrollbar-hide relative z-10"
				style={{ 
					width: 'calc(4 * 12.5rem + 3 * 1rem)', // 4열 너비
					height: 'calc(3 * 15.65rem + 2 * 1rem)' // 12개 상품(3행) 기준 높이
				}}
				ref={scrollContainerRef}
				onScroll={handleScroll}
			>
				{/* 제품 그리드 */}
				<div 
					className={`w-fit transition-transform duration-300 ease-out relative ${
						bounceAnimation === 'top' ? 'animate-bounce-top' : bounceAnimation === 'bottom' ? 'animate-bounce-bottom' : ''
					}`}>

					{/* 메인 제품 그리드 - 모든 상품 렌더링 */}
					<div className="grid grid-cols-4 gap-4 w-fit relative z-20">
						{products && products.map((product) => (
							<ProductCard key={product.id} product={product} onLikeToggle={onLikeToggle} isHovered={hoveredProduct?.id === product.id} />
						))}
					</div>

					{/* 검색바 호버 영역 - ProductCard 위에 겹치게 배치 */}
					<div
						className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-[30rem] h-20"
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}>
						{/* 검색바 */}
						<div className={`transition-all duration-600 ${isSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
							<SearchBar searchTerm={searchTerm} onSearch={onSearch} totalDonations={totalDonations} />
						</div>
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
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
