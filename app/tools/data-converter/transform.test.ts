import { describe, expect, it } from "vitest";

import { convertData } from "./transform";

describe("convertData", () => {
	it("converts JSON array to CSV with a header row", () => {
		const json = '[{"name":"Ada","age":36},{"name":"Alan","age":41}]';
		expect(convertData(json, "json", "csv").output).toBe(
			"name,age\nAda,36\nAlan,41",
		);
	});

	it("converts CSV to JSON keyed by header", () => {
		const csv = "name,age\nAda,36\nAlan,41";
		const result = convertData(csv, "csv", "json");
		expect(JSON.parse(result.output)).toEqual([
			{ name: "Ada", age: "36" },
			{ name: "Alan", age: "41" },
		]);
	});

	it("quotes CSV fields containing commas, quotes, and newlines", () => {
		const json = '[{"note":"a, b","say":"he said \\"hi\\""}]';
		expect(convertData(json, "json", "csv").output).toBe(
			'note,say\n"a, b","he said ""hi"""',
		);
	});

	it("round-trips CSV with embedded commas through JSON", () => {
		const csv = 'city,note\nParis,"a, b, c"';
		const json = convertData(csv, "csv", "json");
		expect(JSON.parse(json.output)).toEqual([
			{ city: "Paris", note: "a, b, c" },
		]);
	});

	it("converts JSON to YAML", () => {
		const json = '{"name":"Ada","langs":["ADA","Pascal"]}';
		expect(convertData(json, "json", "yaml").output).toBe(
			"name: Ada\nlangs:\n  - ADA\n  - Pascal",
		);
	});

	it("converts YAML to JSON", () => {
		const yaml = "name: Ada\nage: 36\n";
		const result = convertData(yaml, "yaml", "json");
		expect(JSON.parse(result.output)).toEqual({ name: "Ada", age: 36 });
	});

	it("serializes nested values as JSON inside a CSV cell", () => {
		const json = '[{"id":1,"tags":["a","b"]}]';
		expect(convertData(json, "json", "csv").output).toBe(
			'id,tags\n1,"[""a"",""b""]"',
		);
	});

	it("errors when JSON is malformed", () => {
		const result = convertData("{ not json", "json", "yaml");
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/JSON/);
	});

	it("errors when converting non-tabular data to CSV", () => {
		const result = convertData("42", "json", "csv");
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/array of objects/);
	});

	it("treats empty input as empty output", () => {
		expect(convertData("", "json", "csv")).toEqual({ ok: true, output: "" });
	});
});
