import { diffArrays, diffWords, diffWordsWithSpace } from "diff";

export interface DiffOptions {
	/** Treat lines/words that differ only in letter case as equal. */
	ignoreCase: boolean;
	/** Ignore leading/trailing whitespace and collapse internal runs. */
	ignoreWhitespace: boolean;
}

export const DEFAULT_OPTIONS: DiffOptions = {
	ignoreCase: false,
	ignoreWhitespace: false,
};

export type LineType = "context" | "add" | "remove";

/** A run of text within a line; `changed` drives the word-level highlight. */
export interface Segment {
	value: string;
	changed: boolean;
}

export interface DiffLine {
	type: LineType;
	/** 1-based line number in the original (absent for pure additions). */
	leftNumber?: number;
	/** 1-based line number in the changed text (absent for pure removals). */
	rightNumber?: number;
	segments: Segment[];
}

/** One aligned row of the side-by-side view; either side may be padding. */
export interface DiffRow {
	left?: DiffLine;
	right?: DiffLine;
}

export interface DiffResult {
	/** Unified/inline sequence of lines, in document order. */
	unified: DiffLine[];
	/** Aligned rows for the side-by-side view. */
	rows: DiffRow[];
	additions: number;
	deletions: number;
	/** Both inputs are equal under the current options. */
	identical: boolean;
	/** Both inputs are empty. */
	empty: boolean;
}

function normalizeLine(line: string, options: DiffOptions): string {
	let out = line;
	if (options.ignoreWhitespace) out = out.replace(/\s+/g, " ").trim();
	if (options.ignoreCase) out = out.toLowerCase();
	return out;
}

function toLines(text: string): string[] {
	const normalized = text.replace(/\r\n/g, "\n");
	if (normalized === "") return [];
	return normalized.split("\n");
}

/** Split a modified line pair into word-level segments for each side. */
function wordSegments(
	oldLine: string,
	newLine: string,
	options: DiffOptions,
): { left: Segment[]; right: Segment[] } {
	const parts = options.ignoreWhitespace
		? diffWords(oldLine, newLine, { ignoreCase: options.ignoreCase })
		: diffWordsWithSpace(oldLine, newLine, { ignoreCase: options.ignoreCase });

	const left: Segment[] = [];
	const right: Segment[] = [];
	for (const part of parts) {
		if (part.added) {
			right.push({ value: part.value, changed: true });
		} else if (part.removed) {
			left.push({ value: part.value, changed: true });
		} else {
			left.push({ value: part.value, changed: false });
			right.push({ value: part.value, changed: false });
		}
	}
	return { left, right };
}

/**
 * Compute a line-level diff of two texts with word-level highlighting inside
 * modified lines. Returns both a unified (inline) sequence and aligned rows for
 * a side-by-side view, plus add/remove counts. Pure and dependency-light (wraps
 * jsdiff) so it can be unit tested and runs entirely client-side.
 */
export function diffText(
	original: string,
	changed: string,
	options: DiffOptions,
): DiffResult {
	const leftLines = toLines(original);
	const rightLines = toLines(changed);
	const empty = leftLines.length === 0 && rightLines.length === 0;

	const changes = diffArrays(leftLines, rightLines, {
		comparator: (a, b) =>
			normalizeLine(a, options) === normalizeLine(b, options),
	});

	const unified: DiffLine[] = [];
	const rows: DiffRow[] = [];
	let leftNo = 0;
	let rightNo = 0;
	let additions = 0;
	let deletions = 0;

	for (let i = 0; i < changes.length; i++) {
		const change = changes[i];

		// Unchanged block.
		if (!change.added && !change.removed) {
			for (const value of change.value) {
				leftNo++;
				rightNo++;
				const line: DiffLine = {
					type: "context",
					leftNumber: leftNo,
					rightNumber: rightNo,
					segments: [{ value, changed: false }],
				};
				unified.push(line);
				rows.push({ left: line, right: { ...line } });
			}
			continue;
		}

		// A removed block immediately followed by an added block is a modified
		// region — pair lines by index so we can highlight the words that changed.
		if (change.removed && changes[i + 1]?.added) {
			const removedLines = change.value;
			const addedLines = changes[i + 1].value;
			const maxLen = Math.max(removedLines.length, addedLines.length);
			const removeObjs: DiffLine[] = [];
			const addObjs: DiffLine[] = [];

			for (let k = 0; k < maxLen; k++) {
				const oldLine = removedLines[k];
				const newLine = addedLines[k];
				const paired = oldLine !== undefined && newLine !== undefined;
				const segs = paired
					? wordSegments(oldLine, newLine, options)
					: undefined;

				let leftLine: DiffLine | undefined;
				let rightLine: DiffLine | undefined;

				if (oldLine !== undefined) {
					leftNo++;
					deletions++;
					leftLine = {
						type: "remove",
						leftNumber: leftNo,
						segments: segs?.left ?? [{ value: oldLine, changed: true }],
					};
					removeObjs.push(leftLine);
				}
				if (newLine !== undefined) {
					rightNo++;
					additions++;
					rightLine = {
						type: "add",
						rightNumber: rightNo,
						segments: segs?.right ?? [{ value: newLine, changed: true }],
					};
					addObjs.push(rightLine);
				}
				rows.push({ left: leftLine, right: rightLine });
			}

			// Unified view lists all removals then all additions (patch order).
			unified.push(...removeObjs, ...addObjs);
			i++; // consume the paired added block
			continue;
		}

		// Pure removal.
		if (change.removed) {
			for (const value of change.value) {
				leftNo++;
				deletions++;
				const line: DiffLine = {
					type: "remove",
					leftNumber: leftNo,
					segments: [{ value, changed: true }],
				};
				unified.push(line);
				rows.push({ left: line });
			}
			continue;
		}

		// Pure addition.
		for (const value of change.value) {
			rightNo++;
			additions++;
			const line: DiffLine = {
				type: "add",
				rightNumber: rightNo,
				segments: [{ value, changed: true }],
			};
			unified.push(line);
			rows.push({ right: line });
		}
	}

	return {
		unified,
		rows,
		additions,
		deletions,
		identical: !empty && additions === 0 && deletions === 0,
		empty,
	};
}

/** Serialize the diff as a unified patch-style string for copying. */
export function toUnifiedText(result: DiffResult): string {
	return result.unified
		.map((line) => {
			const prefix =
				line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
			return `${prefix}${line.segments.map((s) => s.value).join("")}`;
		})
		.join("\n");
}
