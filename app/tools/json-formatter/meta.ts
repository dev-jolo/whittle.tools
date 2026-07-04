import { Braces } from "lucide-react";

import type { ToolMeta } from "../types";

export const jsonFormatterMeta: ToolMeta = {
	slug: "json-formatter",
	name: "JSON Formatter",
	aliases: [
		"json beautifier",
		"json minifier",
		"json pretty print",
		"json validator",
		"format json",
		"prettify json",
	],
	tagline: "Format, prettify, or minify JSON — instantly.",
	description:
		"Paste JSON and it's cleanly formatted as you type — 2-space by default, with 4-space, tab, and minified options a click away. Sort keys for tidy diffs, and get a plain-English error with the exact line and column when something's off. Everything runs locally in your browser.",
	keywords: [
		"json formatter",
		"json beautifier",
		"json minifier",
		"prettify json",
		"format json online",
		"validate json",
		"json pretty print",
		"minify json",
	],
	category: "data",
	icon: Braces,
	status: "stable",
};
