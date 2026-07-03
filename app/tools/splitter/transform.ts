export type SplitDelimiter =
	| "newline"
	| "comma"
	| "space"
	| "semicolon"
	| "tab"
	| "custom";

export type QuoteStyle = "none" | "single" | "double" | "backtick";

export type SortOrder = "none" | "asc" | "desc";

export interface SplitterOptions {
	splitBy: SplitDelimiter;
	/** Used when splitBy === "custom". Treated as a literal string. */
	customDelimiter: string;
	trim: boolean;
	removeEmpty: boolean;
	dedupe: boolean;
	sort: SortOrder;
	quote: QuoteStyle;
	/** Text placed between items, e.g. ", ". */
	separator: string;
	/** Wraps the whole output, e.g. "[" ... "]". */
	prefix: string;
	suffix: string;
	/** Emit one item per line for readability. */
	itemsPerLine: boolean;
}

export const DEFAULT_OPTIONS: SplitterOptions = {
	splitBy: "newline",
	customDelimiter: "",
	trim: true,
	removeEmpty: true,
	dedupe: false,
	sort: "none",
	quote: "double",
	separator: ", ",
	prefix: "[",
	suffix: "]",
	itemsPerLine: false,
};

const QUOTE_CHARS: Record<QuoteStyle, string> = {
	none: "",
	single: "'",
	double: '"',
	backtick: "`",
};

const LITERAL_DELIMITERS: Record<Exclude<SplitDelimiter, "custom">, string> = {
	newline: "\n",
	comma: ",",
	space: " ",
	semicolon: ";",
	tab: "\t",
};

function resolveDelimiter(options: SplitterOptions): string {
	if (options.splitBy === "custom") return options.customDelimiter;
	return LITERAL_DELIMITERS[options.splitBy];
}

function quoteItem(item: string, style: QuoteStyle): string {
	const char = QUOTE_CHARS[style];
	if (!char) return item;
	// Escape any occurrences of the quote character within the item.
	const escaped = item.split(char).join(`\\${char}`);
	return `${char}${escaped}${char}`;
}

export interface SplitterResult {
	items: string[];
	output: string;
	count: number;
}

/**
 * Split raw text into a list and re-serialize it according to the options.
 * Pure and dependency-free so it can be unit tested and run anywhere.
 */
export function splitText(
	input: string,
	options: SplitterOptions,
): SplitterResult {
	const delimiter = resolveDelimiter(options);

	// Normalize CRLF so "newline" splitting behaves the same across platforms.
	const normalized = input.replace(/\r\n/g, "\n");

	let items = delimiter === "" ? [normalized] : normalized.split(delimiter);

	if (options.trim) items = items.map((item) => item.trim());
	if (options.removeEmpty) items = items.filter((item) => item.length > 0);
	if (options.dedupe) items = [...new Set(items)];

	if (options.sort !== "none") {
		items = [...items].sort((a, b) =>
			a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
		);
		if (options.sort === "desc") items.reverse();
	}

	const quoted = items.map((item) => quoteItem(item, options.quote));

	const joiner = options.itemsPerLine
		? `${options.separator.replace(/\s+$/, "")}\n`
		: options.separator;

	const body = options.itemsPerLine
		? quoted.map((item) => `  ${item}`).join(joiner)
		: quoted.join(joiner);

	const inner = options.itemsPerLine && body ? `\n${body}\n` : body;
	const output = `${options.prefix}${inner}${options.suffix}`;

	return { items, output, count: items.length };
}
