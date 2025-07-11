interface AnnouncementProps {
	message: string;
	isVisible: boolean;
}

export default function Announcement({ message, isVisible }: AnnouncementProps) {
	if (!isVisible) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r text-white px-4 py-3 shadow-lg">
			<div className="max-w-6xl mx-auto flex items-center justify-center">
				<div className="flex items-center space-x-3">
					<span className="bg-white/50 rounded-full px-2 py-1 text-xs font-semibold">📢 공지</span>
					<span className="text-sm font-medium">{message}</span>
				</div>
			</div>
		</div>
	);
}
