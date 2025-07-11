import { useState, useEffect, useRef } from 'react';
import { useProducts } from './hooks/useProducts';
import ProductGrid, { type ProductGridRef } from './components/ProductGrid';
import NoiseOverlay from './components/NoiseOverlay';
import DraggableHeart from './components/DraggableHeart';
import Announcement from './components/Announcement';

function App() {
	const [totalDonations] = useState(1003000);
	const [hoveredProduct, setHoveredProduct] = useState<{
		id: number;
		isLikeMode: boolean;
		canDrop: boolean;
	} | null>(null);
	const [announcement, setAnnouncement] = useState<string | null>(null);
	const [showAnnouncement, setShowAnnouncement] = useState(false);
	const [bounceAnimation, setBounceAnimation] = useState<'top' | 'bottom' | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [keyPressed, setKeyPressed] = useState<string | null>(null);
	const lastScrollTop = useRef(0);
	const productGridRef = useRef<ProductGridRef>(null);

	const { filteredProducts, loading, error, searchTerm, handleLikeToggle, handleSearch } = useProducts();

	const handleHeartDrop = (productId: number, isLike: boolean) => {
		const product = filteredProducts.find((p) => p.id === productId);
		if (!product) return;

		const currentlyLiked = product.isLiked || false;

		// 좋아요 모드: 좋아요하지 않은 상품에만 적용
		// 취소 모드: 이미 좋아요한 상품에만 적용
		if ((isLike && !currentlyLiked) || (!isLike && currentlyLiked)) {
			handleLikeToggle(productId);
		}
	};

	const handleHoverProduct = (productId: number | null, isLikeMode: boolean, canDrop: boolean) => {
		if (productId === null) {
			setHoveredProduct(null);
		} else {
			setHoveredProduct({ id: productId, isLikeMode, canDrop });
		}
	};

	// 공지사항 확인
	useEffect(() => {
		const checkAnnouncement = () => {
			const savedAnnouncement = localStorage.getItem('announcement');
			setAnnouncement(savedAnnouncement);
			setShowAnnouncement(!!savedAnnouncement);
		};

		checkAnnouncement();

		// 주기적으로 공지사항 확인 (관리자가 실시간으로 등록할 수 있도록)
		const interval = setInterval(checkAnnouncement, 5000);

		return () => clearInterval(interval);
	}, []);

	// 키보드 상태 감지
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === '+' || e.key === '=' || (e.shiftKey && e.key === '+')) {
				setKeyPressed('+');
			} else if (e.key === '-' || e.key === '_') {
				setKeyPressed('-');
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_' || (!e.shiftKey && keyPressed === '+')) {
				setKeyPressed(null);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [keyPressed]);

	// 전역 휠 이벤트 처리 - 배경 어디서든 스크롤 가능
	useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			// 모든 휠 이벤트를 ProductGrid 스크롤로 전달
			e.preventDefault();
			if (productGridRef.current) {
				productGridRef.current.scrollToPosition(e.deltaY);
			}
		};

		// 전역에 휠 이벤트 리스너 추가
		window.addEventListener('wheel', handleWheel, { passive: false });
		
		return () => {
			window.removeEventListener('wheel', handleWheel);
		};
	}, []);

	// 스크롤 이벤트 처리
	useEffect(() => {
		const handleScroll = (e: Event) => {
			const container = e.target as HTMLElement;
			if (!container) return;

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

		const scrollContainer = document.querySelector('.main-scroll-container');
		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll);
			return () => scrollContainer.removeEventListener('scroll', handleScroll);
		}
	}, []);

	if (loading) {
		return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
	}

	if (error) {
		return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
	}

	return (
		<div
			className="min-h-screen w-full flex flex-col overscroll-none overflow-x-hidden"
			style={{
				backgroundColor: '#0D0C0C',
			}}>
			{/* 공지사항 */}
			<Announcement message={announcement || ''} isVisible={showAnnouncement} />

			{/* 메인 컨텐츠 영역 - 공지사항을 제외한 나머지 공간을 차지 */}
			<div
				className="flex-1 flex items-center justify-center overflow-hidden main-scroll-container"
				style={{
					marginTop: showAnnouncement ? '52px' : '0', // 공지사항 높이만큼 여백
					transition: 'margin-top 0.3s ease',
					padding: '4rem', // 후광 효과를 위한 충분한 패딩
				}}>
				<ProductGrid
					ref={productGridRef}
					products={filteredProducts}
					onLikeToggle={handleLikeToggle}
					searchTerm={searchTerm}
					onSearch={handleSearch}
					totalDonations={totalDonations}
					hoveredProduct={hoveredProduct}
					bounceAnimation={bounceAnimation}
					isDragging={isDragging}
					keyPressed={keyPressed}
				/>
			</div>

			<DraggableHeart 
				onHeartDrop={handleHeartDrop} 
				products={filteredProducts} 
				onHoverProduct={handleHoverProduct}
				onDragStateChange={setIsDragging}
			/>
			<NoiseOverlay />
		</div>
	);
}

export default App;
