import { Link } from "react-router";

import { siteConfig } from "@/lib/site";

export function SiteFooter() {
	return (
		<footer className="border-border/60 border-t">
			<div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row">
				<p>
					{siteConfig.name} — {siteConfig.tagline}
				</p>
				<div className="flex items-center gap-4">
					<Link to="/tools" className="hover:text-foreground transition-colors">
						Tools
					</Link>
					<a
						href={siteConfig.repo}
						target="_blank"
						rel="noreferrer noopener"
						className="hover:text-foreground transition-colors"
					>
						Source
					</a>
					<span>Runs entirely in your browser.</span>
				</div>
			</div>
		</footer>
	);
}
