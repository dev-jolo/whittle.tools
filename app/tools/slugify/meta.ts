import { Link2 } from "lucide-react";

import type { ToolMeta } from "../types";

export const slugifyMeta: ToolMeta = {
	slug: "slugify",
	name: "Slugify",
	aliases: [
		"slug generator",
		"url slug",
		"permalink",
		"text to slug",
		"kebab url",
	],
	tagline: "Turn any text into a clean, URL-safe slug.",
	description:
		"Convert titles and phrases into tidy URL slugs. Accents are stripped, punctuation is removed, and words are joined with a hyphen (or a separator of your choice). Pick your separator, casing, and strictness, then copy the result. Runs entirely in your browser.",
	keywords: [
		"slugify",
		"slug generator",
		"url slug",
		"permalink generator",
		"text to slug",
		"seo slug",
	],
	category: "text",
	icon: Link2,
	status: "stable",
};
