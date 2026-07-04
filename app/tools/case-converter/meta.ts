import { CaseSensitive } from "lucide-react";

import type { ToolMeta } from "../types";

export const caseConverterMeta: ToolMeta = {
	slug: "case-converter",
	name: "Case Converter",
	aliases: [
		"camelcase",
		"snake case",
		"kebab case",
		"title case",
		"pascalcase",
		"change case",
	],
	tagline: "Convert text between camelCase, snake_case, and more.",
	description:
		"Paste text or an identifier and get it in every case at once — camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, and more. It reads mixed input intelligently, splitting on separators and camelCase boundaries. Copy the one you need. Runs entirely in your browser.",
	keywords: [
		"case converter",
		"camelcase converter",
		"snake case",
		"kebab case",
		"title case",
		"pascalcase",
		"convert text case",
	],
	category: "text",
	icon: CaseSensitive,
	status: "stable",
};
