import beautify from "js-beautify";
import { minify_sync } from "terser";
import { describe, expect, it } from "vitest";

import {
	type CodeEngines,
	type CodeFormatOptions,
	DEFAULT_OPTIONS,
	formatCode,
	minifyCss,
	minifyHtml,
} from "./transform";

const engines: CodeEngines = {
	beautify: { js: beautify.js, css: beautify.css, html: beautify.html },
	minifyJs: minify_sync,
};

function run(input: string, overrides: Partial<CodeFormatOptions> = {}) {
	return formatCode(input, { ...DEFAULT_OPTIONS, ...overrides }, engines);
}

describe("minifyCss", () => {
	it("strips comments and structural whitespace", () => {
		expect(minifyCss("a {\n  color : red ;\n}\n/* note */")).toBe(
			"a{color:red}",
		);
	});

	it("preserves whitespace inside quoted strings", () => {
		expect(minifyCss('a { content : "x ; y" }')).toBe('a{content:"x ; y"}');
	});

	it("keeps a meaningful space between value tokens", () => {
		expect(minifyCss("a { margin : 1px  2px }")).toBe("a{margin:1px 2px}");
	});
});

describe("minifyHtml", () => {
	it("collapses whitespace and drops comments", () => {
		expect(minifyHtml("<ul>\n  <li>a</li>\n  <!-- x -->\n  <li>b</li>\n</ul>")).toBe(
			"<ul><li>a</li><li>b</li></ul>",
		);
	});

	it("preserves the contents of raw-text elements", () => {
		const input = "<pre>\n  keep\n    me\n</pre>";
		expect(minifyHtml(input)).toBe(input.trim());
	});
});

describe("formatCode", () => {
	it("returns empty output for empty input", () => {
		expect(run("")).toEqual({ ok: true, output: "" });
	});

	it("beautifies JavaScript", () => {
		const result = run("const a=1;function f(){return a}", { lang: "js" });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.output).toContain("function f() {");
			expect(result.output.split("\n").length).toBeGreaterThan(1);
		}
	});

	it("beautifies CSS with the chosen indent", () => {
		const result = run("a{color:red}", { lang: "css", indent: "4" });
		if (result.ok) expect(result.output).toBe("a {\n    color: red\n}");
	});

	it("minifies JavaScript via terser", () => {
		const result = run("const a = 1 + 2;\nconsole.log(a);", {
			lang: "js",
			mode: "minify",
		});
		if (result.ok) expect(result.output).toBe("const a=3;console.log(3);");
	});

	it("minifies CSS and HTML via the pure helpers", () => {
		expect(run("a { color : red }", { lang: "css", mode: "minify" })).toEqual({
			ok: true,
			output: "a{color:red}",
		});
		expect(
			run("<div>\n  <span>hi</span>\n</div>", { lang: "html", mode: "minify" }),
		).toEqual({ ok: true, output: "<div><span>hi</span></div>" });
	});

	it("reports a friendly error when minifying invalid JS", () => {
		const result = run("const = = =", { lang: "js", mode: "minify" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
	});
});
