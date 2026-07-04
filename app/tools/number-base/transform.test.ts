import { describe, expect, it } from "vitest";

import { formatInBase, parseInBase } from "./transform";

describe("parseInBase", () => {
	it("parses each base to the same value", () => {
		expect(parseInBase("255", 10).value).toBe(255n);
		expect(parseInBase("ff", 16).value).toBe(255n);
		expect(parseInBase("377", 8).value).toBe(255n);
		expect(parseInBase("11111111", 2).value).toBe(255n);
	});

	it("tolerates a matching prefix and is case-insensitive for hex", () => {
		expect(parseInBase("0xFF", 16).value).toBe(255n);
		expect(parseInBase("0b1010", 2).value).toBe(10n);
	});

	it("handles negative and very large values", () => {
		expect(parseInBase("-42", 10).value).toBe(-42n);
		expect(parseInBase("ffffffffffffffff", 16).value).toBe(
			18446744073709551615n,
		);
	});

	it("rejects digits outside the base", () => {
		expect(parseInBase("2", 2).ok).toBe(false);
		expect(parseInBase("8", 8).ok).toBe(false);
		expect(parseInBase("g", 16).ok).toBe(false);
	});

	it("treats blank input as a cleared, error-free value", () => {
		expect(parseInBase("  ", 16)).toEqual({ ok: true });
	});
});

describe("formatInBase", () => {
	it("formats a value into each base", () => {
		expect(formatInBase(255n, 16)).toBe("ff");
		expect(formatInBase(255n, 2)).toBe("11111111");
		expect(formatInBase(-42n, 10)).toBe("-42");
	});
});
