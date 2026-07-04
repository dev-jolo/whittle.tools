import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";

import { ToolCard } from "@/components/tool-card";
import { Input } from "@/components/ui/input";
import {
	CATEGORY_DESCRIPTIONS,
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	type ToolMeta,
} from "@/tools/types";

function matchesQuery(tool: ToolMeta, query: string): boolean {
	const haystack = [
		tool.name,
		tool.tagline,
		...(tool.aliases ?? []),
		...tool.keywords,
	]
		.join(" ")
		.toLowerCase();
	return haystack.includes(query);
}

/**
 * Browsable, searchable tool directory: a filter box plus tools grouped under
 * category headings. Browsing (categories) and searching are both first-class,
 * per the hybrid navigation the research favors.
 */
export function ToolDirectory({ tools }: { tools: ToolMeta[] }) {
	const [query, setQuery] = useState("");
	const normalized = query.trim().toLowerCase();

	const groups = useMemo(() => {
		const filtered = normalized
			? tools.filter((tool) => matchesQuery(tool, normalized))
			: tools;
		return CATEGORY_ORDER.map((category) => ({
			category,
			items: filtered.filter((tool) => tool.category === category),
		})).filter((group) => group.items.length > 0);
	}, [tools, normalized]);

	return (
		<div>
			<div className="relative max-w-md">
				<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
				<Input
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search tools…"
					aria-label="Search tools"
					className="pl-9"
				/>
			</div>

			{groups.length === 0 ? (
				<p className="text-muted-foreground mt-10 text-sm">
					No tools match “{query}”.
				</p>
			) : (
				<div className="mt-10 space-y-12">
					{groups.map(({ category, items }) => (
						<section key={category} aria-labelledby={`cat-${category}`}>
							<h2
								id={`cat-${category}`}
								className="text-lg font-semibold tracking-tight"
							>
								{CATEGORY_LABELS[category]}
							</h2>
							<p className="text-muted-foreground mt-1 text-sm">
								{CATEGORY_DESCRIPTIONS[category]}
							</p>
							<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{items.map((tool) => (
									<ToolCard key={tool.slug} tool={tool} />
								))}
							</div>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
