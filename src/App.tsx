import { useState, useEffect, useRef } from 'react';
import { useProducts } from './hooks/useProducts';
import ProductGrid from './components/ProductGrid';
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
	const lastScrollTop = useRef(0);

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
			className="min-h-screen w-full flex flex-col overscroll-none overflow-x-hidden pb-40"
			style={{
				backgroundColor: '#0D0C0C',
			}}>
			{/* 공지사항 */}
			<Announcement message={announcement || ''} isVisible={showAnnouncement} />

			{/* 메인 컨텐츠 영역 - 공지사항을 제외한 나머지 공간을 차지 */}
			<div
				className="flex-1 flex items-center justify-center p-8 overflow-y-auto overflow-x-hidden main-scroll-container"
				style={{
					marginTop: showAnnouncement ? '52px' : '0', // 공지사항 높이만큼 여백
					transition: 'margin-top 0.3s ease',
				}}>
				<ProductGrid
					products={filteredProducts}
					onLikeToggle={handleLikeToggle}
					searchTerm={searchTerm}
					onSearch={handleSearch}
					totalDonations={totalDonations}
					hoveredProduct={hoveredProduct}
					bounceAnimation={bounceAnimation}
				/>
			</div>

			<DraggableHeart onHeartDrop={handleHeartDrop} products={filteredProducts} onHoverProduct={handleHoverProduct} />
			<NoiseOverlay />
		</div>
	);
}

export default App;
