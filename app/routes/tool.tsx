import { data, Link } from "react-router";

import type { Route } from "./+types/tool";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { CATEGORY_LABELS } from "@/tools/types";
import { getTool } from "@/tools/registry";

export function loader({ params }: Route.LoaderArgs) {
	const tool = getTool(params.slug);
	if (!tool) {
		throw data(
			{ message: `We don't have a tool called "${params.slug}" (yet).` },
			{ status: 404 },
		);
	}
	return {
		slug: tool.slug,
		name: tool.name,
		tagline: tool.tagline,
		description: tool.description,
		keywords: tool.keywords,
		category: tool.category,
		status: tool.status,
	};
}

export function meta({ data: tool }: Route.MetaArgs) {
	if (!tool) return [{ title: `Tool not found — ${siteConfig.name}` }];
	const title = `${tool.name} — ${siteConfig.name}`;
	const url = absoluteUrl(`/tools/${tool.slug}`);
	return [
		{ title },
		{ name: "description", content: tool.description },
		{ name: "keywords", content: tool.keywords.join(", ") },
		{ property: "og:title", content: title },
		{ property: "og:description", content: tool.description },
		{ property: "og:url", content: url },
		{ tagName: "link", rel: "canonical", href: url },
	];
}

export default function ToolPage({ loaderData }: Route.ComponentProps) {
	const tool = getTool(loaderData.slug);
	if (!tool) return null;

	const { Component, icon: Icon } = tool;

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-8">
			<nav className="text-muted-foreground mb-6 flex items-center gap-1.5 text-sm">
				<Link to="/tools" className="hover:text-foreground transition-colors">
					Tools
				</Link>
				<span aria-hidden>/</span>
				<span className="text-foreground">{tool.name}</span>
			</nav>

			<header className="flex items-start gap-4">
				<div className="bg-muted text-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
					<Icon className="size-5" />
				</div>
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
						{tool.status === "beta" ? (
							<Badge variant="outline">Beta</Badge>
						) : null}
						<Badge variant="secondary">{CATEGORY_LABELS[tool.category]}</Badge>
					</div>
					<p className="text-muted-foreground max-w-2xl text-sm">
						{tool.description}
					</p>
				</div>
			</header>

			<div className="mt-8">
				<Component />
			</div>
		</div>
	);
}
