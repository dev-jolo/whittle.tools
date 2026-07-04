import type { CodecMode, CodecResult } from "../shared/codec-panel";

export interface HtmlEntitiesOptions {
	/** Also convert every non-ASCII character to a numeric entity when encoding. */
	encodeNonAscii: boolean;
}

export const DEFAULT_OPTIONS: HtmlEntitiesOptions = {
	encodeNonAscii: false,
};

/**
 * Common named entities we decode. Numeric entities (&#169; / &#xA9;) are
 * handled generically, so this only needs the frequently-seen names — unknown
 * names are left untouched rather than guessed at.
 */
const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	copy: "©",
	reg: "®",
	trade: "™",
	hellip: "…",
	mdash: "—",
	ndash: "–",
	lsquo: "‘",
	rsquo: "’",
	ldquo: "“",
	rdquo: "”",
	laquo: "«",
	raquo: "»",
	deg: "°",
	plusmn: "±",
	times: "×",
	divide: "÷",
	frac12: "½",
	frac14: "¼",
	frac34: "¾",
	euro: "€",
	pound: "£",
	yen: "¥",
	cent: "¢",
	sect: "§",
	para: "¶",
	middot: "·",
	bull: "•",
	dagger: "†",
	Dagger: "‡",
	permil: "‰",
	prime: "′",
	Prime: "″",
	larr: "←",
	rarr: "→",
	uarr: "↑",
	darr: "↓",
	harr: "↔",
	spades: "♠",
	clubs: "♣",
	hearts: "♥",
	diams: "♦",
};

function encodeEntities(text: string, encodeNonAscii: boolean): string {
	let out = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

	if (encodeNonAscii) {
		let escaped = "";
		for (const char of out) {
			const codePoint = char.codePointAt(0) ?? 0;
			escaped += codePoint > 127 ? `&#${codePoint};` : char;
		}
		out = escaped;
	}
	return out;
}

function decodeEntities(text: string): string {
	return text.replace(
		/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g,
		(match, body: string) => {
			if (body[0] === "#") {
				const isHex = body[1] === "x" || body[1] === "X";
				const code = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
				if (Number.isNaN(code)) return match;
				try {
					return String.fromCodePoint(code);
				} catch {
					return match;
				}
			}
			const named = NAMED_ENTITIES[body];
			return named !== undefined ? named : match;
		},
	);
}

/**
 * Encode HTML special characters to entities, or decode entities back to text.
 * Pure and dependency-free (no DOM), so it works in tests, SSR, and the worker.
 */
export function htmlEntities(
	input: string,
	mode: CodecMode,
	options: HtmlEntitiesOptions,
): CodecResult {
	if (input === "") return { ok: true, output: "" };
	const output =
		mode === "encode"
			? encodeEntities(input, options.encodeNonAscii)
			: decodeEntities(input);
	return { ok: true, output };
}
