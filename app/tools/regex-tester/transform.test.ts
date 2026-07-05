import { describe, expect, it } from "vitest";

import { buildSegments, runRegex } from "./transform";

describe("runRegex", () => {
	it("returns no matches and no error for an empty pattern", () => {
		expect(runRegex("", "", "anything")).toEqual({ matches: [], error: null });
	});

	it("reports invalid patterns without throwing", () => {
		const result = runRegex("(", "", "abc");
		expect(result.matches).toEqual([]);
		expect(result.error).toBeTruthy();
	});

	it("finds all matches with the global flag", () => {
		const result = runRegex("a", "g", "banana");
		expect(result.error).toBeNull();
		expect(result.matches.map((m) => m.index)).toEqual([1, 3, 5]);
	});

	it("returns only the first match without the global flag", () => {
		const result = runRegex("a", "", "banana");
		expect(result.matches).toHaveLength(1);
		expect(result.matches[0].index).toBe(1);
	});

	it("captures numbered and named groups", () => {
		const result = runRegex("(?<year>\\d{4})-(\\d{2})", "", "2026-07");
		expect(result.matches[0].value).toBe("2026-07");
		expect(result.matches[0].groups).toEqual(["2026", "07"]);
		expect(result.matches[0].namedGroups).toEqual({ year: "2026" });
	});

	it("does not loop forever on zero-length matches", () => {
		const result = runRegex("", "g", "ab");
		// Empty pattern short-circuits, but a matchable zero-width pattern shouldn't hang.
		const boundaries = runRegex("\\b", "g", "hi there");
		expect(result.matches).toEqual([]);
		expect(boundaries.matches.length).toBeGreaterThan(0);
	});
});

describe("buildSegments", () => {
	it("returns a single plain segment when there are no matches", () => {
		expect(buildSegments("hello", [])).toEqual([{ text: "hello", match: false }]);
	});

	it("splits text into alternating plain and matched segments", () => {
		const { matches } = runRegex("a", "g", "banana");
		const segments = buildSegments("banana", matches);
		expect(segments.map((s) => s.text).join("")).toBe("banana");
		expect(segments.filter((s) => s.match).map((s) => s.text)).toEqual([
			"a",
			"a",
			"a",
		]);
	});

	it("ignores empty matches so nothing renders blank", () => {
		const { matches } = runRegex("\\b", "g", "hi");
		const segments = buildSegments("hi", matches);
		expect(segments.every((s) => s.text.length > 0)).toBe(true);
		expect(segments.map((s) => s.text).join("")).toBe("hi");
	});
});
