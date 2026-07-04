import { dump as dumpYaml, load as loadYaml } from "js-yaml";

export type DataFormat = "json" | "csv" | "yaml";

export const DATA_FORMATS: { value: DataFormat; label: string }[] = [
	{ value: "json", label: "JSON" },
	{ value: "csv", label: "CSV" },
	{ value: "yaml", label: "YAML" },
];

export interface DataConvertResult {
	ok: boolean;
	output: string;
	error?: string;
}

/* -------------------------------------------------------------------------- */
/* CSV                                                                        */
/* -------------------------------------------------------------------------- */

/** Split CSV text into rows of fields (RFC 4180: quotes, escapes, newlines). */
function parseCsvRows(text: string): string[][] {
	const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;

	for (let i = 0; i < normalized.length; i++) {
		const char = normalized[i];
		if (inQuotes) {
			if (char === '"') {
				if (normalized[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += char;
			}
		} else if (char === '"') {
			inQuotes = true;
		} else if (char === ",") {
			row.push(field);
			field = "";
		} else if (char === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else {
			field += char;
		}
	}
	if (field !== "" || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	// Drop fully-blank lines.
	return rows.filter((cells) => !(cells.length === 1 && cells[0] === ""));
}

function csvToRecords(text: string): Record<string, string>[] {
	const rows = parseCsvRows(text);
	if (rows.length === 0) return [];
	const headers = rows[0];
	return rows.slice(1).map((cells) => {
		const record: Record<string, string> = {};
		headers.forEach((header, index) => {
			record[header] = cells[index] ?? "";
		});
		return record;
	});
}

function escapeCsv(value: string): string {
	return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function cellToString(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function recordsToCsv(value: unknown): string {
	const rows = Array.isArray(value) ? value : [value];
	const allObjects = rows.every(
		(row) => row !== null && typeof row === "object" && !Array.isArray(row),
	);
	if (!allObjects) {
		throw new Error(
			"CSV needs an array of objects (or a single object) — the data here is a different shape.",
		);
	}

	const headers: string[] = [];
	for (const row of rows) {
		for (const key of Object.keys(row as Record<string, unknown>)) {
			if (!headers.includes(key)) headers.push(key);
		}
	}

	const lines = [headers.map(escapeCsv).join(",")];
	for (const row of rows) {
		const record = row as Record<string, unknown>;
		lines.push(headers.map((h) => escapeCsv(cellToString(record[h]))).join(","));
	}
	return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Parse / serialize                                                          */
/* -------------------------------------------------------------------------- */

function parseInput(input: string, format: DataFormat): unknown {
	switch (format) {
		case "json":
			return JSON.parse(input);
		case "yaml":
			return loadYaml(input);
		case "csv":
			return csvToRecords(input);
	}
}

function serialize(value: unknown, format: DataFormat): string {
	switch (format) {
		case "json":
			return JSON.stringify(value, null, 2);
		case "yaml":
			return dumpYaml(value, { lineWidth: -1, noRefs: true }).trimEnd();
		case "csv":
			return recordsToCsv(value);
	}
}

function parseErrorMessage(format: DataFormat, error: unknown): string {
	const label = format.toUpperCase();
	const detail = error instanceof Error ? error.message : String(error);
	return `That isn't valid ${label}: ${detail}`;
}

/**
 * Convert structured data between JSON, CSV, and YAML by parsing the source
 * format into a plain value and re-serializing it. Pure (wraps js-yaml + a
 * hand-rolled CSV codec); runs entirely client-side.
 */
export function convertData(
	input: string,
	from: DataFormat,
	to: DataFormat,
): DataConvertResult {
	if (input.trim() === "") return { ok: true, output: "" };

	let value: unknown;
	try {
		value = parseInput(input, from);
	} catch (error) {
		return { ok: false, output: "", error: parseErrorMessage(from, error) };
	}

	try {
		return { ok: true, output: serialize(value, to) };
	} catch (error) {
		return {
			ok: false,
			output: "",
			error: error instanceof Error ? error.message : "Conversion failed.",
		};
	}
}
