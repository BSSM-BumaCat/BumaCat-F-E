interface SearchBarProps {
	searchTerm: string;
	onSearch: (term: string) => void;
	totalDonations: number;
}

export default function SearchBar({ searchTerm, onSearch, totalDonations }: SearchBarProps) {
	return (
		<div className="mb-8">
			<div
				className="relative rounded-3xl overflow-hidden flex items-center bg-white/80 backdrop-blur-sm shadow-lg w-[33rem] h-12"
				style={{
					background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%), rgba(255, 255, 255, 0.79)',
					boxShadow: '0rem 0.69rem 1rem 0rem rgba(49, 44, 37, 0.04)',
				}}>
				<input
					type="text"
					placeholder={`누적 기부 금액 ${totalDonations.toLocaleString()}원`}
					value={searchTerm}
					onChange={(e) => onSearch(e.target.value)}
					className="flex-1 bg-transparent outline-none px-6 text-base font-normal text-amber-900 font-['Pretendard'] leading-tight"
				/>
				<div className="px-4">
					<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
						<path
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							stroke="#5E4435"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}
