import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
// Product type는 ProductWithFavorites로 대체됨
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { useDeviceLayout } from '../hooks/useDeviceLayout';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSearchBehavior } from '../hooks/useSearchBehavior';
import { calculateGridStyles, calculateCardStyles, calculateContainerStyles, calculateSearchBarClasses } from '../utils/layoutCalculator';
import type { ProductWithFavorites } from '../types/product.types';

// 기존 하드코딩된 로직은 custom hooks로 대체됨

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
	expandedProduct?: number | null;
	onProductExpand?: (productId: number) => void;
}

export interface ProductGridRef {
	scrollToPosition: (deltaY: number) => void;
}

const ProductGrid = forwardRef<ProductGridRef, ProductGridProps>(
	({ products, onLikeToggle, searchTerm, onSearch, totalDonations, hoveredProduct, bounceAnimation, isDragging, keyPressed, shakingProduct, expandedProduct, onProductExpand }, ref) => {
		const [isLayoutReady, setIsLayoutReady] = useState(false);
		const scrollContainerRef = useRef<HTMLDivElement>(null);
		
		
		// Custom hooks로 복잡한 로직 캡슐화
		const { layoutConfig, isTouch, isMobile } = useDeviceLayout();
		const {
			isVisible: isSearchBarVisible,
			scrollTop,
			handleScroll: handleScrollAnimation
		} = useScrollAnimation({
			threshold: 10,
			showDirection: 'up',
			hideDirection: 'down',
			enabled: isTouch && layoutConfig.cols <= 4
		});
		const {
			isSearchVisible,
			handleMouseEnter,
			handleMouseLeave
		} = useSearchBehavior({ hideDelay: 1000 });

		// 외부에서 스크롤 제어할 수 있는 함수 노출
		useImperativeHandle(ref, () => ({
			scrollToPosition: (deltaY: number) => {
				if (scrollContainerRef.current) {
					const container = scrollContainerRef.current;
					const newScrollTop = Math.max(0, Math.min(container.scrollTop + deltaY, container.scrollHeight - container.clientHeight));
					container.scrollTop = newScrollTop;
					// setScrollTop은 useScrollAnimation hook에서 관리됨
				}
			},
		}));

		// 통합된 스크롤 핸들러 (useCallback으로 메모이제이션)
		const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
			// 스크롤 애니메이션 훅의 핸들러 호출
			handleScrollAnimation(e);
		}, [handleScrollAnimation]);

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
						// scrollTop은 useScrollAnimation hook에서 자동 관리됨
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
					// scrollTop은 useScrollAnimation hook에서 자동 관리됨
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
							// scrollTop은 useScrollAnimation hook에서 자동 관리됨
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

		// 디바이스 레이아웃은 useDeviceLayout 훅에서 자동 관리됨
		
		// 스타일 계산 메모이제이션으로 성능 최적화
		const gridStyles = useMemo(() => {
			const baseStyles = calculateGridStyles(layoutConfig, searchTerm, isTouch);
			
			// 확대된 상품이 있을 때도 기본 그리드 유지 (4열)
			return baseStyles;
		}, [layoutConfig, searchTerm, isTouch]);
		
		const containerStyles = useMemo(() => 
			calculateContainerStyles(layoutConfig), 
			[layoutConfig]
		);
		
		const cardStyles = useMemo(() => 
			calculateCardStyles(layoutConfig), 
			[layoutConfig]
		);
		
		const searchBarClasses = useMemo(() => 
			calculateSearchBarClasses(layoutConfig, isSearchBarVisible, isTouch), 
			[layoutConfig, isSearchBarVisible, isTouch]
		);
		
		// ProductCard props 메모이제이션
		const memoizedProducts = useMemo(() => 
			products?.map((product) => ({
				...product,
				isHovered: hoveredProduct?.id === product.id,
				isShaking: shakingProduct === product.id,
				isExpanded: expandedProduct === product.id
			})) || [], 
			[products, hoveredProduct?.id, shakingProduct, expandedProduct]
		);

		return (
			<div className="relative product-grid-container max-w-fit mx-auto">
				{/* 후광 효과용 오버레이 - 레이아웃 준비 완료 후에만 렌더링 */}
				{isLayoutReady && products && products.length > 0 && (
					<div
						className="absolute pointer-events-none z-0 blur-overlay"
						style={{
							left: 0,
							top: 0,
							...containerStyles,
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
										style={cardStyles}>
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
					style={containerStyles}
					ref={scrollContainerRef}
					onScroll={handleScroll}>
					{/* 제품 그리드 */}
					<div
						className={`w-fit transition-transform duration-300 ease-out relative ${
							bounceAnimation === 'top' ? 'animate-bounce-top' : bounceAnimation === 'bottom' ? 'animate-bounce-bottom' : ''
						}`}>
						{/* 메인 제품 그리드 - 모든 상품 렌더링 */}
						<div
							className="grid gap-4 w-fit relative z-20 transition-all duration-300 ease-in-out"
							style={gridStyles}>
							{memoizedProducts.map((product, index) => {
								const isExpanded = product.isExpanded;
								const currentRow = Math.floor(index / layoutConfig.cols);
								const currentCol = index % layoutConfig.cols;
								
								// 4번째 열(인덱스 3)에서 확대될 때의 특별 처리
								const isFourthColumn = currentCol === 3;
								
								// 확대된 상품이 있는지 확인
								const expandedFourthColumnIndex = memoizedProducts.findIndex(p => p.isExpanded && memoizedProducts.indexOf(p) % layoutConfig.cols === 3);
								const hasExpandedFourthColumn = expandedFourthColumnIndex !== -1;
								
								const expandedThirdColumnIndex = memoizedProducts.findIndex(p => p.isExpanded && memoizedProducts.indexOf(p) % layoutConfig.cols === 2);
								const hasExpandedThirdColumn = expandedThirdColumnIndex !== -1;
								
								// 확대/축소에 따른 그리드 위치 및 span 설정
								let gridColumn, gridRow;
								
								if (isExpanded) {
									if (isFourthColumn) {
										// 4번째 열에서 확대 시 3-4열 위치로 설정
										gridColumn = `3 / span 2`;
										gridRow = `${currentRow + 1} / span 2`;
									} else {
										// 다른 열에서는 원래 위치에서 확대
										gridColumn = `${currentCol + 1} / span 2`;
										gridRow = `${currentRow + 1} / span 2`;
									}
								} else {
									// 축소 상태 처리
									if (isFourthColumn) {
										// 4번째 열 처리: 3번째 열이나 4번째 열에 확대된 상품이 있으면 자동 배치
										if (hasExpandedFourthColumn || hasExpandedThirdColumn) {
											gridColumn = 'span 1';
											gridRow = 'span 1';
										} else {
											// 확대된 상품이 없을 때만 명시적 위치
											gridColumn = `4 / span 1`;
											gridRow = `${currentRow + 1} / span 1`;
										}
									} else {
										// 다른 열들은 자동 배치로 자연스러운 flow
										gridColumn = 'span 1';
										gridRow = 'span 1';
									}
								}
								
								return (
									<div 
										key={product.id}
										className={`transition-all duration-500 ease-in-out`}
										style={{
											gridColumn,
											gridRow,
											justifySelf: isFourthColumn ? 'end' : undefined,
										}}
									>
										<ProductCard
											product={product}
											onLikeToggle={onLikeToggle}
											isHovered={product.isHovered}
											keyPressed={keyPressed || null}
											layoutConfig={layoutConfig}
											isShaking={product.isShaking}
											isExpanded={isExpanded}
											onExpand={() => onProductExpand?.(product.id)}
											isFourthColumn={isFourthColumn}
										/>
									</div>
								);
							})}
						</div>

						{/* 검색바 영역 */}
						{/* 드래그 중이거나 키보드가 눌린 상태에서는 검색바 요소를 완전히 제거 */}
						{!isDragging && !keyPressed && (
							<div>
								{/* 터치 디바이스에서는 스크롤 방향에 따라 표시/숨김 */}
								{isTouch && layoutConfig.cols <= 4 ? (
									<div className={searchBarClasses}>
										<SearchBar
											searchTerm={searchTerm}
											onSearch={onSearch}
											totalDonations={totalDonations}
											compact={isMobile}
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
												compact={isMobile}
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
