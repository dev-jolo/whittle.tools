import type { FormatOptionsWithLanguage } from "sql-formatter";

export type SqlDialect = FormatOptionsWithLanguage["language"] & string;
export type KeywordCase = "preserve" | "upper" | "lower";
export type SqlIndent = "2" | "4" | "tab";

export interface SqlFormatOptions {
	dialect: SqlDialect;
	keywordCase: KeywordCase;
	indent: SqlIndent;
}

export const DEFAULT_OPTIONS: SqlFormatOptions = {
	dialect: "sql",
	keywordCase: "upper",
	indent: "2",
};

/** Curated dialects, in display order. Values are sql-formatter language ids. */
export const DIALECTS: { value: SqlDialect; label: string }[] = [
	{ value: "sql", label: "Standard SQL" },
	{ value: "postgresql", label: "PostgreSQL" },
	{ value: "mysql", label: "MySQL" },
	{ value: "mariadb", label: "MariaDB" },
	{ value: "sqlite", label: "SQLite" },
	{ value: "bigquery", label: "BigQuery" },
	{ value: "snowflake", label: "Snowflake" },
	{ value: "redshift", label: "Redshift" },
	{ value: "spark", label: "Spark SQL" },
	{ value: "transactsql", label: "SQL Server (T-SQL)" },
	{ value: "plsql", label: "Oracle (PL/SQL)" },
	{ value: "db2", label: "Db2" },
	{ value: "trino", label: "Trino" },
];

export interface SqlFormatSuccess {
	ok: true;
	output: string;
}

export interface SqlFormatError {
	ok: false;
	error: string;
}

export type SqlFormatResult = SqlFormatSuccess | SqlFormatError;

/** The subset of sql-formatter's `format` signature we depend on. */
export type SqlFormatFn = (
	query: string,
	options: FormatOptionsWithLanguage,
) => string;

/**
 * Map our options onto sql-formatter's config and format the query. The
 * `format` function is injected so this module stays testable and free of a
 * direct import — the component supplies the lazily-loaded implementation.
 */
export function formatSql(
	input: string,
	options: SqlFormatOptions,
	format: SqlFormatFn,
): SqlFormatResult {
	if (input.trim() === "") return { ok: true, output: "" };

	try {
		const output = format(input, {
			language: options.dialect,
			keywordCase: options.keywordCase,
			useTabs: options.indent === "tab",
			tabWidth: options.indent === "4" ? 4 : 2,
		});
		return { ok: true, output };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		// sql-formatter's parse errors are already reasonably human-friendly.
		return { ok: false, error: message.trim() || "Could not parse SQL" };
	}
}
