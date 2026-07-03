import { cn } from "@/lib/utils";

/**
 * The whittle mark — a carving blade paring a shaving off an edge,
 * nodding to "whittling" something down to its essentials.
 */
export function Logo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			className={cn("size-6", className)}
		>
			<path
				d="M4 20L14.5 9.5"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<path
				d="M13 8L18 3L21 6L16 11L13 8Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinejoin="round"
			/>
			<path
				d="M5 15C7 15.5 8.5 17 9 19"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				className="text-primary/40"
			/>
		</svg>
	);
}
