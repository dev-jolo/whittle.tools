import { base64Tool } from "./base64";
import { diffChecker } from "./diff-checker";
import { htmlEntities } from "./html-entities";
import { jsonFormatter } from "./json-formatter";
import { jwtDecoder } from "./jwt-decoder";
import { splitter } from "./splitter";
import type { Tool, ToolMeta } from "./types";
import { urlEncoder } from "./url-encoder";

/**
 * The tool catalog. Register a tool here and it automatically appears in the
 * directory, gets a /tools/:slug page, and is listed in the sitemap.
 */
export const tools: Tool[] = [
	splitter,
	jsonFormatter,
	diffChecker,
	base64Tool,
	urlEncoder,
	htmlEntities,
	jwtDecoder,
];

/** Component-free metadata — safe for listings, sitemap, and structured data. */
export const toolMetas: ToolMeta[] = tools.map(
	({ Component: _Component, ...meta }) => meta,
);

const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export function getTool(slug: string): Tool | undefined {
	return toolsBySlug.get(slug);
}
