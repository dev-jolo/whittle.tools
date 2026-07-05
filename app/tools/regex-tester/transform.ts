/** A single regex match with its capture groups. */
export interface RegexMatch {
	/** The full matched substring. */
	value: string;
	/** Zero-based index into the test string where the match starts. */
	index: number;
	/** Numbered capture groups (1..n). `undefined` for groups that didn't take part. */
	groups: (string | undefined)[];
	/** Named capture groups, keyed by name. */
	namedGroups: Record<string, string | undefined>;
}

export interface RegexResult {
	matches: RegexMatch[];
	/** Compilation error message, or `null` when the pattern is valid. */
	error: string | null;
}

/** Upper bound on matches collected, guarding against pathological patterns. */
const MAX_MATCHES = 10_000;

/**
 * Run `pattern` (with `flags`) against `text` and collect every match.
 * When the global flag is absent only the first match is returned, mirroring
 * native `RegExp` semantics. Pure and dependency-free.
 */
export function runRegex(
	pattern: string,
	flags: string,
	text: string,
): RegexResult {
	if (!pattern) return { matches: [], error: null };

	const global = flags.includes("g");
	let re: RegExp;
	try {
		// A `g` flag is needed to iterate with `exec`; add it internally when the
		// user hasn't, then stop after the first match to honor their intent.
		re = new RegExp(pattern, global ? flags : flags + "g");
	} catch (error) {
		return {
			matches: [],
			error: error instanceof Error ? error.message : "Invalid regular expression",
		};
	}

	const matches: RegexMatch[] = [];
	let current: RegExpExecArray | null;
	while ((current = re.exec(text)) !== null) {
		matches.push({
			value: current[0],
			index: current.index,
			groups: current.slice(1),
			namedGroups: { ...current.groups },
		});

		// Zero-length matches don't advance lastIndex; nudge it to avoid a loop.
		if (current.index === re.lastIndex) re.lastIndex++;
		if (!global) break;
		if (matches.length >= MAX_MATCHES) break;
	}

	return { matches, error: null };
}

export interface HighlightSegment {
	text: string;
	/** True when this segment is part of a match. */
	match: boolean;
	/** Index of the match this segment belongs to, for alternating styles. */
	matchIndex?: number;
}

/**
 * Slice `text` into alternating plain / matched segments for highlighting.
 * Overlapping matches can't occur (matches advance monotonically), so a simple
 * left-to-right walk is sufficient.
 */
export function buildSegments(
	text: string,
	matches: RegexMatch[],
): HighlightSegment[] {
	if (matches.length === 0) return text ? [{ text, match: false }] : [];

	const segments: HighlightSegment[] = [];
	let cursor = 0;
	matches.forEach((m, i) => {
		if (m.index > cursor) {
			segments.push({ text: text.slice(cursor, m.index), match: false });
		}
		// Empty matches produce no visible text; skip so they don't render blank.
		if (m.value.length > 0) {
			segments.push({ text: m.value, match: true, matchIndex: i });
			cursor = m.index + m.value.length;
		} else {
			cursor = Math.max(cursor, m.index);
		}
	});
	if (cursor < text.length) {
		segments.push({ text: text.slice(cursor), match: false });
	}
	return segments;
}
