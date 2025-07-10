export default function NoiseOverlay() {
	return (
		<div
			className="fixed inset-0 pointer-events-none bg-repeat opacity-10 z-10"
			style={{
				backgroundImage: `url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cfilter id="noise"%3E%3CfeTurbulence baseFrequency="0.6" numOctaves="4"/%3E%3C/filter%3E%3C/defs%3E%3Crect width="100" height="100" filter="url(%23noise)"/%3E%3C/svg%3E')`,
			}}
		/>
	);
}
