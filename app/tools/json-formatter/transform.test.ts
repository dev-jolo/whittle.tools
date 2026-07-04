import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, formatJson } from "./transform";

describe("formatJson", () => {
	it("pretty-prints with 2-space indentation by default", () => {
		const result = formatJson('{"a":1,"b":[2,3]}', DEFAULT_OPTIONS);
		expect(result).toEqual({
			ok: true,
			output: '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}',
		});
	});

	it("indents with 4 spaces", () => {
		const result = formatJson('{"a":1}', { indent: "4", sortKeys: false });
		expect(result.ok && result.output).toBe('{\n    "a": 1\n}');
	});

	it("indents with tabs", () => {
		const result = formatJson('{"a":1}', { indent: "tab", sortKeys: false });
		expect(result.ok && result.output).toBe('{\n\t"a": 1\n}');
	});

	it("minifies by stripping whitespace", () => {
		const result = formatJson('{\n  "a": 1,\n  "b": 2\n}', {
			indent: "minify",
			sortKeys: false,
		});
		expect(result.ok && result.output).toBe('{"a":1,"b":2}');
	});

	it("sorts object keys recursively when asked", () => {
		const result = formatJson('{"b":1,"a":{"z":2,"m":3}}', {
			indent: "minify",
			sortKeys: true,
		});
		expect(result.ok && result.output).toBe('{"a":{"m":3,"z":2},"b":1}');
	});

	it("preserves array order when sorting keys", () => {
		const result = formatJson('[3,1,2]', { indent: "minify", sortKeys: true });
		expect(result.ok && result.output).toBe("[3,1,2]");
	});

	it("treats empty input as an empty, error-free result", () => {
		expect(formatJson("   \n  ", DEFAULT_OPTIONS)).toEqual({
			ok: true,
			output: "",
		});
	});

	it("reports invalid JSON with a line and column", () => {
		const result = formatJson('{\n  "a": 1\n  "b": 2\n}', DEFAULT_OPTIONS);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.line).toBe(3);
			expect(result.column).toBeGreaterThan(0);
			expect(result.error).toMatch(/line 3, column/);
		}
	});

	it("handles unterminated input without a position gracefully", () => {
		const result = formatJson('{"a":', DEFAULT_OPTIONS);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
	});

	it("round-trips primitives and strings", () => {
		expect(formatJson('"hi"', DEFAULT_OPTIONS)).toEqual({
			ok: true,
			output: '"hi"',
		});
		expect(formatJson("42", DEFAULT_OPTIONS)).toEqual({
			ok: true,
			output: "42",
		});
	});
});
