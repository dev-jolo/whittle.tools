import { base64Tool } from "./base64";
import { caseConverter } from "./case-converter";
import { colorConverter } from "./color-converter";
import { dataConverter } from "./data-converter";
import { diffChecker } from "./diff-checker";
import { hash } from "./hash";
import { htmlEntities } from "./html-entities";
import { jsonFormatter } from "./json-formatter";
import { jwtDecoder } from "./jwt-decoder";
import { loremIpsum } from "./lorem-ipsum";
import { numberBase } from "./number-base";
import { password } from "./password";
import { qrCode } from "./qr-code";
import { splitter } from "./splitter";
import { timestamp } from "./timestamp";
import type { Tool, ToolMeta } from "./types";
import { urlEncoder } from "./url-encoder";
import { uuid } from "./uuid";

/**
 * The tool catalog. Register a tool here and it automatically appears in the
 * directory, gets a /tools/:slug page, and is listed in the sitemap.
 */
export const tools: Tool[] = [
	splitter,
	jsonFormatter,
	diffChecker,
	dataConverter,
	timestamp,
	numberBase,
	colorConverter,
	caseConverter,
	uuid,
	hash,
	password,
	loremIpsum,
	qrCode,
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
