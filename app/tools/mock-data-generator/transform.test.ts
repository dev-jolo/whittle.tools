import { faker } from "@faker-js/faker/locale/en";
import { describe, expect, it } from "vitest";

import { generateRows, type SchemaField, withUniqueNames } from "./generate";
import {
	DEFAULT_SERIALIZE_OPTIONS,
	serializeRows,
	type SerializeOptions,
} from "./serialize";

const fields: SchemaField[] = [
	{ key: "a", name: "id", typeId: "autoIncrement" },
	{ key: "b", name: "name", typeId: "fullName" },
	{ key: "c", name: "active", typeId: "boolean" },
];

function serialize(overrides: Partial<SerializeOptions> = {}) {
	const rows = generateRows(fields, 2, faker, 123);
	return serializeRows(rows, fields, { ...DEFAULT_SERIALIZE_OPTIONS, ...overrides });
}

describe("generateRows", () => {
	it("produces the requested number of rows with all columns", () => {
		const rows = generateRows(fields, 5, faker, 1);
		expect(rows).toHaveLength(5);
		expect(Object.keys(rows[0])).toEqual(["id", "name", "active"]);
	});

	it("auto-increments from 1", () => {
		const rows = generateRows(fields, 3, faker, 1);
		expect(rows.map((r) => r.id)).toEqual([1, 2, 3]);
	});

	it("is deterministic for a given seed", () => {
		const a = generateRows(fields, 4, faker, 42);
		const b = generateRows(fields, 4, faker, 42);
		const c = generateRows(fields, 4, faker, 43);
		expect(a).toEqual(b);
		expect(a).not.toEqual(c);
	});
});

describe("withUniqueNames", () => {
	it("suffixes duplicate names", () => {
		const result = withUniqueNames([
			{ key: "1", name: "email", typeId: "email" },
			{ key: "2", name: "email", typeId: "email" },
			{ key: "3", name: "email", typeId: "email" },
		]);
		expect(result.map((f) => f.name)).toEqual(["email", "email_2", "email_3"]);
	});

	it("falls back to the type id when a name is blank", () => {
		const result = withUniqueNames([{ key: "1", name: "  ", typeId: "uuid" }]);
		expect(result[0].name).toBe("uuid");
	});
});

describe("serializeRows", () => {
	it("emits pretty JSON", () => {
		const out = serialize({ format: "json" });
		const parsed = JSON.parse(out);
		expect(parsed).toHaveLength(2);
		expect(parsed[0].id).toBe(1);
	});

	it("emits CSV with a header row", () => {
		const out = serialize({ format: "csv" });
		const lines = out.split("\n");
		expect(lines[0]).toBe("id,name,active");
		expect(lines).toHaveLength(3);
	});

	it("quotes CSV cells containing commas", () => {
		const rows = [{ note: "a, b", n: 1 }];
		const flds: SchemaField[] = [
			{ key: "1", name: "note", typeId: "words" },
			{ key: "2", name: "n", typeId: "int100" },
		];
		const out = serializeRows(rows, flds, {
			...DEFAULT_SERIALIZE_OPTIONS,
			format: "csv",
		});
		expect(out).toBe('note,n\n"a, b",1');
	});

	it("emits SQL INSERT with escaped strings, booleans, and numbers", () => {
		const rows = [{ id: 1, name: "O'Brien", active: true }];
		const out = serializeRows(rows, fields, {
			...DEFAULT_SERIALIZE_OPTIONS,
			format: "sql",
			tableName: "users",
		});
		expect(out).toBe(
			"INSERT INTO users (id, name, active) VALUES\n  (1, 'O''Brien', TRUE);",
		);
	});

	it("emits a typed TypeScript export", () => {
		const out = serialize({ format: "ts", typeName: "User", constName: "users" });
		expect(out).toContain("export interface User {");
		expect(out).toContain("id: number;");
		expect(out).toContain("name: string;");
		expect(out).toContain("active: boolean;");
		expect(out).toContain("export const users: User[] =");
	});

	it("quotes non-identifier TS keys", () => {
		const rows = [{ "first name": "x" }];
		const flds: SchemaField[] = [{ key: "1", name: "first name", typeId: "firstName" }];
		const out = serializeRows(rows, flds, {
			...DEFAULT_SERIALIZE_OPTIONS,
			format: "ts",
		});
		expect(out).toContain('"first name": string;');
	});
});
