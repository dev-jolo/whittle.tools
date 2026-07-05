import { Database } from "lucide-react";

import type { ToolMeta } from "../types";

export const sqlFormatterMeta: ToolMeta = {
	slug: "sql-formatter",
	name: "SQL Formatter",
	aliases: [
		"sql beautifier",
		"format sql",
		"sql pretty print",
		"query formatter",
		"prettify sql",
	],
	tagline: "Format and beautify SQL queries across many dialects.",
	description:
		"Paste a messy query and get clean, readable SQL with consistent indentation and keyword casing. Supports PostgreSQL, MySQL, SQLite, BigQuery, T-SQL, Oracle, and more. Everything runs in your browser — your queries never leave the page.",
	keywords: [
		"sql formatter",
		"sql beautifier",
		"format sql online",
		"prettify sql",
		"query formatter",
		"postgresql formatter",
		"mysql formatter",
	],
	category: "data",
	icon: Database,
	status: "stable",
};
