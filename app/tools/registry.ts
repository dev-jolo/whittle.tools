import { splitter } from "./splitter";
import type { Tool, ToolMeta } from "./types";

/**
 * The tool catalog. Register a tool here and it automatically appears in the
 * directory, gets a /tools/:slug page, and is listed in the sitemap.
 */
export const tools: Tool[] = [splitter];

/** Component-free metadata — safe for listings, sitemap, and structured data. */
export const toolMetas: ToolMeta[] = tools.map(
	({ Component: _Component, ...meta }) => meta,
);

const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): Tool | undefined {
	return toolsBySlug.get(slug);
}
