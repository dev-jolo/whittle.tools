import { NavLink, Link } from "react-router";

import { GitHubIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ to: "/tools", label: "Tools" }];

export function SiteHeader() {
	return (
		<header className="border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
			<div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4">
				<Link
					to="/"
					className="flex items-center gap-2 font-semibold tracking-tight"
				>
					<Logo className="text-primary" />
					<span>
						whittle<span className="text-muted-foreground">.tools</span>
					</span>
				</Link>

				<nav className="ml-2 flex items-center gap-1 text-sm">
					{NAV_LINKS.map(({ to, label }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) =>
								cn(
									"text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 transition-colors",
									isActive && "text-foreground",
								)
							}
						>
							{label}
						</NavLink>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-1">
					<Button asChild variant="ghost" size="icon" aria-label="GitHub repository">
						<a href={siteConfig.repo} target="_blank" rel="noreferrer noopener">
							<GitHubIcon className="size-5" />
						</a>
					</Button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
