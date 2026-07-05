import { describe, expect, it } from "vitest";

import {
	parseSchemaFile,
	sanitizeConfig,
	type SchemaConfig,
	serializeSchemaFile,
} from "./mock-schema-store";

const validConfig: SchemaConfig = {
	fields: [
		{ name: "id", typeId: "autoIncrement" },
		{ name: "email", typeId: "email" },
	],
	count: 25,
	format: "sql",
	tableName: "users",
	typeName: "User",
	constName: "users",
};

describe("sanitizeConfig", () => {
	it("accepts a well-formed config", () => {
		expect(sanitizeConfig(validConfig)).toEqual(validConfig);
	});

	it("rejects non-objects and missing fields", () => {
		expect(sanitizeConfig(null)).toBeNull();
		expect(sanitizeConfig("nope")).toBeNull();
		expect(sanitizeConfig({ count: 5 })).toBeNull();
		expect(sanitizeConfig({ fields: [] })).toBeNull();
	});

	it("coerces unknown field types to uuid", () => {
		const result = sanitizeConfig({
			fields: [{ name: "x", typeId: "not-a-real-type" }],
		});
		expect(result?.fields[0].typeId).toBe("uuid");
	});

	it("clamps row count and defaults an invalid format", () => {
		const result = sanitizeConfig({
			fields: [{ name: "a", typeId: "uuid" }],
			count: 999999,
			format: "yaml",
		});
		expect(result?.count).toBe(5000);
		expect(result?.format).toBe("json");
	});

	it("fills defaults for missing string options", () => {
		const result = sanitizeConfig({ fields: [{ typeId: "uuid" }] });
		expect(result?.fields[0].name).toBe("uuid");
		expect(result?.tableName).toBe("my_table");
		expect(result?.constName).toBe("data");
	});
});

describe("schema file round-trip", () => {
	it("serializes and parses back to the same config", () => {
		const file = serializeSchemaFile("My schema", validConfig);
		const parsed = parseSchemaFile(file);
		expect(parsed?.name).toBe("My schema");
		expect(parsed?.config).toEqual(validConfig);
	});

	it("is self-describing", () => {
		const file = JSON.parse(serializeSchemaFile("x", validConfig));
		expect(file.app).toBe("whittle.tools");
		expect(file.kind).toBe("mock-data-schema");
		expect(file.version).toBe(1);
	});

	it("accepts a bare config object too", () => {
		const parsed = parseSchemaFile(JSON.stringify(validConfig));
		expect(parsed?.config).toEqual(validConfig);
	});

	it("returns null on garbage input", () => {
		expect(parseSchemaFile("not json")).toBeNull();
		expect(parseSchemaFile("{}")).toBeNull();
		expect(parseSchemaFile("[]")).toBeNull();
	});
});
