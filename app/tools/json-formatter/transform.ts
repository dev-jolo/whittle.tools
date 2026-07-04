export type IndentStyle = "2" | "4" | "tab" | "minify";

export interface JsonFormatOptions {
	/** Indentation width, or "minify" to strip all whitespace. */
	indent: IndentStyle;
	/** Recursively sort object keys A→Z for deterministic output. */
	sortKeys: boolean;
}

export const DEFAULT_OPTIONS: JsonFormatOptions = {
	indent: "2",
	sortKeys: false,
};

export interface JsonFormatSuccess {
	ok: true;
	output: string;
}

export interface JsonFormatError {
	ok: false;
	/** Human-friendly reason, e.g. "Unexpected token } (line 4, column 12)". */
	error: string;
	line?: number;
	column?: number;
}

export type JsonFormatResult = JsonFormatSuccess | JsonFormatError;

/** Maps the indent option to the third argument of JSON.stringify. */
function indentArg(indent: IndentStyle): string | number | undefined {
	switch (indent) {
		case "2":
			return 2;
		case "4":
			return 4;
		case "tab":
			return "\t";
		case "minify":
			return undefined;
	}
}

/** Recursively rebuild objects with their keys sorted; arrays keep order. */
function sortValue(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(sortValue);
	if (value && typeof value === "object") {
		const source = value as Record<string, unknown>;
		return Object.keys(source)
			.sort((a, b) => a.localeCompare(b))
			.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = sortValue(source[key]);
				return acc;
			}, {});
	}
	return value;
}

/** Strip the reason out of an engine-specific parse error message. */
function cleanReason(message: string): string {
	return (
		message
			// V8: "… in JSON at position 61 (line 4 column 12)"
			.replace(/\s*in JSON at position \d+.*$/i, "")
			// Fallbacks for other phrasings.
			.replace(/\s*at position \d+.*$/i, "")
			.trim() || "Invalid JSON"
	);
}

/** Convert a character offset into 1-based line and column numbers. */
function locate(input: string, message: string): { line?: number; column?: number } {
	const match = /position (\d+)/i.exec(message);
	if (!match) return {};
	const offset = Number(match[1]);
	let line = 1;
	let column = 1;
	for (let i = 0; i < offset && i < input.length; i++) {
		if (input[i] === "\n") {
			line++;
			column = 1;
		} else {
			column++;
		}
	}
	return { line, column };
}

/**
 * Parse JSON and re-serialize it according to the options. Parsing doubles as
 * validation: invalid input returns a friendly error with line/column instead
 * of throwing. Pure and dependency-free so it can be unit tested and run
 * anywhere.
 */
export function formatJson(
	input: string,
	options: JsonFormatOptions,
): JsonFormatResult {
	// Empty input is not an error — the user simply hasn't typed anything yet.
	if (input.trim() === "") return { ok: true, output: "" };

	let parsed: unknown;
	try {
		parsed = JSON.parse(input);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const reason = cleanReason(message);
		const { line, column } = locate(input, message);
		const suffix =
			line !== undefined ? ` (line ${line}, column ${column})` : "";
		return { ok: false, error: `${reason}${suffix}`, line, column };
	}

	const value = options.sortKeys ? sortValue(parsed) : parsed;
	const output = JSON.stringify(value, null, indentArg(options.indent));
	return { ok: true, output };
}
