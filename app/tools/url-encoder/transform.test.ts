import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, urlCodec } from "./transform";

describe("urlCodec", () => {
	it("encodes a query value, escaping reserved characters", () => {
		expect(
			urlCodec("name=Ada & Co?", "encode", DEFAULT_OPTIONS).output,
		).toBe("name%3DAda%20%26%20Co%3F");
	});

	it("decodes a percent-encoded value", () => {
		expect(
			urlCodec("name%3DAda%20%26%20Co%3F", "decode", DEFAULT_OPTIONS).output,
		).toBe("name=Ada & Co?");
	});

	it("preserves URL structure in whole-URL mode", () => {
		expect(
			urlCodec("https://x.com/a b?q=1&r=2", "encode", { wholeUrl: true }).output,
		).toBe("https://x.com/a%20b?q=1&r=2");
	});

	it("round-trips multi-byte characters", () => {
		const text = "日本語 café";
		const encoded = urlCodec(text, "encode", DEFAULT_OPTIONS);
		expect(urlCodec(encoded.output, "decode", DEFAULT_OPTIONS).output).toBe(
			text,
		);
	});

	it("errors on malformed percent-encoding", () => {
		const result = urlCodec("100%", "decode", DEFAULT_OPTIONS);
		expect(result.ok).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it("treats empty input as empty output", () => {
		expect(urlCodec("", "encode", DEFAULT_OPTIONS)).toEqual({
			ok: true,
			output: "",
		});
	});
});
