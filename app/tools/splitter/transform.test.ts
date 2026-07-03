import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, splitText, type SplitterOptions } from "./transform";

function options(overrides: Partial<SplitterOptions> = {}): SplitterOptions {
	return { ...DEFAULT_OPTIONS, ...overrides };
}

describe("splitText", () => {
	it("splits newline-separated input into a quoted array by default", () => {
		const result = splitText("apple\nbanana\ncherry", DEFAULT_OPTIONS);
		expect(result.count).toBe(3);
		expect(result.output).toBe('["apple", "banana", "cherry"]');
	});

	it("trims and removes empty items", () => {
		const result = splitText("  apple  \n\n  banana  \n", DEFAULT_OPTIONS);
		expect(result.items).toEqual(["apple", "banana"]);
	});

	it("keeps empty items when removeEmpty is off", () => {
		const result = splitText(
			"a\n\nb",
			options({ removeEmpty: false, quote: "none", prefix: "", suffix: "" }),
		);
		expect(result.items).toEqual(["a", "", "b"]);
	});

	it("de-duplicates while preserving first-seen order", () => {
		const result = splitText(
			"a\nb\na\nc\nb",
			options({ dedupe: true, quote: "none", prefix: "", suffix: "" }),
		);
		expect(result.items).toEqual(["a", "b", "c"]);
	});

	it("sorts naturally, ascending and descending", () => {
		const asc = splitText(
			"item10\nitem2\nitem1",
			options({ sort: "asc", quote: "none", prefix: "", suffix: "" }),
		);
		expect(asc.items).toEqual(["item1", "item2", "item10"]);

		const desc = splitText(
			"item10\nitem2\nitem1",
			options({ sort: "desc", quote: "none", prefix: "", suffix: "" }),
		);
		expect(desc.items).toEqual(["item10", "item2", "item1"]);
	});

	it("splits on commas and applies single quotes", () => {
		const result = splitText(
			"a, b ,c",
			options({ splitBy: "comma", quote: "single" }),
		);
		expect(result.output).toBe("['a', 'b', 'c']");
	});

	it("escapes existing quote characters", () => {
		const result = splitText(
			'say "hi"',
			options({ quote: "double", prefix: "", suffix: "" }),
		);
		expect(result.output).toBe('"say \\"hi\\""');
	});

	it("supports a custom delimiter", () => {
		const result = splitText(
			"a|b|c",
			options({
				splitBy: "custom",
				customDelimiter: "|",
				quote: "none",
				prefix: "",
				suffix: "",
				separator: "-",
			}),
		);
		expect(result.output).toBe("a-b-c");
	});

	it("normalizes CRLF when splitting on new lines", () => {
		const result = splitText("a\r\nb", DEFAULT_OPTIONS);
		expect(result.items).toEqual(["a", "b"]);
	});

	it("formats one item per line", () => {
		const result = splitText(
			"a\nb",
			options({ itemsPerLine: true, quote: "none" }),
		);
		expect(result.output).toBe("[\n  a,\n  b\n]");
	});
});
