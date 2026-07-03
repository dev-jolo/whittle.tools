import { Split } from "lucide-react";

import type { ToolMeta } from "../types";

export const splitterMeta: ToolMeta = {
	slug: "splitter",
	name: "Splitter",
	aliases: ["array text", "arraytext", "list to array", "text to array"],
	tagline: "Turn a list of text into a formatted array.",
	description:
		"Paste a list — one item per line or separated by commas — and Splitter converts it into a clean array or delimited string. Trim, de-duplicate, sort, quote, and wrap the result, all locally in your browser.",
	keywords: [
		"array text",
		"text to array",
		"list to array",
		"convert list to array",
		"comma separated",
		"json array generator",
		"split text",
	],
	category: "text",
	icon: Split,
	status: "stable",
};
