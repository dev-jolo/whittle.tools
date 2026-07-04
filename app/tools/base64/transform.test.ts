import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, base64 } from "./transform";

describe("base64", () => {
	it("encodes ASCII text", () => {
		expect(base64("Hello, World!", "encode", DEFAULT_OPTIONS).output).toBe(
			"SGVsbG8sIFdvcmxkIQ==",
		);
	});

	it("decodes back to the original", () => {
		expect(base64("SGVsbG8sIFdvcmxkIQ==", "decode", DEFAULT_OPTIONS).output).toBe(
			"Hello, World!",
		);
	});

	it("round-trips multi-byte UTF-8", () => {
		const text = "café — 日本語 😀";
		const encoded = base64(text, "encode", DEFAULT_OPTIONS);
		expect(base64(encoded.output, "decode", DEFAULT_OPTIONS).output).toBe(text);
	});

	it("produces URL-safe output without padding", () => {
		const result = base64("<<???>>", "encode", { urlSafe: true });
		expect(result.output).not.toMatch(/[+/=]/);
	});

	it("decodes URL-safe input regardless of the option", () => {
		const encoded = base64("subjects?_d=1", "encode", { urlSafe: true });
		expect(base64(encoded.output, "decode", DEFAULT_OPTIONS).output).toBe(
			"subjects?_d=1",
		);
	});

	it("returns an error for invalid Base64", () => {
		const result = base64("not valid *** base64", "decode", DEFAULT_OPTIONS);
		expect(result.ok).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it("treats empty input as empty output", () => {
		expect(base64("", "encode", DEFAULT_OPTIONS)).toEqual({
			ok: true,
			output: "",
		});
	});
});
