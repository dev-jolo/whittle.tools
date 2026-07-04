import type { Route } from "./+types/tools";
import { ToolDirectory } from "@/components/tool-directory";
import { pageMeta } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { toolMetas } from "@/tools/registry";

export function meta(_: Route.MetaArgs) {
	return pageMeta({
		title: `Tools — ${siteConfig.name}`,
		description: `Browse every ${siteConfig.name} utility. ${siteConfig.tagline}`,
		path: "/tools",
	});
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

			<div className="mt-8">
				<ToolDirectory tools={toolMetas} />
			</div>
		</div>
	);
}
