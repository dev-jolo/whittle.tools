import { ArrowRightIcon, LockIcon, WifiOffIcon, ZapIcon } from "lucide-react";
import { Link } from "react-router";

import type { Route } from "./+types/home";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { tools } from "@/tools/registry";

export function meta(_: Route.MetaArgs) {
	return [
		...pageMeta({
			title: `${siteConfig.name} — ${siteConfig.tagline}`,
			description: siteConfig.description,
			path: "/",
		}),
		{
			"script:ld+json": {
				"@context": "https://schema.org",
				"@type": "WebSite",
				name: siteConfig.name,
				url: siteConfig.url,
				description: siteConfig.description,
			},
		},
	];
}

const HIGHLIGHTS = [
	{
		icon: LockIcon,
		title: "Private by default",
		body: "Everything runs in your browser. Your input is never uploaded.",
	},
	{
		icon: ZapIcon,
		title: "Fast and focused",
		body: "No sign-ups, no clutter — just the tool you came for.",
	},
	{
		icon: WifiOffIcon,
		title: "Works offline",
		body: "Installable as an app and usable without a connection.",
	},
];

export default function Home() {
	return (
		<div className="mx-auto w-full max-w-5xl px-4">
			<section className="flex flex-col items-center py-16 text-center sm:py-24">
				<span className="border-border bg-muted/40 text-muted-foreground mb-5 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
					{siteConfig.tagline}
				</span>
				<h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
					One stop shop for small, sharp developer tools
				</h1>
				<p className="text-muted-foreground mt-4 max-w-xl text-lg text-pretty">
					{siteConfig.description}
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button asChild size="lg">
						<Link to="/tools">
							Browse tools
							<ArrowRightIcon className="size-4" />
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link to={`/tools/${tools[0].slug}`}>Try {tools[0].name}</Link>
					</Button>
				</div>
			</section>

			<section aria-labelledby="tools-heading" className="pb-8">
				<div className="flex items-end justify-between">
					<h2 id="tools-heading" className="text-xl font-semibold tracking-tight">
						Tools
					</h2>
					<Link
						to="/tools"
						className="text-muted-foreground hover:text-foreground text-sm transition-colors"
					>
						View all
					</Link>
				</div>
				<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{tools.map((tool) => (
						<ToolCard key={tool.slug} tool={tool} />
					))}
				</div>
			</section>

			<section className="grid gap-4 py-12 sm:grid-cols-3">
				{HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
					<div key={title} className="rounded-xl border p-5">
						<Icon className="text-foreground size-5" />
						<h3 className="mt-3 font-medium">{title}</h3>
						<p className="text-muted-foreground mt-1 text-sm">{body}</p>
					</div>
				))}
			</section>
		</div>
	);
}
