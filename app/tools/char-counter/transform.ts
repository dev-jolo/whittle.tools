export interface TextStats {
	/** Total characters, counting whitespace (Unicode-aware). */
	characters: number;
	/** Characters excluding all whitespace. */
	charactersNoSpaces: number;
	/** Whitespace-separated words. */
	words: number;
	/** Sentences, delimited by . ! ? … */
	sentences: number;
	/** Lines (one more than the number of line breaks). */
	lines: number;
	/** Paragraphs, separated by one or more blank lines. */
	paragraphs: number;
	/** Estimated reading time in seconds at ~225 words per minute. */
	readingTimeSeconds: number;
}

const WORDS_PER_MINUTE = 225;

/**
 * Compute counts and estimates for a block of text. Uses `Intl.Segmenter` for
 * character counts when available so astral characters (emoji, CJK) count as
 * one. Pure and dependency-free.
 */
export function countText(input: string): TextStats {
	const characters = countGraphemes(input);
	const charactersNoSpaces = countGraphemes(input.replace(/\s/gu, ""));

	const words = input.trim() ? input.trim().split(/\s+/u).length : 0;

	const sentences = (input.match(/[^.!?…]+[.!?…]+(?:["')\]]+)?/gu) ?? []).length;

	// A non-empty document always has at least one line; empty text has none.
	const lines = input === "" ? 0 : input.split(/\r\n|\r|\n/).length;

	const paragraphs = input
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean).length;

	const readingTimeSeconds = Math.round((words / WORDS_PER_MINUTE) * 60);

	return {
		characters,
		charactersNoSpaces,
		words,
		sentences,
		lines,
		paragraphs,
		readingTimeSeconds,
	};
}

/** Grapheme-aware length so emoji and combined characters count as one. */
function countGraphemes(input: string): number {
	if (input === "") return 0;
	if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
		const segmenter = new Intl.Segmenter(undefined, {
			granularity: "grapheme",
		});
		let count = 0;
		for (const _ of segmenter.segment(input)) count++;
		return count;
	}
	// Fallback: spread iterates by code point, still better than `.length`.
	return [...input].length;
}

/** Format a reading-time estimate in seconds as a short human string. */
export function formatReadingTime(seconds: number): string {
	if (seconds <= 0) return "0 sec";
	if (seconds < 60) return `${seconds} sec`;
	const minutes = Math.round(seconds / 60);
	return `${minutes} min`;
}
