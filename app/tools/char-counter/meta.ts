import { WholeWord } from "lucide-react";

import type { ToolMeta } from "../types";

export const charCounterMeta: ToolMeta = {
	slug: "char-counter",
	name: "Character & Word Counter",
	aliases: [
		"word count",
		"character count",
		"letter counter",
		"text counter",
		"reading time",
	],
	tagline: "Count characters, words, lines, and reading time live.",
	description:
		"Paste text and instantly see the character count (with and without spaces), word count, sentences, lines, paragraphs, and an estimated reading time. Emoji and combined characters count as one. Everything runs in your browser — your text never leaves the page.",
	keywords: [
		"character counter",
		"word counter",
		"word count",
		"letter count",
		"reading time estimator",
		"text statistics",
	],
	category: "text",
	icon: WholeWord,
	status: "stable",
};
