import { base64Tool } from "./base64";
import { caseConverter } from "./case-converter";
import { charCounter } from "./char-counter";
import { codeFormatter } from "./code-formatter";
import { colorConverter } from "./color-converter";
import { dataConverter } from "./data-converter";
import { diffChecker } from "./diff-checker";
import { hash } from "./hash";
import { htmlEntities } from "./html-entities";
import { jsonFormatter } from "./json-formatter";
import { jwtDecoder } from "./jwt-decoder";
import { lineUtilities } from "./line-utilities";
import { loremIpsum } from "./lorem-ipsum";
import { numberBase } from "./number-base";
import { password } from "./password";
import { qrCode } from "./qr-code";
import { regexTester } from "./regex-tester";
import { slugify } from "./slugify";
import { splitter } from "./splitter";
import { sqlFormatter } from "./sql-formatter";
import { timestamp } from "./timestamp";
import type { Tool, ToolMeta } from "./types";
import { urlEncoder } from "./url-encoder";
import { uuid } from "./uuid";
import { xmlFormatter } from "./xml-formatter";

/**
 * The tool catalog. Register a tool here and it automatically appears in the
 * directory, gets a /tools/:slug page, and is listed in the sitemap.
 */
export const tools: Tool[] = [
	regexTester,
	splitter,
	jsonFormatter,
	xmlFormatter,
	sqlFormatter,
	codeFormatter,
	diffChecker,
	dataConverter,
	timestamp,
	numberBase,
	colorConverter,
	caseConverter,
	lineUtilities,
	slugify,
	charCounter,
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
