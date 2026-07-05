export type XmlMode = "beautify" | "minify";
export type XmlIndent = "2" | "4" | "tab";

export interface XmlFormatOptions {
	mode: XmlMode;
	/** Indentation width for beautify; ignored when minifying. */
	indent: XmlIndent;
}

export const DEFAULT_OPTIONS: XmlFormatOptions = {
	mode: "beautify",
	indent: "2",
};

export interface XmlFormatSuccess {
	ok: true;
	output: string;
}

export interface XmlFormatError {
	ok: false;
	error: string;
}

export type XmlFormatResult = XmlFormatSuccess | XmlFormatError;

type Token =
	| { type: "open"; raw: string; name: string }
	| { type: "close"; raw: string; name: string }
	| { type: "self"; raw: string; name: string }
	| { type: "text"; raw: string }
	| { type: "comment"; raw: string }
	| { type: "cdata"; raw: string }
	| { type: "pi"; raw: string }
	| { type: "doctype"; raw: string };

/** Read the element name that follows a `<` or `</`. */
function readName(source: string, start: number): string {
	const match = /^[^\s/>]+/.exec(source.slice(start));
	return match ? match[0] : "";
}

/**
 * Split XML into a flat token stream. Throws a friendly Error on unterminated
 * constructs. Attribute contents are preserved verbatim inside each tag's raw.
 */
function tokenize(input: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;
	const n = input.length;

	while (i < n) {
		if (input[i] === "<") {
			if (input.startsWith("<!--", i)) {
				const end = input.indexOf("-->", i + 4);
				if (end === -1) throw new Error("Unterminated comment (missing -->)");
				tokens.push({ type: "comment", raw: input.slice(i, end + 3) });
				i = end + 3;
			} else if (input.startsWith("<![CDATA[", i)) {
				const end = input.indexOf("]]>", i + 9);
				if (end === -1) throw new Error("Unterminated CDATA section (missing ]]>)");
				tokens.push({ type: "cdata", raw: input.slice(i, end + 3) });
				i = end + 3;
			} else if (input.startsWith("<?", i)) {
				const end = input.indexOf("?>", i + 2);
				if (end === -1)
					throw new Error("Unterminated processing instruction (missing ?>)");
				tokens.push({ type: "pi", raw: input.slice(i, end + 2) });
				i = end + 2;
			} else if (input.startsWith("<!", i)) {
				const end = input.indexOf(">", i + 2);
				if (end === -1) throw new Error("Unterminated declaration (missing >)");
				tokens.push({ type: "doctype", raw: input.slice(i, end + 1) });
				i = end + 1;
			} else if (input.startsWith("</", i)) {
				const end = input.indexOf(">", i + 2);
				if (end === -1) throw new Error("Unterminated closing tag (missing >)");
				const raw = input.slice(i, end + 1);
				tokens.push({ type: "close", raw, name: readName(input, i + 2) });
				i = end + 1;
			} else {
				const end = input.indexOf(">", i + 1);
				if (end === -1) throw new Error("Unterminated tag (missing >)");
				const raw = input.slice(i, end + 1);
				const selfClosing = input[end - 1] === "/";
				const name = readName(input, i + 1);
				tokens.push({ type: selfClosing ? "self" : "open", raw, name });
				i = end + 1;
			}
		} else {
			const next = input.indexOf("<", i);
			const end = next === -1 ? n : next;
			tokens.push({ type: "text", raw: input.slice(i, end) });
			i = end;
		}
	}

	return tokens;
}

/** Validate tag nesting, returning an error message or null when balanced. */
function checkNesting(tokens: Token[]): string | null {
	const stack: string[] = [];
	for (const token of tokens) {
		if (token.type === "open") stack.push(token.name);
		else if (token.type === "close") {
			const open = stack.pop();
			if (open === undefined)
				return `Unexpected closing tag </${token.name}>`;
			if (open !== token.name)
				return `Mismatched tag: expected </${open}> but found </${token.name}>`;
		}
	}
	if (stack.length > 0) return `Unclosed tag <${stack[stack.length - 1]}>`;
	return null;
}

const INDENT_UNIT: Record<XmlIndent, string> = {
	"2": "  ",
	"4": "    ",
	tab: "\t",
};

/** Collapse runs of whitespace to single spaces and trim the ends. */
function collapse(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

function beautify(tokens: Token[], unit: string): string {
	const lines: string[] = [];
	let depth = 0;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const pad = unit.repeat(Math.max(depth, 0));

		switch (token.type) {
			case "open": {
				// Inline an element whose only child is text or CDATA: <a>text</a>.
				// Text is whitespace-collapsed; CDATA is kept verbatim.
				const next = tokens[i + 1];
				const after = tokens[i + 2];
				if (
					(next?.type === "text" || next?.type === "cdata") &&
					after?.type === "close" &&
					after.name === token.name
				) {
					const inner = next.type === "text" ? collapse(next.raw) : next.raw;
					lines.push(`${pad}${token.raw}${inner}${after.raw}`);
					i += 2;
				} else {
					lines.push(`${pad}${token.raw}`);
					depth++;
				}
				break;
			}
			case "close":
				depth = Math.max(depth - 1, 0);
				lines.push(`${unit.repeat(depth)}${token.raw}`);
				break;
			case "text": {
				const trimmed = collapse(token.raw);
				if (trimmed) lines.push(`${pad}${trimmed}`);
				break;
			}
			default:
				lines.push(`${pad}${token.raw}`);
		}
	}

	return lines.join("\n");
}

function minify(tokens: Token[]): string {
	return tokens
		.map((token) => {
			// Drop whitespace-only formatting text; keep real text verbatim.
			if (token.type === "text") return /\S/.test(token.raw) ? token.raw : "";
			return token.raw;
		})
		.join("");
}

/**
 * Pretty-print or minify XML. Parsing validates tag nesting, so malformed
 * input returns a friendly error instead of throwing. Beautify normalizes
 * insignificant whitespace; minify preserves the text content of elements.
 * Pure and dependency-free.
 */
export function formatXml(
	input: string,
	options: XmlFormatOptions,
): XmlFormatResult {
	if (input.trim() === "") return { ok: true, output: "" };

	let tokens: Token[];
	try {
		tokens = tokenize(input);
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "Invalid XML",
		};
	}

	const nestingError = checkNesting(tokens);
	if (nestingError) return { ok: false, error: nestingError };

	const output =
		options.mode === "minify"
			? minify(tokens)
			: beautify(tokens, INDENT_UNIT[options.indent]);

	return { ok: true, output };
}
