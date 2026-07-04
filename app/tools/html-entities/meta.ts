import { CodeXml } from "lucide-react";

import type { ToolMeta } from "../types";

export const htmlEntitiesMeta: ToolMeta = {
	slug: "html-entities",
	name: "HTML Entity Encode / Decode",
	aliases: [
		"html encode",
		"html decode",
		"html entities",
		"escape html",
		"unescape html",
	],
	tagline: "Escape HTML characters to entities, or decode them back.",
	description:
		"Turn <, >, &, and quotes into safe HTML entities so text renders literally instead of as markup — or decode named and numeric entities back to plain text. Optionally escape all non-ASCII characters too. Decoding handles &amp;, &#233;, and &#x1F600; alike. Runs entirely in your browser.",
	keywords: [
		"html encode",
		"html decode",
		"html entities",
		"escape html",
		"unescape html",
		"html entity converter",
		"decode html entities",
	],
	category: "encoding",
	icon: CodeXml,
	status: "stable",
};
