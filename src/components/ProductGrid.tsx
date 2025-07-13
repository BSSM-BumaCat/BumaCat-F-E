import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Product } from '../Root';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';

// 디바이스별 레이아웃 계산 함수
const getLayoutConfig = () => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const isTouch = 'ontouchstart' in window;

	console.log('Device info:', { width, height, isTouch, userAgent: navigator.userAgent });

	// 아이패드 프로 감지 (화면 크기와 터치 지원)
	if (isTouch && width >= 1024 && height >= 1366) {
		console.log('Detected: iPad Pro - 4 cols, 5 rows');
		return {
			cols: 4,
			rows: 5,
			cardWidth: '11rem',
			cardHeight: '13.75rem',
			containerWidth: 'calc(4 * 11rem + 3 * 1rem)',
			containerHeight: 'calc(5 * 13.75rem + 4 * 1rem)',
			searchBarTop: 'top-38',
		};
	}
	// 아이패드 일반/에어 감지
	else if (isTouch && width >= 768 && width <= 1024) {
		console.log('Detected: iPad Air/Regular - 4 cols, 5 rows');
		return {
			cols: 4,
			rows: 5,
			cardWidth: '9.5rem',
			cardHeight: '11.875rem',
			containerWidth: 'calc(4 * 9.5rem + 3 * 1rem)',
			containerHeight: 'calc(5 * 11.875rem + 4 * 1rem)',
			searchBarTop: 'top-34',
		};
	}
	// 모바일 (터치 지원 + 작은 화면)
	else if (isTouch && width <= 767) {
		console.log('Detected: Mobile - 2 cols, full height, no padding');
		return {
			cols: 2,
			rows: 'auto',
			cardWidth: `calc((100vw - 2rem - 1rem) / 2)`,
			cardHeight: `calc(((100vw - 2rem - 1rem) / 2) * 1.252)`,
			containerWidth: `calc(100vw - 2rem)`,
			containerHeight: `100vh`,
			maxCardWidth: '12.5rem',
			maxCardHeight: '15.65rem',
			searchBarTop: 'top-16',
			searchBarCompact: true,
		};
	}
	// 태블릿 크기 데스크톱
	else if (width <= 1024) {
		console.log('Detected: Tablet size desktop - 4 cols, 4 rows');
		return {
			cols: 4,
			rows: 4,
			cardWidth: '10.5rem',
			cardHeight: '13.125rem',
			containerWidth: 'calc(4 * 10.5rem + 3 * 1rem)',
			containerHeight: 'calc(4 * 13.125rem + 3 * 1rem)',
			searchBarTop: 'top-34',
		};
	}
	// 큰 화면 데스크톱
	else {
		console.log('Detected: Desktop - 4 cols, 3 rows');
		return {
			cols: 4,
			rows: 3,
			cardWidth: '12.5rem',
			cardHeight: '15.65rem',
			containerWidth: 'calc(4 * 12.5rem + 3 * 1rem)',
			containerHeight: 'calc(3 * 15.65rem + 2 * 1rem)',
			searchBarTop: 'top-34',
		};
	}
};

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
	isDragging?: boolean;
	keyPressed?: string | null;
	shakingProduct?: number | null;
}

export interface ProductGridRef {
	scrollToPosition: (deltaY: number) => void;
}

const ProductGrid = forwardRef<ProductGridRef, ProductGridProps>(
	({ products, onLikeToggle, searchTerm, onSearch, totalDonations, hoveredProduct, bounceAnimation, isDragging, keyPressed, shakingProduct }, ref) => {
		const [isSearchVisible, setIsSearchVisible] = useState(false);
		const [scrollTop, setScrollTop] = useState(0);
		const [isLayoutReady, setIsLayoutReady] = useState(false);
		const [layoutConfig, setLayoutConfig] = useState(getLayoutConfig);
		const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
		const [lastScrollTop, setLastScrollTop] = useState(0);
		const scrollContainerRef = useRef<HTMLDivElement>(null);
		const hideTimeoutRef = useRef<number | null>(null);

		// 외부에서 스크롤 제어할 수 있는 함수 노출
		useImperativeHandle(ref, () => ({
			scrollToPosition: (deltaY: number) => {
				if (scrollContainerRef.current) {
					const container = scrollContainerRef.current;
					const newScrollTop = Math.max(0, Math.min(container.scrollTop + deltaY, container.scrollHeight - container.clientHeight));
					container.scrollTop = newScrollTop;
					setScrollTop(newScrollTop);
				}
			},
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

		// 스크롤 이벤트 핸들러 - 즉시 반영 및 검색바 제어
		const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
			const target = e.target as HTMLDivElement;
			const currentScrollTop = target.scrollTop;
			setScrollTop(currentScrollTop);

			// 터치 디바이스에서만 스크롤 방향에 따른 검색바 제어
			if ('ontouchstart' in window && layoutConfig.cols <= 4) {
				const scrollDifference = currentScrollTop - lastScrollTop;
				const scrollThreshold = 10; // 최소 스크롤 거리

				if (Math.abs(scrollDifference) > scrollThreshold) {
					if (scrollDifference > 0) {
						// 아래로 스크롤: 검색바 숨기기
						setIsSearchBarVisible(false);
					} else {
						// 위로 스크롤: 검색바 보이기
						setIsSearchBarVisible(true);
					}
					setLastScrollTop(currentScrollTop);
				}

				// 맨 위에 있을 때는 항상 검색바 보이기
				if (currentScrollTop <= 50) {
					setIsSearchBarVisible(true);
				}
			}
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
					setTimeout(checkLayoutReady, 200),
				];

				return () => timeouts.forEach((timeout) => clearTimeout(timeout));
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

		// 윈도우 리사이즈 시 레이아웃 재계산
		useEffect(() => {
			const handleResize = () => {
				setLayoutConfig(getLayoutConfig());
			};

			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}, []);

		return (
			<div className="relative product-grid-container max-w-fit mx-auto">
				{/* 후광 효과용 오버레이 - 레이아웃 준비 완료 후에만 렌더링 */}
				{isLayoutReady && products && products.length > 0 && (
					<div
						className="absolute pointer-events-none z-0 blur-overlay"
						style={{
							left: 0,
							top: 0,
							width: layoutConfig.containerWidth,
							height: layoutConfig.containerHeight,
							overflow: 'visible',
						}}>
						<div
							style={{
								transform: `translateY(${-scrollTop}px)`,
							}}>
							{/* 후광 효과만을 위한 블러된 배경 */}
							<div
								className="grid gap-4 w-fit"
								style={{
									gridTemplateColumns: `repeat(${layoutConfig.cols}, minmax(0, 1fr))`,
								}}>
								{products.map((product) => (
									<div
										key={`blur-${product.id}`}
										className="relative overflow-visible"
										style={{
											width: layoutConfig.cardWidth,
											height: layoutConfig.cardHeight,
											maxWidth: layoutConfig.maxCardWidth,
											maxHeight: layoutConfig.maxCardHeight,
										}}>
										{/* 원본 이미지 블러 처리 */}
										<div
											className="absolute -inset-1 bg-cover bg-center filter blur-xl opacity-15"
											style={{
												backgroundImage: `url(${product.imageUrl})`,
												transform: 'scale(1.3)',
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
					className="overflow-y-auto overflow-x-hidden scrollbar-hide relative z-10 viewport-container"
					style={{
						width: layoutConfig.containerWidth,
						height: layoutConfig.containerHeight,
						maxWidth: layoutConfig.maxCardWidth
							? `calc(${layoutConfig.cols} * ${layoutConfig.maxCardWidth} + ${layoutConfig.cols - 1} * 1rem)`
							: undefined,
					}}
					ref={scrollContainerRef}
					onScroll={handleScroll}>
					{/* 제품 그리드 */}
					<div
						className={`w-fit transition-transform duration-300 ease-out relative ${
							bounceAnimation === 'top' ? 'animate-bounce-top' : bounceAnimation === 'bottom' ? 'animate-bounce-bottom' : ''
						}`}>
						{/* 메인 제품 그리드 - 모든 상품 렌더링 */}
						<div
							className="grid gap-4 w-fit relative z-20"
							style={{
								gridTemplateColumns: `repeat(${layoutConfig.cols}, minmax(0, 1fr))`,
							}}>
							{products &&
								products.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										onLikeToggle={onLikeToggle}
										isHovered={hoveredProduct?.id === product.id}
										keyPressed={keyPressed}
										layoutConfig={layoutConfig}
										isShaking={shakingProduct === product.id}
									/>
								))}
						</div>

						{/* 검색바 영역 */}
						{/* 드래그 중이거나 키보드가 눌린 상태에서는 검색바 요소를 완전히 제거 */}
						{!isDragging && !keyPressed && (
							<div>
								{/* 터치 디바이스에서는 스크롤 방향에 따라 표시/숨김 */}
								{layoutConfig.cols <= 4 && 'ontouchstart' in window ? (
									<div
										className={`fixed ${
											layoutConfig.searchBarTop || 'top-4'
										} left-1/2 transform -translate-x-1/2 z-50 w-fit transition-all duration-500 ease-in-out ${
											isSearchBarVisible ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
										}`}>
										<SearchBar
											searchTerm={searchTerm}
											onSearch={onSearch}
											totalDonations={totalDonations}
											compact={layoutConfig.searchBarCompact}
										/>
									</div>
								) : (
									/* 데스크톱에서는 호버로 표시 */
									<div
										className={`fixed ${layoutConfig.searchBarTop || 'top-34'} left-1/2 transform -translate-x-1/2 z-50 w-fit h-20`}
										onMouseEnter={handleMouseEnter}
										onMouseLeave={handleMouseLeave}>
										<div
											className={`transition-all duration-600 ${
												isSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
											}`}>
											<SearchBar
												searchTerm={searchTerm}
												onSearch={onSearch}
												totalDonations={totalDonations}
												compact={layoutConfig.searchBarCompact}
											/>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				{/* CSS 애니메이션 및 반응형 정의 */}
				<style>{`
				/* 스크롤바 완전히 숨기기 */
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				
				/* 반응형 패딩 - 화면 크기에 따라 패딩 조정 */
				.responsive-padding {
					padding: 4rem;
				}
				
				@media (max-width: 1200px) {
					.responsive-padding {
						padding: 3rem;
					}
				}
				
				@media (max-width: 1000px) {
					.responsive-padding {
						padding: 2rem;
					}
				}
				
				@media (max-width: 900px) {
					.responsive-padding {
						padding: 1.5rem;
					}
				}
				
				@media (max-width: 600px) {
					.responsive-padding {
						padding: 1rem;
					}
				}
				
				@media (max-width: 400px) {
					.responsive-padding {
						padding: 0.5rem;
					}
				}
				
				/* 모바일에서 패딩 완전 제거 */
				@media (max-width: 767px) and (pointer: coarse) {
					.responsive-padding {
						padding: 0 !important;
					}
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
	},
);

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
