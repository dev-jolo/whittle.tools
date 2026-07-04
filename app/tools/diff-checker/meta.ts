import { GitCompareArrows } from "lucide-react";

import type { ToolMeta } from "../types";

export const diffCheckerMeta: ToolMeta = {
	slug: "diff-checker",
	name: "Diff Checker",
	aliases: [
		"text compare",
		"compare text",
		"text diff",
		"diff tool",
		"file compare",
		"compare code",
	],
	tagline: "Compare two texts and see exactly what changed.",
	description:
		"Paste two versions and the differences appear instantly — with the exact words that changed highlighted, not just whole lines. Switch between side-by-side and inline views, and ignore case or whitespace when you only care about real changes. Nothing is uploaded; every comparison runs in your browser.",
	keywords: [
		"diff checker",
		"compare text",
		"text compare",
		"text diff",
		"code diff",
		"compare two files",
		"find difference online",
		"diff tool",
	],
	category: "text",
	icon: GitCompareArrows,
	status: "stable",
};
