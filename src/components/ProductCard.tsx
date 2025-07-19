import { useState, useEffect, memo, useRef } from 'react';
import type { ProductWithFavorites } from '../types/product.types';
import FavoriteIcon from './FavoriteIcon';

interface ProductCardProps {
	product: ProductWithFavorites;
	onLikeToggle: (productId: number) => void;
	isHovered?: boolean;
	keyPressed?: string | null;
	layoutConfig?: {
		cardWidth: string;
		cardHeight: string;
		maxCardWidth?: string;
		maxCardHeight?: string;
		searchBarTop?: string;
	};
	isShaking?: boolean;
	isExpanded?: boolean;
	onExpand?: () => void;
	isLastColumn?: boolean;
	isMobile?: boolean;
}

const ProductCard = memo(function ProductCard({
	product,
	onLikeToggle,
	isHovered,
	keyPressed,
	layoutConfig,
	isShaking,
	isExpanded,
	onExpand,
	isLastColumn,
	isMobile,
}: ProductCardProps) {
	const [likeEffect, setLikeEffect] = useState(false);
	const [previousLiked, setPreviousLiked] = useState(product.isLiked);

	// 애니메이션 리셋을 위한 상태
	const [animationKey, setAnimationKey] = useState(0);

	// 스토리 슬라이더 상태
	const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
	const [touchStartX, setTouchStartX] = useState(0);
	const [touchStartY, setTouchStartY] = useState(0);
	const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);
	const [isStoryPlaying, setIsStoryPlaying] = useState(false);
	const [progressKey, setProgressKey] = useState(0);
	const [pausedProgress, setPausedProgress] = useState(0);
	const [storyStartTime, setStoryStartTime] = useState(0);
	const storyContainerRef = useRef<HTMLDivElement>(null);
	const storyTimerRef = useRef<number | null>(null);

	// 스토리 데이터 생성 (이미지들 + 마지막 설명 슬라이드)
	const storySlides = [
		...(product.images || [product.imageUrl]),
		'description', // 마지막 슬라이드는 설명
	];

	// 확대 상태 변경 시 스토리 인덱스 리셋 및 자동 재생 시작 (데스크탑만)
	useEffect(() => {
		if (isExpanded) {
			setCurrentStoryIndex(0);
			// 터치 디바이스가 아닌 경우에만 자동 재생 활성화
			const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			setIsStoryPlaying(!isTouch);
			setProgressKey(0);
			setPausedProgress(0);
			setStoryStartTime(Date.now());
		} else {
			setIsStoryPlaying(false);
			if (storyTimerRef.current) {
				window.clearTimeout(storyTimerRef.current);
				storyTimerRef.current = null;
			}
		}
	}, [isExpanded]);

	// 스토리 자동 재생 로직
	useEffect(() => {
		if (!isExpanded || !isStoryPlaying) return;

		const startStoryTimer = () => {
			if (storyTimerRef.current) {
				window.clearTimeout(storyTimerRef.current);
			}

			// 설명 슬라이드는 더 오래 보여주기 (5초), 이미지는 3초
			const totalDuration = storySlides[currentStoryIndex] === 'description' ? 5000 : 3000;
			// 일시정지되었던 시간만큼 빼기
			const remainingDuration = totalDuration - pausedProgress * totalDuration;

			setStoryStartTime(Date.now() - pausedProgress * totalDuration);

			storyTimerRef.current = window.setTimeout(() => {
				goToNextStory();
			}, remainingDuration);
		};

		startStoryTimer();

		return () => {
			if (storyTimerRef.current) {
				window.clearTimeout(storyTimerRef.current);
				storyTimerRef.current = null;
			}
		};
	}, [currentStoryIndex, isExpanded, isStoryPlaying]);

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		return () => {
			if (storyTimerRef.current) {
				window.clearTimeout(storyTimerRef.current);
				storyTimerRef.current = null;
			}
		};
	}, []);

	// isShaking 변화 감지하여 애니메이션 리셋
	useEffect(() => {
		if (isShaking) {
			console.log(`Product ${product.id} is shaking!`);
			// 애니메이션 키를 변경하여 강제 리렌더링
			setAnimationKey((prev) => prev + 1);
		}
	}, [isShaking, product.id]);

	// 하트 상태 변화 감지하여 이펙트 실행
	useEffect(() => {
		if (previousLiked !== product.isLiked) {
			setLikeEffect(true);
			setTimeout(() => setLikeEffect(false), 1000);
			setPreviousLiked(product.isLiked);
		}
	}, [product.isLiked, previousLiked]);

	// 흔들기 애니메이션 트리거 (키보드 단축키용)
	const [isKeyboardShaking, setIsKeyboardShaking] = useState(false);
	const triggerShake = () => {
		setIsKeyboardShaking(true);
		setTimeout(() => setIsKeyboardShaking(false), 500);
	};

	// 스토리 네비게이션 함수들
	const goToNextStory = () => {
		if (currentStoryIndex < storySlides.length - 1) {
			setCurrentStoryIndex((prev) => prev + 1);
			// 프로그레스 애니메이션 리셋
			setProgressKey((prev) => prev + 1);
			setPausedProgress(0);
			setStoryStartTime(Date.now());
			// 터치 디바이스가 아닌 경우에만 자동 재생 계속
			const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			setIsStoryPlaying(!isTouch);
		} else {
			// 마지막 스토리에서 다음으로 가려고 하면 카드 축소
			onExpand?.();
		}
	};

	const goToPrevStory = () => {
		if (currentStoryIndex > 0) {
			setCurrentStoryIndex((prev) => prev - 1);
			// 프로그레스 애니메이션 리셋
			setProgressKey((prev) => prev + 1);
			setPausedProgress(0);
			setStoryStartTime(Date.now());
			// 터치 디바이스가 아닌 경우에만 자동 재생 계속
			const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			setIsStoryPlaying(!isTouch);
		} else {
			// 첫 번째 스토리에서 이전으로 가려고 하면 카드 축소
			onExpand?.();
		}
	};

	const goToStory = (index: number) => {
		if (index >= 0 && index < storySlides.length) {
			setCurrentStoryIndex(index);
			// 터치 디바이스가 아닌 경우에만 자동 재생 활성화
			const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			setIsStoryPlaying(!isTouch);
			// 프로그레스 애니메이션 리셋
			setProgressKey((prev) => prev + 1);
			setPausedProgress(0);
			setStoryStartTime(Date.now());
		}
	};

	// 스토리 자동 재생 일시정지/재시작
	const pauseStory = () => {
		if (isStoryPlaying) {
			// 현재 진행률 계산
			const now = Date.now();
			const elapsed = now - storyStartTime;
			const totalDuration = storySlides[currentStoryIndex] === 'description' ? 5000 : 3000;
			const currentProgress = Math.min(elapsed / totalDuration, 1);
			setPausedProgress(currentProgress);
		}
		setIsStoryPlaying(false);
		if (storyTimerRef.current) {
			window.clearTimeout(storyTimerRef.current);
			storyTimerRef.current = null;
		}
	};

	const resumeStory = () => {
		// 터치 디바이스가 아닌 경우에만 자동 재생 재시작
		const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		if (!isTouch) {
			setIsStoryPlaying(true);
		}
		// 프로그레스 애니메이션은 현재 위치에서 계속 - progressKey 변경하지 않음
	};

	// 터치 이벤트 핸들러
	const handleTouchStart = (e: React.TouchEvent) => {
		if (!isExpanded) return;

		const touch = e.touches[0];
		if (touch) {
			setTouchStartX(touch.clientX);
			setTouchStartY(touch.clientY);
			setIsSwipeInProgress(true);
			// 터치 시작 시 자동 재생 일시정지
			pauseStory();
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isExpanded || !isSwipeInProgress) return;

		// 스와이프 중 스크롤 방지
		e.preventDefault();
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!isExpanded || !isSwipeInProgress) return;

		const touch = e.changedTouches[0];
		if (touch) {
			const deltaX = touch.clientX - touchStartX;
			const deltaY = touch.clientY - touchStartY;

			// 수직 스와이프보다 수평 스와이프가 더 클 때만 처리
			if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
				if (deltaX > 0) {
					goToPrevStory();
				} else {
					goToNextStory();
				}
			} else {
				// 스와이프하지 않았으면 자동 재생 재시작 (progressKey 변경 없이)
				resumeStory();
			}
		}

		setIsSwipeInProgress(false);
	};

	// 마우스 클릭 네비게이션 (확대된 상태에서만)
	const handleStoryClick = (e: React.MouseEvent) => {
		if (!isExpanded) return;

		e.stopPropagation();

		const rect = storyContainerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const clickX = e.clientX - rect.left;
		const centerX = rect.width / 2;

		if (clickX < centerX) {
			goToPrevStory();
		} else {
			goToNextStory();
		}
	};

	// 마우스 호버 시 자동 재생 일시정지
	const handleMouseEnter = () => {
		if (isExpanded) {
			pauseStory();
		}
	};

	const handleMouseLeave = () => {
		if (isExpanded) {
			resumeStory();
		}
	};

	// 마우스 클릭 이벤트 처리
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();

		// + 키가 눌린 상태에서 클릭
		if (keyPressed === '+') {
			if (!product.isLiked) {
				onLikeToggle(product.id);
			} else {
				// 이미 좋아요한 상품에 + 키로 시도하면 흔들기
				triggerShake();
			}
		}
		// - 키가 눌린 상태에서 클릭
		else if (keyPressed === '-') {
			if (product.isLiked) {
				onLikeToggle(product.id);
			} else {
				// 좋아요하지 않은 상품에 - 키로 시도하면 흔들기
				triggerShake();
			}
		}
		// 일반 클릭 시 확대/축소 토글
		else {
			onExpand?.();
		}
	};

	return (
		<div
			className={`relative cursor-pointer group transition-all duration-500 ease-in-out`}
			data-product-id={product.id}
			onClick={isExpanded ? undefined : handleClick}
			style={{
				width: layoutConfig?.cardWidth || '12.5rem',
				height: layoutConfig?.cardHeight || '15.65rem',
				maxWidth: layoutConfig?.maxCardWidth,
				maxHeight: layoutConfig?.maxCardHeight,
				transformOrigin: isLastColumn ? 'top right' : 'top left',
				transform: isExpanded ? `scaleX(${isMobile ? '2.09' : '2.08'}) scaleY(2.064)` : 'scale(1)', // 모바일: 2.08, 데스크탑: 2.09
			}}>
			{/* 키보드 단축키 가이드 - 모든 상품에 오버레이 */}
			{keyPressed && <div className="absolute inset-0 bg-black/70 transition-all duration-200 ease-in-out z-30" />}

			{/* 키보드 단축키 하트 미리보기 - 깜빡이는 하트 (액션 가능한 상품) */}
			{keyPressed && ((keyPressed === '+' && !product.isLiked) || (keyPressed === '-' && product.isLiked)) && (
				<div className="absolute inset-0 flex items-center justify-center z-30">
					<div
						className={`transform scale-110 transition-all duration-300 ease-in-out ${
							isKeyboardShaking ? 'animate-shake' : 'animate-pulse'
						}`}>
						<svg width="60" height="56" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
							<path
								d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
								fill={keyPressed === '+' ? '#9CA3AF' : 'url(#paint0_linear_keyboard)'}
							/>
							<defs>
								<linearGradient
									id="paint0_linear_keyboard"
									x1="5.80001"
									y1="0.429016"
									x2="5.80001"
									y2="9.97102"
									gradientUnits="userSpaceOnUse">
									<stop stopColor="#FF0D0D" />
									<stop offset="1" stopColor="#FF5093" />
								</linearGradient>
							</defs>
						</svg>
					</div>
				</div>
			)}

			{/* 키보드 단축키 하트 미리보기 - 정적 하트 (액션 불가능한 상품) */}
			{keyPressed && ((keyPressed === '+' && product.isLiked) || (keyPressed === '-' && !product.isLiked)) && (
				<div className="absolute inset-0 flex items-center justify-center z-30">
					<div
						className={`transform scale-110 transition-all duration-300 ease-in-out opacity-60 ${
							isKeyboardShaking ? 'animate-shake' : ''
						}`}>
						<svg width="60" height="56" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
							<path
								d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
								fill={keyPressed === '+' ? 'url(#paint0_linear_keyboard_static)' : '#9CA3AF'}
							/>
							<defs>
								<linearGradient
									id="paint0_linear_keyboard_static"
									x1="5.80001"
									y1="0.429016"
									x2="5.80001"
									y2="9.97102"
									gradientUnits="userSpaceOnUse">
									<stop stopColor="#FF0D0D" />
									<stop offset="1" stopColor="#FF5093" />
								</linearGradient>
							</defs>
						</svg>
					</div>
				</div>
			)}

			<div
				className="w-full h-full bg-cover bg-center relative overflow-hidden"
				style={{
					backgroundImage: `url(${
						isExpanded
							? storySlides[currentStoryIndex] === 'description'
								? product.imageUrl
								: storySlides[currentStoryIndex]
							: product.imageUrl
					})`,
				}}
				ref={storyContainerRef}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onClick={isExpanded ? handleStoryClick : handleClick}>
				{/* 기본 그라데이션 오버레이 - 확대 상태에서는 숨김 */}
				{!isExpanded && (
					<div
						className={`absolute inset-0 bg-gradient-to-t from-black black black via-black/30 transparent transparent to-transparent group-hover:opacity-0 transition-opacity duration-300 ease-in-out ${
							isHovered ? 'opacity-0' : ''
						}`}
					/>
				)}

				{/* 드래그 호버 시 또는 흔들기 시 어두운 오버레이 - 확대 상태에서는 숨김 */}
				{!isExpanded && (isHovered || isShaking) && (
					<div className="absolute inset-0 bg-black/70 transition-all duration-200 ease-in-out" />
				)}

				{/* 드래그 호버 시 또는 흔들기 시 중앙 하트 미리보기 - 확대 상태에서는 숨김 */}
				{!isExpanded && (isHovered || isShaking) && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div
							key={`heart-${product.id}-${animationKey}`}
							className={`transform scale-110 transition-all duration-300 ease-in-out ${
								isShaking ? 'animate-shake-heart' : 'animate-pulse'
							}`}>
							<svg width="60" height="56" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
								<path
									d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
									fill={product.isLiked ? 'url(#paint0_linear_preview)' : '#9CA3AF'}
								/>
								<defs>
									<linearGradient
										id="paint0_linear_preview"
										x1="5.80001"
										y1="0.429016"
										x2="5.80001"
										y2="9.97102"
										gradientUnits="userSpaceOnUse">
										<stop stopColor="#FF0D0D" />
										<stop offset="1" stopColor="#FF5093" />
									</linearGradient>
								</defs>
							</svg>
						</div>
					</div>
				)}

				{/* 인스타그램 스타일 하트 이펙트 */}
				{likeEffect && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
						{product.isLiked ? (
							/* 좋아요 효과 - 일반 하트 */
							<div className="heart-burst heart-like">
								<svg width="80" height="75" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
									<path
										d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
										fill="url(#paint0_linear_burst)"
									/>
									<defs>
										<linearGradient
											id="paint0_linear_burst"
											x1="5.80001"
											y1="0.429016"
											x2="5.80001"
											y2="9.97102"
											gradientUnits="userSpaceOnUse">
											<stop stopColor="#FF0D0D" />
											<stop offset="1" stopColor="#FF5093" />
										</linearGradient>
									</defs>
								</svg>
							</div>
						) : (
							/* 취소 효과 - 쪼개지는 하트 */
							<>
								{/* 왼쪽 하트 조각 */}
								<div className="heart-break-left">
									<svg
										width="80"
										height="75"
										viewBox="0 0 11 10"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="drop-shadow-2xl">
										<path
											d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
											fill="#9CA3AF"
										/>
									</svg>
								</div>

								{/* 오른쪽 하트 조각 */}
								<div className="heart-break-right">
									<svg
										width="80"
										height="75"
										viewBox="0 0 11 10"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className="drop-shadow-2xl">
										<path
											d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
											fill="#9CA3AF"
										/>
									</svg>
								</div>
							</>
						)}
					</div>
				)}

				{/* 확대 상태에서의 스토리 인디케이터 - 더 하단에 위치 */}
				{isExpanded && (
					<div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 z-20">
						{storySlides.map((_, index) => (
							<div
								key={index}
								className="h-1 flex-1 rounded-full bg-white/30 cursor-pointer overflow-hidden"
								onClick={(e) => {
									e.stopPropagation();
									goToStory(index);
								}}>
								{/* 프로그레스바 애니메이션 */}
								<div
									key={`progress-${index}-${progressKey}`}
									className={`h-full bg-white rounded-full ${
										index === currentStoryIndex && isStoryPlaying
											? 'animate-story-progress'
											: index < currentStoryIndex
											? 'w-full'
											: index === currentStoryIndex && !isStoryPlaying
											? '' // 일시정지 상태는 별도 스타일 적용
											: 'w-0'
									}`}
									style={{
										...(index === currentStoryIndex && isStoryPlaying
											? {
													animationDuration: `${storySlides[currentStoryIndex] === 'description' ? '5000ms' : '3000ms'}`,
													animationDelay: `${-pausedProgress * (storySlides[currentStoryIndex] === 'description' ? 5000 : 3000)}ms`,
											  }
											: index === currentStoryIndex && !isStoryPlaying
											? {
													width: `${pausedProgress * 100}%`,
													transition: 'none', // 일시정지 시 transition 제거
											  }
											: {}),
									}}
								/>
							</div>
						))}
					</div>
				)}

				{/* 확대 상태에서의 설명 슬라이드 */}
				{isExpanded && storySlides[currentStoryIndex] === 'description' && (
					<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black/95 flex flex-col p-4">
						<div className="text-white text-[0.6rem]">
							{/* 상품명 */}
							<div className="text-[0.75rem]">{product.name}</div>

							<div className="flex text-[0.875rem] gap-1 font-bold">
								<p className="">기부자</p>
								<p className="">{product.donorName || '익명'}</p>
							</div>
							{/* 가격 */}
							<div className="">{product.price.toLocaleString()}원</div>

							{/* 상품 상태 및 기부자 */}
							<p className="">{product.condition || '정보 없음'}</p>
							{/* 상품 설명 */}
							<p className="">{product.description}</p>
						</div>
					</div>
				)}

				{/* 제품 정보 - 확대 상태에서는 숨김 */}
				{!isExpanded && (
					<div
						className={`absolute bottom-0 left-0 right-0 flex flex-col group-hover:opacity-0 transition-opacity duration-300 ease-in-out ${
							isHovered || likeEffect || isShaking ? 'opacity-0' : ''
						} p-3.5 pb-3`}>
						{/* 탐내요 버튼 */}
						<button
							className={`flex items-center gap-1 transition-opacity w-fit py-[0.315rem] px-1.5 mb-1 bg-white rounded-full pointer-events-none select-none ${
								isExpanded ? 'scale-125' : ''
							}`}
							style={{
								userSelect: 'none',
								WebkitUserSelect: 'none',
								msUserSelect: 'none',
							}}
							onClick={(e) => {
								// 키보드 단축키가 눌린 상태에서는 이벤트 전파 허용
								if (keyPressed === '+' || keyPressed === '-') {
									// 키보드 단축키 로직 실행
									handleClick(e as React.MouseEvent);
								} else {
									e.stopPropagation();
									e.preventDefault();
									// 일반 클릭 완전히 비활성화
								}
							}}>
							{/* 하트 아이콘 */}
							<FavoriteIcon isLiked={product.isLiked ?? false} />
							<span className="text-xs font-medium text-black leading-none">
								{(product.favorites || 0) > 1000000
									? `${Math.floor((product.favorites || 0) / 100000000)}억+명이 탐내요`
									: `${product.favorites || 0}명이 탐내요`}
							</span>
						</button>

						{/* 제품명 */}
						<div className={`text-white ${isExpanded ? 'text-lg line-clamp-2' : 'text-sm line-clamp-1'}`}>{product.name}</div>

						{/* 확대된 상태에서만 제품 설명 표시 */}
						{isExpanded && <div className="text-white/80 text-sm mt-1 line-clamp-2">{product.description}</div>}

						{/* 가격 */}
						<div className={`text-white font-semibold ${isExpanded ? 'text-xl mt-1' : 'text-base'}`}>
							{product.price.toLocaleString()}원
						</div>
					</div>
				)}
			</div>

			{/* 인스타그램 스타일 하트 이펙트 CSS */}
			{likeEffect && (
				<style>{`
					@keyframes heartLike {
						0% {
							transform: scale(0);
							opacity: 0;
						}
						15% {
							transform: scale(1.2);
							opacity: 1;
						}
						30% {
							transform: scale(0.95);
							opacity: 1;
						}
						45% {
							transform: scale(1.1);
							opacity: 1;
						}
						80% {
							transform: scale(1);
							opacity: 1;
						}
						100% {
							transform: scale(1);
							opacity: 0;
						}
					}
					
					/* 하트 쪼개기 - 왼쪽 조각 */
					@keyframes heartBreakLeft {
						0% {
							transform: scale(1) rotate(0deg);
							clip-path: polygon(0 0, 45% 0, 55% 20%, 40% 40%, 50% 60%, 35% 80%, 45% 100%, 0 100%);
							opacity: 1;
						}
						100% {
							transform: scale(0.8) rotate(-10deg) translate(-10px, 20px);
							clip-path: polygon(0 0, 45% 0, 55% 20%, 40% 40%, 50% 60%, 35% 80%, 45% 100%, 0 100%);
							opacity: 0;
						}
					}
					
					/* 하트 쪼개기 - 오른쪽 조각 */
					@keyframes heartBreakRight {
						0% {
							transform: scale(1) rotate(0deg);
							clip-path: polygon(55% 0, 100% 0, 100% 100%, 45% 100%, 35% 80%, 50% 60%, 40% 40%, 55% 20%);
							opacity: 1;
						}
						100% {
							transform: scale(0.9) rotate(10deg) translate(20px, 20px);
							clip-path: polygon(55% 0, 100% 0, 100% 100%, 45% 100%, 35% 80%, 50% 60%, 40% 40%, 55% 20%);
							opacity: 0;
						}
					}
					
					.heart-burst {
						animation-duration: 1s;
						animation-timing-function: ease-out;
						animation-fill-mode: forwards;
					}
					
					.heart-like {
						animation-name: heartLike;
					}
					
					.heart-break-left {
						animation: heartBreakLeft 1.0s ease-out forwards;
						position: absolute;
					}
					
					.heart-break-right {
						animation: heartBreakRight 1.0s ease-out forwards;
						position: absolute;
					}
				`}</style>
			)}

			{/* 흔들기 애니메이션 CSS */}
			{(isKeyboardShaking || isShaking) && (
				<style>{`
					@keyframes shake {
						0%, 100% { transform: scale(1.1) translateX(0); }
						10%, 30%, 50%, 70%, 90% { transform: scale(1.1) translateX(-6px); }
						20%, 40%, 60%, 80% { transform: scale(1.1) translateX(6px); }
					}
					
					@keyframes shakeHeart {
						0% { transform: scale(1.1) translateX(0); opacity: 1; }
						10%, 30%, 50% { transform: scale(1.1) translateX(-6px); opacity: 1; }
						20%, 40% { transform: scale(1.1) translateX(6px); opacity: 1; }
						60% { transform: scale(1.1) translateX(0); opacity: 1; }
						100% { transform: scale(1.1) translateX(0); opacity: 0; }
					}
					
					.animate-shake {
						animation: shake 0.5s ease-in-out;
					}
					
					.animate-shake-heart {
						animation: shakeHeart 0.6s ease-in-out forwards;
						animation-fill-mode: forwards;
					}
					
					/* 애니메이션 리셋을 위한 클래스 */
					.animate-shake-heart-reset {
						animation: none !important;
						opacity: 1 !important;
						transform: scale(1.1) translateX(0) !important;
					}
				`}</style>
			)}

			{/* 스토리 프로그레스바 애니메이션 CSS */}
			{isExpanded && (
				<style>{`
					@keyframes storyProgress {
						0% { width: 0%; }
						100% { width: 100%; }
					}
					
					.animate-story-progress {
						animation: storyProgress linear;
						animation-fill-mode: forwards;
					}
				`}</style>
			)}
		</div>
	);
});

export default ProductCard;
