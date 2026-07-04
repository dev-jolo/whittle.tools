import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS, htmlEntities } from "./transform";

describe("htmlEntities", () => {
	it("encodes the five HTML special characters", () => {
		expect(
			htmlEntities(`<a href="x" class='y'>Tom & Jerry</a>`, "encode", DEFAULT_OPTIONS)
				.output,
		).toBe(
			"&lt;a href=&quot;x&quot; class=&#39;y&#39;&gt;Tom &amp; Jerry&lt;/a&gt;",
		);
	});

	it("does not escape non-ASCII by default", () => {
		expect(htmlEntities("café ©", "encode", DEFAULT_OPTIONS).output).toBe(
			"café ©",
		);
	});

	it("escapes non-ASCII to numeric entities when enabled", () => {
		expect(
			htmlEntities("café", "encode", { encodeNonAscii: true }).output,
		).toBe("caf&#233;");
	});

	it("decodes named entities", () => {
		expect(
			htmlEntities("Tom &amp; Jerry &copy; &mdash; done", "decode", DEFAULT_OPTIONS)
				.output,
		).toBe("Tom & Jerry © — done");
	});

	it("decodes decimal and hex numeric entities", () => {
		expect(
			htmlEntities("&#233; &#x1F600;", "decode", DEFAULT_OPTIONS).output,
		).toBe("é 😀");
	});

	it("leaves unknown named entities untouched", () => {
		expect(
			htmlEntities("&notareal; &amp;", "decode", DEFAULT_OPTIONS).output,
		).toBe("&notareal; &");
	});

	it("round-trips the special characters", () => {
		const text = `if (a < b && c > d) return "x";`;
		const encoded = htmlEntities(text, "encode", DEFAULT_OPTIONS);
		expect(htmlEntities(encoded.output, "decode", DEFAULT_OPTIONS).output).toBe(
			text,
		);
	});
});
