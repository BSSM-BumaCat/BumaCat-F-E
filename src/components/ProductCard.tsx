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
}

export default function ProductCard({ product, onLikeToggle, isHovered }: ProductCardProps) {
	return (
		<div 
			className="relative cursor-pointer group w-[12.5rem] h-[15.65rem]"
			data-product-id={product.id}
		>
			<div 
				className="w-full h-full bg-cover bg-center relative overflow-hidden"
				style={{ backgroundImage: `url(${product.imageUrl})` }}
			>
				{/* 기본 그라데이션 오버레이 */}
				<div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:opacity-0 transition-opacity duration-300 ease-in-out ${
					isHovered ? 'opacity-0' : ''
				}`} />
				
				{/* 드래그 호버 시 어두운 오버레이 */}
				{isHovered && (
					<div className="absolute inset-0 bg-black/70 transition-all duration-200 ease-in-out" />
				)}
				
				{/* 드래그 호버 시 중앙 하트 미리보기 */}
				{isHovered && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="transform scale-110 animate-pulse transition-all duration-300 ease-in-out">
							<svg 
								width="60" 
								height="56" 
								viewBox="0 0 11 10" 
								fill="none" 
								xmlns="http://www.w3.org/2000/svg"
								className="drop-shadow-2xl"
							>
								<path 
									d="M5.80001 9.97102L5.04601 9.29502C4.17067 8.50635 3.44701 7.82602 2.87501 7.25402C2.30301 6.68202 1.84801 6.16852 1.51001 5.71352C1.17201 5.25852 0.935839 4.84035 0.801506 4.45902C0.667173 4.07768 0.600006 3.68768 0.600006 3.28902C0.600006 2.47435 0.873006 1.79402 1.41901 1.24802C1.96501 0.702016 2.64534 0.429016 3.46001 0.429016C3.91067 0.429016 4.33967 0.524349 4.74701 0.715016C5.15434 0.905683 5.50534 1.17435 5.80001 1.52102C6.09467 1.17435 6.44567 0.905683 6.85301 0.715016C7.26034 0.524349 7.68934 0.429016 8.14001 0.429016C8.95467 0.429016 9.63501 0.702016 10.181 1.24802C10.727 1.79402 11 2.47435 11 3.28902C11 3.68768 10.9328 4.07768 10.7985 4.45902C10.6642 4.84035 10.428 5.25852 10.09 5.71352C9.75201 6.16852 9.29701 6.68202 8.72501 7.25402C8.15301 7.82602 7.42934 8.50635 6.55401 9.29502L5.80001 9.97102Z" 
									fill={product.isLiked ? "url(#paint0_linear_preview)" : "#9CA3AF"}
								/>
								<defs>
									<linearGradient 
										id="paint0_linear_preview" 
										x1="5.80001" 
										y1="0.429016" 
										x2="5.80001" 
										y2="9.97102" 
										gradientUnits="userSpaceOnUse"
									>
										<stop stopColor="#FF0D0D"/>
										<stop offset="1" stopColor="#FF5093"/>
									</linearGradient>
								</defs>
							</svg>
						</div>
					</div>
				)}


				{/* 제품 정보 */}
				<div className={`absolute bottom-0 left-0 right-0 p-4 flex flex-col group-hover:opacity-0 transition-opacity duration-300 ease-in-out ${
					isHovered ? 'opacity-0' : ''
				}`}>
					{/* 탐내요 버튼 */}
					<button
						className="flex items-center gap-1 hover:opacity-90 transition-opacity w-fit py-[0.25rem] px-1.5 mb-1.5 bg-white rounded-full"
						onClick={(e) => {
							e.stopPropagation();
							onLikeToggle(product.id);
						}}>
						{/* 하트 아이콘 */}
						<FavoriteIcon isLiked={product.isLiked} />
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
