import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, type XmlFormatOptions, formatXml } from "./transform";

function format(input: string, overrides: Partial<XmlFormatOptions> = {}) {
	return formatXml(input, { ...DEFAULT_OPTIONS, ...overrides });
}

function output(input: string, overrides: Partial<XmlFormatOptions> = {}): string {
	const result = format(input, overrides);
	if (!result.ok) throw new Error(`expected ok, got: ${result.error}`);
	return result.output;
}

describe("formatXml — beautify", () => {
	it("returns empty output for empty input", () => {
		expect(format("")).toEqual({ ok: true, output: "" });
	});

	it("indents nested elements", () => {
		expect(output("<root><a>1</a><b>2</b></root>")).toBe(
			["<root>", "  <a>1</a>", "  <b>2</b>", "</root>"].join("\n"),
		);
	});

	it("keeps a single text child inline", () => {
		expect(output("<a>\n   hello   \n</a>")).toBe("<a>hello</a>");
	});

	it("honors the indent option", () => {
		expect(output("<a><b>x</b></a>", { indent: "tab" })).toBe(
			["<a>", "\t<b>x</b>", "</a>"].join("\n"),
		);
		expect(output("<a><b>x</b></a>", { indent: "4" })).toBe(
			["<a>", "    <b>x</b>", "</a>"].join("\n"),
		);
	});

	it("handles self-closing tags, comments, and declarations", () => {
		const input = '<?xml version="1.0"?><root><!-- note --><br/></root>';
		expect(output(input)).toBe(
			[
				'<?xml version="1.0"?>',
				"<root>",
				"  <!-- note -->",
				"  <br/>",
				"</root>",
			].join("\n"),
		);
	});

	it("preserves CDATA verbatim", () => {
		expect(output("<a><![CDATA[ x < y ]]></a>")).toBe(
			"<a><![CDATA[ x < y ]]></a>",
		);
	});
});

describe("formatXml — minify", () => {
	it("strips insignificant whitespace between tags", () => {
		const pretty = ["<root>", "  <a>1</a>", "  <b>2</b>", "</root>"].join("\n");
		expect(output(pretty, { mode: "minify" })).toBe(
			"<root><a>1</a><b>2</b></root>",
		);
	});

	it("preserves meaningful text content", () => {
		expect(output("<a>keep   this</a>", { mode: "minify" })).toBe(
			"<a>keep   this</a>",
		);
	});
});

describe("formatXml — errors", () => {
	it("reports mismatched tags", () => {
		const result = format("<a></b>");
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/mismatched/i);
	});

	it("reports unclosed tags", () => {
		const result = format("<a><b></a>");
		expect(result.ok).toBe(false);
	});

	it("reports unterminated comments", () => {
		const result = format("<a><!-- oops</a>");
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/comment/i);
	});
});
