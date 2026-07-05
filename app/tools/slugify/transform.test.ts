import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, type SlugifyOptions, slugify } from "./transform";

function run(input: string, overrides: Partial<SlugifyOptions> = {}): string {
	return slugify(input, { ...DEFAULT_OPTIONS, ...overrides });
}

describe("slugify", () => {
	it("lowercases and hyphenates words by default", () => {
		expect(run("Hello World")).toBe("hello-world");
	});

	it("strips accents and diacritics", () => {
		expect(run("Crème Brûlée")).toBe("creme-brulee");
	});

	it("expands ampersands to 'and'", () => {
		expect(run("Rock & Roll")).toBe("rock-and-roll");
	});

	it("collapses separators and trims them from the ends", () => {
		expect(run("  --Hello---World--  ")).toBe("hello-world");
	});

	it("drops punctuation in strict mode", () => {
		expect(run("Node.js: the good parts!")).toBe("node-js-the-good-parts");
	});

	it("honors a custom separator", () => {
		expect(run("Hello World", { separator: "_" })).toBe("hello_world");
	});

	it("preserves case when lowercase is off", () => {
		expect(run("Hello World", { lowercase: false })).toBe("Hello-World");
	});

	it("keeps punctuation in non-strict mode but still strips accents", () => {
		// Accents are always removed for URL-safety; non-strict only spares
		// non-whitespace punctuation instead of dropping it.
		expect(run("C++ & Café", { strict: false })).toBe("c++-and-cafe");
	});

	it("returns an empty string for empty input", () => {
		expect(run("")).toBe("");
		expect(run("   ")).toBe("");
	});
});
