import { FileCode2 } from "lucide-react";

import type { ToolMeta } from "../types";

export const codeFormatterMeta: ToolMeta = {
	slug: "code-formatter",
	name: "HTML / CSS / JS Formatter",
	aliases: [
		"code beautifier",
		"js beautifier",
		"css beautifier",
		"html beautifier",
		"javascript minifier",
		"css minifier",
		"html minifier",
	],
	tagline: "Beautify or minify HTML, CSS, and JavaScript.",
	description:
		"Clean up or compress front-end code. Beautify HTML, CSS, and JavaScript with consistent indentation, or minify it to ship less. JavaScript is minified with Terser (real AST compression); CSS and HTML are safely compacted. Everything runs in your browser — your code never leaves the page.",
	keywords: [
		"code beautifier",
		"code minifier",
		"javascript beautifier",
		"js minifier",
		"css minifier",
		"html minifier",
		"format javascript",
	],
	category: "data",
	icon: FileCode2,
	status: "stable",
};
