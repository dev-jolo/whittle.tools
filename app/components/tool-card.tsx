import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CATEGORY_LABELS, type ToolMeta } from "@/tools/types";

/**
 * A tool tile that links to the tool page. Hovering (or focusing) reveals a
 * hover card with the full description — a quick preview without navigating.
 */
export function ToolCard({ tool }: { tool: ToolMeta }) {
	const { icon: Icon } = tool;

	return (
		<HoverCard openDelay={150} closeDelay={80}>
			<HoverCardTrigger asChild>
				<Link
					to={`/tools/${tool.slug}`}
					className="group bg-card hover:border-foreground/20 focus-visible:ring-ring relative flex flex-col rounded-xl border p-5 transition-colors outline-none focus-visible:ring-2"
				>
					<div className="flex items-center justify-between">
						<div className="bg-muted text-foreground flex size-10 items-center justify-center rounded-lg">
							<Icon className="size-5" />
						</div>
						<Badge variant="secondary">{CATEGORY_LABELS[tool.category]}</Badge>
					</div>
					<h3 className="mt-4 flex items-center gap-1 font-semibold tracking-tight">
						{tool.name}
						{tool.status === "beta" ? (
							<Badge variant="outline" className="ml-1 text-[10px]">
								Beta
							</Badge>
						) : null}
					</h3>
					<p className="text-muted-foreground mt-1 text-sm">{tool.tagline}</p>
					<span className="text-muted-foreground group-hover:text-foreground mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors">
						Open tool
						<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
					</span>
				</Link>
			</HoverCardTrigger>
			<HoverCardContent className="w-80">
				<div className="flex items-start gap-3">
					<div className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
						<Icon className="size-4" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-semibold">{tool.name}</p>
						<p className="text-muted-foreground text-sm">{tool.description}</p>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}
