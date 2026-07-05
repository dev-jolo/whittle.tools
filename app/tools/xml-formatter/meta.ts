import { CodeXml } from "lucide-react";

import type { ToolMeta } from "../types";

export const xmlFormatterMeta: ToolMeta = {
	slug: "xml-formatter",
	name: "XML Formatter",
	aliases: [
		"xml beautifier",
		"xml pretty print",
		"xml minifier",
		"format xml",
		"xml validator",
	],
	tagline: "Pretty-print or minify XML, with nesting validation.",
	description:
		"Paste XML and reformat it with clean indentation, or minify it down to a single line. Mismatched or unclosed tags are caught and reported. Comments, CDATA, and declarations are preserved. Everything runs in your browser — your data never leaves the page.",
	keywords: [
		"xml formatter",
		"xml beautifier",
		"xml pretty print",
		"xml minifier",
		"format xml online",
		"xml validator",
	],
	category: "data",
	icon: CodeXml,
	status: "stable",
};
