import { useState, useEffect, memo } from 'react';
import type { Product } from '../Root';
import FavoriteIcon from './FavoriteIcon';

type ProductWithFavorites = Product & {
	favorites?: number;
	isLiked?: boolean;
};

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
}: ProductCardProps) {
	const [likeEffect, setLikeEffect] = useState(false);
	const [previousLiked, setPreviousLiked] = useState(product.isLiked);

	// 애니메이션 리셋을 위한 상태
	const [animationKey, setAnimationKey] = useState(0);

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
			onClick={handleClick}
			style={{
				width: layoutConfig?.cardWidth || '12.5rem',
				height: layoutConfig?.cardHeight || '15.65rem',
				maxWidth: layoutConfig?.maxCardWidth,
				maxHeight: layoutConfig?.maxCardHeight,
				transformOrigin: isLastColumn ? 'top right' : 'top left',
				transform: isExpanded ? 'scaleX(2.09) scaleY(2.064)' : 'scale(1)', // 너비: (2 * 12.5rem + 1rem) / 12.5rem = 2.08, 높이: (2 * 15.65rem + 1rem) / 15.65rem = 2.064
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

			<div className="w-full h-full bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${product.imageUrl})` }}>
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
		</div>
	);
});

export default ProductCard;
