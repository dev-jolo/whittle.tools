export type LineSort = "none" | "asc" | "desc" | "length";

export interface LineOptions {
	/** Strip leading and trailing whitespace from each line. */
	trim: boolean;
	/** Drop blank lines. */
	removeEmpty: boolean;
	/** Keep only the first occurrence of each line. */
	dedupe: boolean;
	/** Compare case-insensitively when deduping. */
	ignoreCase: boolean;
	sort: LineSort;
	/** Reverse the final order of lines. */
	reverse: boolean;
	/** Randomize order. Deterministic for a given `shuffleSeed`. */
	shuffle: boolean;
	/** Seed for the shuffle so results are stable across re-renders. */
	shuffleSeed: number;
}

export const DEFAULT_OPTIONS: LineOptions = {
	trim: false,
	removeEmpty: false,
	dedupe: false,
	ignoreCase: false,
	sort: "none",
	reverse: false,
	shuffle: false,
	shuffleSeed: 0,
};

export interface LineResult {
	lines: string[];
	output: string;
	count: number;
}

/** Small deterministic PRNG (mulberry32) so shuffles are reproducible. */
function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** In-place Fisher–Yates shuffle driven by a seeded PRNG. */
function shuffle(items: string[], seed: number): string[] {
	const random = mulberry32(seed);
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Apply a pipeline of line operations to raw text, in a fixed, predictable
 * order: trim → remove empty → dedupe → sort → reverse → shuffle. Pure and
 * dependency-free so it can be unit tested and run anywhere.
 */
export function processLines(input: string, options: LineOptions): LineResult {
	// Normalize CRLF so line splitting behaves the same across platforms.
	let lines = input.replace(/\r\n/g, "\n").split("\n");

	if (options.trim) lines = lines.map((line) => line.trim());
	if (options.removeEmpty) lines = lines.filter((line) => line.length > 0);

	if (options.dedupe) {
		const seen = new Set<string>();
		lines = lines.filter((line) => {
			const key = options.ignoreCase ? line.toLowerCase() : line;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	if (options.sort === "length") {
		lines = [...lines].sort((a, b) => a.length - b.length || a.localeCompare(b));
	} else if (options.sort !== "none") {
		lines = [...lines].sort((a, b) =>
			a.localeCompare(b, undefined, {
				numeric: true,
				sensitivity: options.ignoreCase ? "base" : "variant",
			}),
		);
		if (options.sort === "desc") lines.reverse();
	}

	if (options.reverse) lines = [...lines].reverse();
	if (options.shuffle) lines = shuffle(lines, options.shuffleSeed);

	return { lines, output: lines.join("\n"), count: lines.length };
}
