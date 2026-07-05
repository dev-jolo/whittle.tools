import { Regex } from "lucide-react";

import type { ToolMeta } from "../types";

export const regexTesterMeta: ToolMeta = {
	slug: "regex-tester",
	name: "Regex Tester",
	aliases: [
		"regular expression",
		"regexp",
		"regex match",
		"pattern tester",
		"regex highlighter",
	],
	tagline: "Test regular expressions with live match highlighting.",
	description:
		"Write a regular expression and see every match highlighted in your test text as you type. Toggle flags, inspect numbered and named capture groups, and catch syntax errors instantly. Everything runs in your browser — your patterns and data never leave the page.",
	keywords: [
		"regex tester",
		"regular expression tester",
		"regex match",
		"regexp",
		"regex highlighter",
		"test regex online",
		"capture groups",
	],
	category: "text",
	icon: Regex,
	status: "stable",
};
