import type { Route } from "./+types/tools";
import { ToolCard } from "@/components/tool-card";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { tools } from "@/tools/registry";

export function meta(_: Route.MetaArgs) {
	const title = `Tools — ${siteConfig.name}`;
	const description = `Browse every ${siteConfig.name} utility. ${siteConfig.tagline}`;
	const url = absoluteUrl("/tools");
	return [
		{ title },
		{ name: "description", content: description },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },
		{ tagName: "link", rel: "canonical", href: url },
	];
}

export default function ToolsIndex() {
	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-10">
			<header className="max-w-2xl">
				<h1 className="text-3xl font-bold tracking-tight">Tools</h1>
				<p className="text-muted-foreground mt-2">
					A growing set of focused utilities. Everything runs locally in your
					browser — your data never leaves your device.
				</p>
			</header>

			<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{tools.map((tool) => (
					<ToolCard key={tool.slug} tool={tool} />
				))}
			</div>
		</div>
	);
}
