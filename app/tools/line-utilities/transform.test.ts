import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, type LineOptions, processLines } from "./transform";

function run(input: string, overrides: Partial<LineOptions> = {}): string[] {
	return processLines(input, { ...DEFAULT_OPTIONS, ...overrides }).lines;
}

describe("processLines", () => {
	it("passes lines through untouched by default", () => {
		expect(run("b\na\n\nb")).toEqual(["b", "a", "", "b"]);
	});

	it("trims and removes empty lines", () => {
		expect(run("  a  \n\n b ", { trim: true, removeEmpty: true })).toEqual([
			"a",
			"b",
		]);
	});

	it("dedupes keeping first occurrence", () => {
		expect(run("a\nb\na\nc\nb", { dedupe: true })).toEqual(["a", "b", "c"]);
	});

	it("dedupes case-insensitively when ignoreCase is set", () => {
		expect(run("Apple\napple\nBANANA", { dedupe: true, ignoreCase: true })).toEqual([
			"Apple",
			"BANANA",
		]);
	});

	it("sorts ascending and descending naturally", () => {
		expect(run("item10\nitem2\nitem1", { sort: "asc" })).toEqual([
			"item1",
			"item2",
			"item10",
		]);
		expect(run("a\nc\nb", { sort: "desc" })).toEqual(["c", "b", "a"]);
	});

	it("sorts by length", () => {
		expect(run("ccc\na\nbb", { sort: "length" })).toEqual(["a", "bb", "ccc"]);
	});

	it("reverses order", () => {
		expect(run("a\nb\nc", { reverse: true })).toEqual(["c", "b", "a"]);
	});

	it("shuffles deterministically for a given seed", () => {
		const input = "a\nb\nc\nd\ne\nf\ng\nh";
		const first = run(input, { shuffle: true, shuffleSeed: 42 });
		const same = run(input, { shuffle: true, shuffleSeed: 42 });
		const different = run(input, { shuffle: true, shuffleSeed: 7 });
		expect(first).toEqual(same);
		expect(first.sort()).toEqual(input.split("\n").sort());
		expect(first).not.toEqual(different);
	});

	it("reports the resulting line count", () => {
		const result = processLines("a\nb\na", { ...DEFAULT_OPTIONS, dedupe: true });
		expect(result.count).toBe(2);
		expect(result.output).toBe("a\nb");
	});
});
