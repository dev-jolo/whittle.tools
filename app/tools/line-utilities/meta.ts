import { ListOrdered } from "lucide-react";

import type { ToolMeta } from "../types";

export const lineUtilitiesMeta: ToolMeta = {
	slug: "line-utilities",
	name: "Line Utilities",
	aliases: [
		"sort lines",
		"dedupe lines",
		"remove duplicate lines",
		"reverse lines",
		"shuffle lines",
		"text lines",
	],
	tagline: "Sort, dedupe, trim, reverse, and shuffle lines of text.",
	description:
		"Clean up a list line by line: sort alphabetically or by length, remove duplicates and blank lines, trim whitespace, reverse the order, or shuffle it randomly. Combine operations and copy the result. Everything runs in your browser — nothing is uploaded.",
	keywords: [
		"sort lines",
		"remove duplicate lines",
		"dedupe text",
		"reverse lines",
		"shuffle lines",
		"trim whitespace",
		"line tools",
	],
	category: "text",
	icon: ListOrdered,
	status: "stable",
};
