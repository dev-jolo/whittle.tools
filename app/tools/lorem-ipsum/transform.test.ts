import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, type LoremOptions, generateLorem } from "./transform";

function options(overrides: Partial<LoremOptions> = {}): LoremOptions {
	return { ...DEFAULT_OPTIONS, ...overrides };
}

// Deterministic RNG so output is stable in tests.
const zero = () => 0;

describe("generateLorem", () => {
	it("starts with the classic opening when enabled", () => {
		const text = generateLorem(options({ unit: "sentences", count: 1 }), zero);
		expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
	});

	it("generates the requested number of paragraphs", () => {
		const text = generateLorem(options({ unit: "paragraphs", count: 4 }), zero);
		expect(text.split("\n\n")).toHaveLength(4);
	});

	it("generates an exact number of words", () => {
		const text = generateLorem(
			options({ unit: "words", count: 5, startWithLorem: false }),
			zero,
		);
		expect(text.split(" ")).toHaveLength(5);
	});

	it("ends sentences with a period", () => {
		const text = generateLorem(options({ unit: "sentences", count: 3 }), zero);
		expect(text.trim().endsWith(".")).toBe(true);
	});

	it("clamps the count into range", () => {
		expect(
			generateLorem(options({ unit: "paragraphs", count: 0 }), zero).split(
				"\n\n",
			),
		).toHaveLength(1);
	});

	it("omits the opening when disabled", () => {
		const text = generateLorem(
			options({ unit: "words", count: 3, startWithLorem: false }),
			() => 0.5,
		);
		expect(text.toLowerCase().startsWith("lorem ipsum")).toBe(false);
	});
});
