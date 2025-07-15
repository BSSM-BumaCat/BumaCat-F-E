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
	(
		{
			products,
			onLikeToggle,
			searchTerm,
			onSearch,
			totalDonations,
			hoveredProduct,
			bounceAnimation,
			isDragging,
			keyPressed,
			shakingProduct,
			expandedProduct,
			onProductExpand,
		},
		ref,
	) => {
		const [isLayoutReady, setIsLayoutReady] = useState(false);
		const scrollContainerRef = useRef<HTMLDivElement>(null);

		// Custom hooks로 복잡한 로직 캡슐화
		const { layoutConfig, isTouch, isMobile } = useDeviceLayout();
		const {
			isVisible: isSearchBarVisible,
			scrollTop,
			handleScroll: handleScrollAnimation,
		} = useScrollAnimation({
			threshold: 10,
			showDirection: 'up',
			hideDirection: 'down',
			enabled: isTouch && layoutConfig.cols <= 4,
		});
		const { isSearchVisible, handleMouseEnter, handleMouseLeave } = useSearchBehavior({ hideDelay: 1000 });

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
		const handleScroll = useCallback(
			(e: React.UIEvent<HTMLDivElement>) => {
				// 스크롤 애니메이션 훅의 핸들러 호출
				handleScrollAnimation(e);
			},
			[handleScrollAnimation],
		);

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

		const containerStyles = useMemo(() => calculateContainerStyles(layoutConfig), [layoutConfig]);

		const cardStyles = useMemo(() => calculateCardStyles(layoutConfig), [layoutConfig]);

		const searchBarClasses = useMemo(
			() => calculateSearchBarClasses(layoutConfig, isSearchBarVisible, isTouch),
			[layoutConfig, isSearchBarVisible, isTouch],
		);

		// ProductCard props 메모이제이션
		const memoizedProducts = useMemo(
			() =>
				products?.map((product) => ({
					...product,
					isHovered: hoveredProduct?.id === product.id,
					isShaking: shakingProduct === product.id,
					isExpanded: expandedProduct === product.id,
				})) || [],
			[products, hoveredProduct?.id, shakingProduct, expandedProduct],
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
									<div key={`blur-${product.id}`} className="relative overflow-visible" style={cardStyles}>
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
						<div className="grid gap-4 w-fit relative z-20 transition-all duration-300 ease-in-out" style={gridStyles}>
							{memoizedProducts.map((product, index) => {
								const isExpanded = product.isExpanded;
								const currentRow = Math.floor(index / layoutConfig.cols);
								const currentCol = index % layoutConfig.cols;

								// 모바일과 데스크탑 구분하여 확대 로직 처리
								const isMobileLayout = layoutConfig.cols === 2;

								// 모바일 기종별 화면 크기에 따른 paddingBottom 동적 계산
								const calculateMobilePaddingBottom = () => {
									if (!isMobileLayout || !isExpanded) return '0';

									// 현재 뷰포트 크기 가져오기
									const viewportWidth = window.innerWidth;
									const viewportHeight = window.innerHeight;

									// 모바일 기종별 계산 로직
									// 아이폰 SE, 미니 (320-375px)
									if (viewportWidth <= 375) {
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + 0.75rem)`;
									}
									// 아이폰 프로, 표준 (376-414px)
									else if (viewportWidth <= 414) {
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + 0.9rem)`;
									}
									// 아이폰 프로 맥스, 플러스 (415-480px)
									else if (viewportWidth <= 480) {
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + 1rem)`;
									}
									// 작은 안드로이드 폰 (481-540px)
									else if (viewportWidth <= 540) {
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + 1.25rem)`;
									}
									// 큰 안드로이드 폰 (541-600px)
									else if (viewportWidth <= 600) {
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + 1.5rem)`;
									}
									// 매우 큰 안드로이드 폰 또는 폴더블 (601-767px)
									else if (viewportWidth <= 767) {
										// 높이를 고려한 추가 조정
										const heightFactor = viewportHeight > 800 ? 1.75 : 1.5;
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + ${heightFactor}rem)`;
									}
									// 기본값 (예외 상황)
									else {
										return `calc(((100vw - 2rem - 1rem) / 2) * 1.252 + 1rem)`;
									}
								};
								const lastColumnIndex = layoutConfig.cols - 1;
								const isLastColumn = currentCol === lastColumnIndex;

								// 확대/축소에 따른 그리드 위치 및 span 설정
								let gridColumn, gridRow;

								if (isExpanded) {
									if (isMobileLayout) {
										// 모바일(2열): 오른쪽 열은 왼쪽으로 이동해서 확대
										if (currentCol === 1) {
											// 오른쪽 열(1열) 확대 시 왼쪽으로 이동
											gridColumn = `1 / span 2`;
											gridRow = `${currentRow + 1} / span 2`;
										} else {
											// 왼쪽 열(0열) 확대 시 그대로
											gridColumn = `1 / span 2`;
											gridRow = `${currentRow + 1} / span 2`;
										}
									} else {
										// 데스크탑(4열): 기존 로직 유지
										if (isLastColumn) {
											gridColumn = `${lastColumnIndex} / span 2`;
											gridRow = `${currentRow + 1} / span 2`;
										} else {
											gridColumn = `${currentCol + 1} / span 2`;
											gridRow = `${currentRow + 1} / span 2`;
										}
									}
								} else {
									// 축소 상태 처리
									if (isMobileLayout) {
										const expandedProduct = memoizedProducts.find((p) => p.isExpanded);

										if (expandedProduct) {
											// 확대된 상품이 있을 때는 모든 다른 상품들이 자동 배치로 밀려남
											gridColumn = 'span 1';
											gridRow = 'span 1';
										} else {
											// 확대된 상품이 없을 때는 정상 위치
											gridColumn = `${currentCol + 1} / span 1`;
											gridRow = `${currentRow + 1} / span 1`;
										}
									} else {
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
											justifySelf: isLastColumn ? 'end' : undefined,
											order: index, // 원래 순서 유지
											// 확대된 상품은 실제 높이를 늘려서 아래쪽 밀어내기
											...(isMobileLayout &&
												isExpanded && {
													// 2x2 확대 시 동적 크기 계산
													// 실제 카드 높이와 gap을 기반으로 계산
													paddingBottom: calculateMobilePaddingBottom(),
												}),
										}}>
										<ProductCard
											product={product}
											onLikeToggle={onLikeToggle}
											isHovered={product.isHovered}
											keyPressed={keyPressed || null}
											layoutConfig={layoutConfig}
											isShaking={product.isShaking}
											isExpanded={isExpanded}
											onExpand={() => onProductExpand?.(product.id)}
											isLastColumn={isLastColumn}
											isMobile={isMobileLayout}
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
										<SearchBar searchTerm={searchTerm} onSearch={onSearch} totalDonations={totalDonations} compact={isMobile} />
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
											<SearchBar searchTerm={searchTerm} onSearch={onSearch} totalDonations={totalDonations} compact={isMobile} />
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
