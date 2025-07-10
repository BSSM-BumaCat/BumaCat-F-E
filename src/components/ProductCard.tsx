import type { Product } from '../Root';
import FavoriteIcon from './FavoriteIcon';

type ProductWithFavorites = Product & {
	favorites?: number;
	isLiked?: boolean;
};

interface ProductCardProps {
	product: ProductWithFavorites;
	onLikeToggle: (productId: number) => void;
}

export default function ProductCard({ product, onLikeToggle }: ProductCardProps) {
	return (
		<div className="relative cursor-pointer group w-[12.5rem] h-[15.65rem]">
			<div 
				className="w-full h-full bg-cover bg-center relative overflow-hidden"
				style={{ backgroundImage: `url(${product.imageUrl})` }}
			>
				{/* 그라데이션 오버레이 */}
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

				{/* 제품 정보 */}
				<div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
					{/* 탐내요 버튼 */}
					<button
						className="flex items-center gap-1 hover:opacity-90 transition-opacity w-fit py-[0.25rem] px-1.5 mb-1.5 bg-white rounded-full"
						onClick={(e) => {
							e.stopPropagation();
							onLikeToggle(product.id);
						}}>
						{/* 하트 아이콘 */}
						<FavoriteIcon />
						<span className="text-xs font-medium text-black leading-none">
							{(product.favorites || 0) > 1000000
								? `${Math.floor((product.favorites || 0) / 100000000)}억+명이 탐내요`
								: `${product.favorites || 0}명이 탐내요`}
						</span>
					</button>

					{/* 제품명 */}
					<div className="text-white text-sm line-clamp-1">{product.name}</div>

					{/* 가격 */}
					<div className="text-white text-base font-semibold">{product.price.toLocaleString()}원</div>
				</div>
			</div>
		</div>
	);
}
