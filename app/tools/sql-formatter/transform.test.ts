import { format } from "sql-formatter";
import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, type SqlFormatOptions, formatSql } from "./transform";

function run(input: string, overrides: Partial<SqlFormatOptions> = {}) {
	return formatSql(input, { ...DEFAULT_OPTIONS, ...overrides }, format);
}

describe("formatSql", () => {
	it("returns empty output for empty input", () => {
		expect(run("")).toEqual({ ok: true, output: "" });
	});

	it("formats a query with keywords uppercased", () => {
		const result = run("select id, name from users where id = 1");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toContain("SELECT");
			expect(result.output).toContain("FROM");
			expect(result.output).toContain("WHERE");
			expect(result.output.split("\n").length).toBeGreaterThan(1);
		}
	});

	it("lowercases keywords when requested", () => {
		const result = run("SELECT 1", { keywordCase: "lower" });
		if (result.ok) expect(result.output).toContain("select");
	});

	it("indents with tabs when requested", () => {
		const result = run("select a, b from t", { indent: "tab" });
		if (result.ok) expect(result.output).toContain("\t");
	});

	it("respects the chosen dialect", () => {
		// Backtick-quoted identifiers are valid in MySQL.
		const result = run("SELECT `col` FROM `tbl`", { dialect: "mysql" });
		expect(result.ok).toBe(true);
	});

	it("reports a friendly error for unparseable SQL", () => {
		const result = run("SELECT FROM WHERE ((");
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
	});
});
