import { useState, useRef } from 'react';

interface DraggableHeartProps {
	onHeartDrop: (productId: number, isLike: boolean) => void;
	products: Array<{ id: number; isLiked?: boolean }>;
	onHoverProduct?: (productId: number | null, isLikeMode: boolean, canDrop: boolean) => void;
}

export default function DraggableHeart({ onHeartDrop, products, onHoverProduct }: DraggableHeartProps) {
	const [isLikeMode, setIsLikeMode] = useState(true); // true = 빨간색(좋아요), false = 회색(취소)
	const [isDragging, setIsDragging] = useState(false);
	const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
	const [canDrop, setCanDrop] = useState(true);
	const heartRef = useRef<HTMLDivElement>(null);
	const offsetRef = useRef({ x: 0, y: 0 });
	const dragStartTimeRef = useRef<number>(0);
	const hasDraggedRef = useRef(false);
	const mouseDownPosRef = useRef({ x: 0, y: 0 });
	const heartOriginalPosRef = useRef({ x: 0, y: 0 });

	const handleMouseDown = (e: React.MouseEvent) => {
		console.log('Mouse down triggered');
		if (!heartRef.current) return;

		const rect = heartRef.current.getBoundingClientRect();
		offsetRef.current = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};

		// 하트의 원래 중앙 위치 저장 (화면 기준)
		heartOriginalPosRef.current = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		};

		dragStartTimeRef.current = Date.now();
		hasDraggedRef.current = false;
		mouseDownPosRef.current = { x: e.clientX, y: e.clientY };

		console.log('Setting isDragging to true');
		setIsDragging(true);

		// 드래그 시작 시 초기 위치를 하트의 원래 위치로 설정 (마우스 위치가 아닌)
		const initialPos = {
			x: 0, // 하트 원래 위치에서 시작
			y: 0,
		};
		console.log('Initial drag position:', initialPos);
		console.log('Heart original position:', heartOriginalPosRef.current);
		console.log('Mouse position:', { x: e.clientX, y: e.clientY });
		setDragPosition(initialPos);

		// useRef로 드래그 상태 추적
		const isDraggingRef = { current: true };

		const mouseMoveHandler = (e: MouseEvent) => {
			console.log('Mouse move triggered, isDraggingRef:', isDraggingRef.current);
			if (!isDraggingRef.current) return;

			// 최소 이동 거리 체크 (5px 이상 이동해야 드래그로 인식)
			const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
			const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			console.log('Mouse movement distance from start:', distance);

			if (distance > 5) {
				console.log('Distance threshold exceeded, marking as drag');
				hasDraggedRef.current = true;
			}

			const newPosition = {
				x: e.clientX - heartOriginalPosRef.current.x,
				y: e.clientY - heartOriginalPosRef.current.y,
			};
			setDragPosition(newPosition);

			// 현재 호버 중인 상품 확인
			const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
			console.log('Mouse at:', e.clientX, e.clientY, 'Element below:', elementBelow);

			const productCard = elementBelow?.closest('[data-product-id]');
			console.log('Product card found:', productCard);

			if (productCard) {
				const productId = parseInt(productCard.getAttribute('data-product-id') || '0');
				console.log('Product ID:', productId);

				const product = products.find((p) => p.id === productId);
				console.log(
					'All products:',
					products.map((p) => ({ id: p.id, isLiked: p.isLiked })),
				);
				if (product) {
					const currentlyLiked = product.isLiked || false;
					console.log('Product:', product.id, 'isLiked:', currentlyLiked, 'isLikeMode:', isLikeMode);
					const cannotDrop = (isLikeMode && currentlyLiked) || (!isLikeMode && !currentlyLiked);
					console.log('cannotDrop:', cannotDrop, 'setting canDrop to:', !cannotDrop);
					const newCanDrop = !cannotDrop;
					setCanDrop(newCanDrop);

					// 상품 호버 상태 전달
					onHoverProduct?.(productId, isLikeMode, newCanDrop);
				}
			} else {
				console.log('No product card, setting canDrop to true');
				setCanDrop(true);
				// 상품 호버 해제
				onHoverProduct?.(null, isLikeMode, true);
			}
		};

		const mouseUpHandler = (e: MouseEvent) => {
			console.log('Mouse up triggered');
			isDraggingRef.current = false;
			setIsDragging(false);
			document.removeEventListener('mousemove', mouseMoveHandler);
			document.removeEventListener('mouseup', mouseUpHandler);

			// 드래그 종료 시 호버 상태 초기화
			onHoverProduct?.(null, isLikeMode, true);

			// 클릭 판단 로직을 mouseUp에서 처리
			const timeDiff = Date.now() - dragStartTimeRef.current;
			const wasClick = !hasDraggedRef.current && timeDiff < 1000;

			console.log('=== MOUSE UP CHECK ===');
			console.log('hasDragged:', hasDraggedRef.current);
			console.log('timeDiff:', timeDiff);
			console.log('wasClick:', wasClick);

			if (wasClick) {
				console.log('TOGGLING mode from', isLikeMode, 'to', !isLikeMode);
				setIsLikeMode(!isLikeMode);
			} else if (hasDraggedRef.current) {
				// 드래그였다면 드롭 처리
				const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
				const productCard = elementBelow?.closest('[data-product-id]');

				if (productCard && canDrop) {
					const productId = parseInt(productCard.getAttribute('data-product-id') || '0');
					if (productId) {
						onHeartDrop(productId, isLikeMode);
					}
				}
			}

			setDragPosition({ x: 0, y: 0 });
			setCanDrop(true);
		};

		console.log('Adding event listeners');
		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('mouseup', mouseUpHandler);

		e.preventDefault();
	};

	return (
		<>
			{/* 원형 배경 - 제자리 유지 */}
			<div
				ref={heartRef}
				className={`fixed bottom-8 right-8 w-16 h-16 cursor-pointer select-none z-50 transition-all duration-200 ${
					isDragging ? 'shadow-2xl animate-pulse' : 'hover:scale-105 shadow-lg'
				}`}
				style={{
					zIndex: isDragging ? 1000 : 50,
					cursor: isDragging && !canDrop ? 'not-allowed !important' : 'pointer',
					pointerEvents: isDragging ? 'none' : 'auto',
				}}
				onMouseDown={handleMouseDown}>
				<div
					className={`w-full h-full flex items-center justify-center bg-white rounded-full shadow-lg border-2 ${
						isDragging ? 'border-red-300 bg-gradient-to-br from-white to-red-50' : 'border-gray-200'
					}`}>
					{/* 드래그 중이 아닐 때만 하트 표시 */}
					{!isDragging && (
						<svg
							width="28"
							height="26"
							viewBox="0 0 11 10"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="transition-colors duration-200">
							<path
								d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
								fill={isLikeMode ? 'url(#paint0_linear_444_126)' : '#9CA3AF'}
							/>
							<defs>
								<linearGradient
									id="paint0_linear_444_126"
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
					)}
				</div>

				{/* 모드 표시 텍스트 */}
				<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white bg-black/80 px-2 py-1 rounded whitespace-nowrap">
					{isLikeMode ? '탐내요 +' : '탐내요 -'}
				</div>
			</div>

			{/* 드래그 중인 하트 - 별도 엘리먼트 */}
			{isDragging && (
				<svg
					width="28"
					height="26"
					viewBox="0 0 11 10"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="wiggle-animation fixed"
					style={{
						left: `${heartOriginalPosRef.current.x + dragPosition.x - 14}px`,
						top: `${heartOriginalPosRef.current.y + dragPosition.y - 13}px`,
						transform: 'scale(1.3)',
						filter: 'drop-shadow(0 0 15px rgba(255, 13, 13, 0.8))',
						zIndex: 1001,
						pointerEvents: 'none',
					}}>
					<path
						d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z"
						fill={isLikeMode ? 'url(#paint0_linear_444_126_dragging)' : '#9CA3AF'}
					/>
					<defs>
						<linearGradient
							id="paint0_linear_444_126_dragging"
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
			)}

			{/* 드래그 중일 때 가이드 텍스트 */}
			{isDragging && (
				<div
					className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg z-50 ${
						!canDrop ? 'text-red-200 bg-red-900/90' : 'text-white bg-black/80'
					}`}>
					{!canDrop
						? isLikeMode
							? '❌ 이미 탐내고 있는 상품입니다'
							: '❌ 탐내지 않은 상품입니다'
						: isLikeMode
						? '✨ 탐내요를 추가할 상품 위에 놓아주세요'
						: '🗑️ 탐내요를 취소할 상품 위에 놓아주세요'}
				</div>
			)}

			{/* 전역 스타일로 커서 강제 설정 */}
			{isDragging && !canDrop && (
				<style>{`
          * {
            cursor: not-allowed !important;
          }
        `}</style>
			)}

			{/* 드래그 중 회전 애니메이션 */}
			{isDragging && (
				<style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          .wiggle-animation {
            animation: wiggle 0.3s ease-in-out infinite;
          }
        `}</style>
			)}
		</>
	);
}
