import { describe, expect, it } from "vitest";

import { convertCase, toWords } from "./transform";

function variant(input: string, key: string): string {
	return convertCase(input).find((v) => v.key === key)?.value ?? "";
}

describe("toWords", () => {
	it("splits separators and camel/Pascal boundaries", () => {
		expect(toWords("helloWorld")).toEqual(["hello", "World"]);
		expect(toWords("hello_world-foo bar")).toEqual([
			"hello",
			"world",
			"foo",
			"bar",
		]);
		expect(toWords("XMLHttpRequest")).toEqual(["XML", "Http", "Request"]);
	});
});

describe("convertCase", () => {
	const input = "hello world example";

	it("produces the common programmer cases", () => {
		expect(variant(input, "camel")).toBe("helloWorldExample");
		expect(variant(input, "pascal")).toBe("HelloWorldExample");
		expect(variant(input, "snake")).toBe("hello_world_example");
		expect(variant(input, "kebab")).toBe("hello-world-example");
		expect(variant(input, "constant")).toBe("HELLO_WORLD_EXAMPLE");
	});

	it("produces the prose cases", () => {
		expect(variant(input, "title")).toBe("Hello World Example");
		expect(variant(input, "sentence")).toBe("Hello world example");
		expect(variant(input, "lower")).toBe("hello world example");
		expect(variant(input, "upper")).toBe("HELLO WORLD EXAMPLE");
	});

	it("normalizes mixed input regardless of original casing", () => {
		expect(variant("XMLHttpRequest", "snake")).toBe("xml_http_request");
		expect(variant("  spaced__out--words ", "kebab")).toBe("spaced-out-words");
	});

	it("returns empty strings for empty input", () => {
		expect(convertCase("").every((v) => v.value === "")).toBe(true);
	});
});
