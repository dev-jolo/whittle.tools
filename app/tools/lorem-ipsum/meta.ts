import { Pilcrow } from "lucide-react";

import type { ToolMeta } from "../types";

export const loremIpsumMeta: ToolMeta = {
	slug: "lorem-ipsum",
	name: "Lorem Ipsum Generator",
	aliases: [
		"lorem ipsum",
		"placeholder text",
		"dummy text",
		"filler text",
		"lipsum",
	],
	tagline: "Generate placeholder text for mockups.",
	description:
		"Generate Lorem ipsum placeholder text by paragraphs, sentences, or words — as much as you need for mockups and layouts. Start with the classic opening or go straight to random filler, then copy it out. Runs entirely in your browser.",
	keywords: [
		"lorem ipsum generator",
		"placeholder text",
		"dummy text generator",
		"filler text",
		"lipsum",
		"random text generator",
	],
	category: "generator",
	icon: Pilcrow,
	status: "stable",
};
