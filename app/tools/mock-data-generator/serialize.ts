import type { FieldValue } from "@/lib/faker-fields";
import type { Row, SchemaField } from "./generate";

export type ExportFormat = "json" | "csv" | "sql" | "ts";

export interface SerializeOptions {
	format: ExportFormat;
	/** Table name for SQL INSERTs. */
	tableName: string;
	/** Interface name for the TypeScript export. */
	typeName: string;
	/** Const name for the TypeScript export. */
	constName: string;
}

export const DEFAULT_SERIALIZE_OPTIONS: SerializeOptions = {
	format: "json",
	tableName: "my_table",
	typeName: "Row",
	constName: "data",
};

/** Escape one value for an RFC 4180 CSV cell. */
function csvCell(value: FieldValue): string {
	const str = String(value);
	if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
	return str;
}

/** Render one value as a SQL literal. */
function sqlLiteral(value: FieldValue): string {
	if (typeof value === "number") return String(value);
	if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
	return `'${String(value).replace(/'/g, "''")}'`;
}

function toCsv(rows: Row[], fields: SchemaField[]): string {
	const header = fields.map((f) => csvCell(f.name)).join(",");
	const body = rows.map((row) =>
		fields.map((f) => csvCell(row[f.name])).join(","),
	);
	return [header, ...body].join("\n");
}

function toSql(rows: Row[], fields: SchemaField[], table: string): string {
	if (rows.length === 0) return "";
	const columns = fields.map((f) => f.name).join(", ");
	const values = rows
		.map((row) => `  (${fields.map((f) => sqlLiteral(row[f.name])).join(", ")})`)
		.join(",\n");
	return `INSERT INTO ${table} (${columns}) VALUES\n${values};`;
}

/** Whether `name` is a bare JS/TS identifier that needs no quoting. */
function isIdentifier(name: string): boolean {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function tsType(value: FieldValue | undefined): string {
	if (typeof value === "number") return "number";
	if (typeof value === "boolean") return "boolean";
	return "string";
}

function toTypeScript(
	rows: Row[],
	fields: SchemaField[],
	typeName: string,
	constName: string,
): string {
	const sample = rows[0];
	const members = fields
		.map((f) => {
			const key = isIdentifier(f.name) ? f.name : JSON.stringify(f.name);
			return `\t${key}: ${tsType(sample?.[f.name])};`;
		})
		.join("\n");
	const iface = `export interface ${typeName} {\n${members}\n}`;
	const literal = JSON.stringify(rows, null, 2);
	return `${iface}\n\nexport const ${constName}: ${typeName}[] = ${literal};`;
}

/**
 * Serialize generated rows into the chosen export format. Pure and
 * dependency-free so it can be unit tested and run anywhere.
 */
export function serializeRows(
	rows: Row[],
	fields: SchemaField[],
	options: SerializeOptions,
): string {
	switch (options.format) {
		case "json":
			return JSON.stringify(rows, null, 2);
		case "csv":
			return toCsv(rows, fields);
		case "sql":
			return toSql(rows, fields, options.tableName);
		case "ts":
			return toTypeScript(rows, fields, options.typeName, options.constName);
	}
}
