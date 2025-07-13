import { useState, useRef, useEffect } from 'react';

interface DraggableHeartProps {
	onHeartDrop: (productId: number, isLike: boolean) => void;
	products: Array<{ id: number; isLiked?: boolean }>;
	onHoverProduct?: (productId: number | null, isLikeMode: boolean, canDrop: boolean) => void;
	onDragStateChange?: (isDragging: boolean) => void;
}

export default function DraggableHeart({ onHeartDrop, products, onHoverProduct, onDragStateChange }: DraggableHeartProps) {
	const [isLikeMode, setIsLikeMode] = useState(true); // true = 빨간색(좋아요), false = 회색(취소)
	const [isDragging, setIsDragging] = useState(false);
	const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
	const [canDrop, setCanDrop] = useState(true);
	const [showErrorMessage, setShowErrorMessage] = useState(false);
	const [errorShake, setErrorShake] = useState(false);
	const [errorFadeOut, setErrorFadeOut] = useState(false);
	const heartRef = useRef<HTMLDivElement>(null);
	const offsetRef = useRef({ x: 0, y: 0 });
	const dragStartTimeRef = useRef<number>(0);
	const hasDraggedRef = useRef(false);
	const mouseDownPosRef = useRef({ x: 0, y: 0 });
	const heartOriginalPosRef = useRef({ x: 0, y: 0 });
	const canDropRef = useRef(true);
	const errorTimeoutRef = useRef<number | null>(null);
	const isDraggingRef = useRef(false);

	const handleMouseDown = (e: React.MouseEvent) => {
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

		setIsDragging(true);
		onDragStateChange?.(true);

		// 드래그 시작 시 초기 위치를 하트의 원래 위치로 설정 (마우스 위치가 아닌)
		const initialPos = {
			x: 0, // 하트 원래 위치에서 시작
			y: 0,
		};
		setDragPosition(initialPos);

		// useRef로 드래그 상태 추적
		const isDraggingRef = { current: true };

		const mouseMoveHandler = (e: MouseEvent) => {
			if (!isDraggingRef.current) return;

			// 최소 이동 거리 체크 (5px 이상 이동해야 드래그로 인식)
			const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
			const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance > 5) {
				hasDraggedRef.current = true;
			}

			const newPosition = {
				x: e.clientX - heartOriginalPosRef.current.x,
				y: e.clientY - heartOriginalPosRef.current.y,
			};
			setDragPosition(newPosition);

			// 현재 호버 중인 상품 확인
			const elementBelow = document.elementFromPoint(e.clientX, e.clientY);

			const productCard = elementBelow?.closest('[data-product-id]');

			if (productCard) {
				const productId = parseInt(productCard.getAttribute('data-product-id') || '0');

				const product = products.find((p) => p.id === productId);
				if (product) {
					const currentlyLiked = product.isLiked || false;
					const cannotDrop = (isLikeMode && currentlyLiked) || (!isLikeMode && !currentlyLiked);
					const newCanDrop = !cannotDrop;

					console.log(
						'Product:',
						productId,
						'isLiked:',
						currentlyLiked,
						'isLikeMode:',
						isLikeMode,
						'cannotDrop:',
						cannotDrop,
						'newCanDrop:',
						newCanDrop,
					);

					setCanDrop(newCanDrop);
					canDropRef.current = newCanDrop;

					// 상품 호버 상태 전달
					onHoverProduct?.(productId, isLikeMode, newCanDrop);
				}
			} else {
				setCanDrop(true);
				canDropRef.current = true;
				// 상품 호버 해제
				onHoverProduct?.(null, isLikeMode, true);
			}
		};

		const mouseUpHandler = (e: MouseEvent) => {
			console.log('MouseUp triggered');
			isDraggingRef.current = false;
			setIsDragging(false);
			onDragStateChange?.(false);
			document.removeEventListener('mousemove', mouseMoveHandler);
			document.removeEventListener('mouseup', mouseUpHandler);

			// 현재 canDrop 상태를 ref에서 가져오기
			const currentCanDrop = canDropRef.current;

			// 클릭 판단 로직을 mouseUp에서 처리
			const timeDiff = Date.now() - dragStartTimeRef.current;
			const wasClick = !hasDraggedRef.current && timeDiff < 1000;

			console.log('hasDragged:', hasDraggedRef.current, 'wasClick:', wasClick);

			if (wasClick) {
				console.log('Click detected');
				setIsLikeMode(!isLikeMode);
			} else if (hasDraggedRef.current) {
				console.log('Drag detected, processing drop');
				// 드래그였다면 드롭 처리
				const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
				const productCard = elementBelow?.closest('[data-product-id]');

				console.log('Drop target:', productCard, 'currentCanDrop:', currentCanDrop);

				if (productCard) {
					const productId = parseInt(productCard.getAttribute('data-product-id') || '0');
					if (productId) {
						if (currentCanDrop) {
							console.log('Valid drop');
							onHeartDrop(productId, isLikeMode);
						} else {
							console.log('Invalid drop - showing error message');

							// 기존 타이머가 있으면 취소
							if (errorTimeoutRef.current) {
								clearTimeout(errorTimeoutRef.current);
							}

							// canDrop이 false일 때 에러 메시지 표시
							setShowErrorMessage(true);
							setErrorShake(true);
							setErrorFadeOut(false);

							// 흔들기 애니메이션 제거
							setTimeout(() => setErrorShake(false), 500);

							// 1.3초 후 페이드아웃 시작, 2초 후 완전히 숨김
							errorTimeoutRef.current = window.setTimeout(() => {
								setErrorFadeOut(true);
								setTimeout(() => {
									setShowErrorMessage(false);
									setErrorFadeOut(false);
								}, 700);
								errorTimeoutRef.current = null;
							}, 1200);
						}
					}
				}
			}

			// 드래그 종료 시 호버 상태 초기화
			onHoverProduct?.(null, isLikeMode, true);
			setDragPosition({ x: 0, y: 0 });
			setCanDrop(true);
			canDropRef.current = true;
		};

		document.addEventListener('mousemove', mouseMoveHandler);
		document.addEventListener('mouseup', mouseUpHandler);

		e.preventDefault();
	};

	// Pointer Events API 사용 - 터치와 마우스 통합 처리
	useEffect(() => {
		const heart = heartRef.current;
		if (!heart) return;

		const handlePointerDown = (e: PointerEvent) => {
			console.log('Pointer down detected:', e.pointerType);
			
			// 터치 또는 마우스 모두 처리
			e.preventDefault();
			e.stopPropagation();

			const rect = heart.getBoundingClientRect();
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

			// 즉시 드래그 상태 활성화
			isDraggingRef.current = true;
			setIsDragging(true);
			onDragStateChange?.(true);

			console.log('Pointer drag started', 'isDraggingRef:', isDraggingRef.current);

			// 드래그 시작 시 초기 위치를 하트의 원래 위치로 설정
			setDragPosition({ x: 0, y: 0 });

			// Pointer capture로 모든 포인터 이벤트를 이 요소로 라우팅
			heart.setPointerCapture(e.pointerId);
		};

		const handlePointerMove = (e: PointerEvent) => {
			if (!isDraggingRef.current) return;
			
			console.log('Pointer move - dragging');
			e.preventDefault();
			e.stopPropagation();

			const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
			const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance > 5) {
				hasDraggedRef.current = true;
			}

			const newPosition = {
				x: e.clientX - heartOriginalPosRef.current.x,
				y: e.clientY - heartOriginalPosRef.current.y,
			};
			setDragPosition(newPosition);

			// 현재 호버 중인 상품 확인
			const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
			const productCard = elementBelow?.closest('[data-product-id]');

			if (productCard) {
				const productId = parseInt(productCard.getAttribute('data-product-id') || '0');
				const product = products.find((p) => p.id === productId);
				if (product) {
					const currentlyLiked = product.isLiked || false;
					const cannotDrop = (isLikeMode && currentlyLiked) || (!isLikeMode && !currentlyLiked);
					const newCanDrop = !cannotDrop;

					setCanDrop(newCanDrop);
					canDropRef.current = newCanDrop;
					onHoverProduct?.(productId, isLikeMode, newCanDrop);
				}
			} else {
				setCanDrop(true);
				canDropRef.current = true;
				onHoverProduct?.(null, isLikeMode, true);
			}
		};

		const handlePointerUp = (e: PointerEvent) => {
			if (!isDraggingRef.current) return;

			console.log('Pointer up - finishing drag');
			e.preventDefault();
			e.stopPropagation();

			isDraggingRef.current = false;
			setIsDragging(false);
			onDragStateChange?.(false);

			const currentCanDrop = canDropRef.current;

			// 클릭 판단 로직
			const timeDiff = Date.now() - dragStartTimeRef.current;
			const wasClick = !hasDraggedRef.current && timeDiff < 1000;

			console.log('Pointer Up - wasClick:', wasClick, 'hasDragged:', hasDraggedRef.current);

			if (wasClick) {
				console.log('Pointer click detected - toggling mode');
				setIsLikeMode(!isLikeMode);
			} else if (hasDraggedRef.current) {
				console.log('Pointer drag detected - processing drop');
				// 드래그였다면 드롭 처리
				const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
				const productCard = elementBelow?.closest('[data-product-id]');

				if (productCard) {
					const productId = parseInt(productCard.getAttribute('data-product-id') || '0');
					if (productId && currentCanDrop) {
						console.log('Valid pointer drop');
						onHeartDrop(productId, isLikeMode);
					}
				}
			}

			// 드래그 종료 시 호버 상태 초기화
			onHoverProduct?.(null, isLikeMode, true);
			setDragPosition({ x: 0, y: 0 });
			setCanDrop(true);
			canDropRef.current = true;

			// Pointer capture 해제
			heart.releasePointerCapture(e.pointerId);
		};

		// Pointer Events 등록 - passive: false로 preventDefault 보장
		heart.addEventListener('pointerdown', handlePointerDown, { passive: false });
		heart.addEventListener('pointermove', handlePointerMove, { passive: false });
		heart.addEventListener('pointerup', handlePointerUp, { passive: false });
		heart.addEventListener('pointercancel', handlePointerUp, { passive: false });

		return () => {
			heart.removeEventListener('pointerdown', handlePointerDown);
			heart.removeEventListener('pointermove', handlePointerMove);
			heart.removeEventListener('pointerup', handlePointerUp);
			heart.removeEventListener('pointercancel', handlePointerUp);
		};
	}, [isLikeMode, products, onHeartDrop, onHoverProduct, onDragStateChange]);



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
					pointerEvents: 'auto', // 항상 터치 가능하게 변경
					touchAction: 'none', // 터치 액션 비활성화
					userSelect: 'none',
					WebkitUserSelect: 'none',
					msUserSelect: 'none'
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

			{/* 에러 메시지 (드롭 실패 시) */}
			{showErrorMessage && (
				<div
					className={`fixed top-4 left-1/2 px-4 py-2 rounded-lg z-50 text-red-200 bg-red-900/90 transition-opacity duration-800 ${
						errorShake ? 'animate-shake' : ''
					} ${errorFadeOut ? 'opacity-0' : 'opacity-100'}`}
					style={{ transform: 'translateX(-50%)' }}>
					{isLikeMode ? '❌ 이미 탐내고 있는 상품입니다!' : '❌ 탐내지 않은 상품입니다!'}
				</div>
			)}

			{/* 드래그 중 전역 터치 스크롤 차단 */}
			{isDragging && (
				<style>{`
          body, html {
            touch-action: none !important;
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
          }
          * {
            touch-action: none !important;
            ${!canDrop ? 'cursor: not-allowed !important;' : ''}
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

			{/* 에러 메시지 흔들기 애니메이션 */}
			{showErrorMessage && (
				<style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(-50%); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(calc(-50% - 8px)); }
            20%, 40%, 60%, 80% { transform: translateX(calc(-50% + 8px)); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
			)}
		</>
	);
}
