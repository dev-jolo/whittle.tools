export interface TimestampParse {
	ok: boolean;
	error?: string;
	/** Milliseconds since the Unix epoch. Undefined when input is blank. */
	epochMs?: number;
	/** How the input was read, for display ("seconds", "milliseconds", "date"). */
	detectedAs?: "seconds" | "milliseconds" | "date";
}

// ~1e12 ms is the year 2001; epoch seconds won't reach that until year ~33658,
// so a bare integer at/above this is treated as milliseconds, otherwise seconds.
const MILLISECOND_THRESHOLD = 1e12;

/**
 * Parse a Unix timestamp (seconds or milliseconds, optionally fractional) or a
 * date string into epoch milliseconds. Pure and deterministic — the "now"-based
 * relative time is left to the UI. Blank input is not an error.
 */
export function parseTimestamp(input: string): TimestampParse {
	const trimmed = input.trim();
	if (trimmed === "") return { ok: true };

	if (/^-?\d+$/.test(trimmed)) {
		const value = Number(trimmed);
		if (Math.abs(value) >= MILLISECOND_THRESHOLD) {
			return { ok: true, epochMs: value, detectedAs: "milliseconds" };
		}
		return { ok: true, epochMs: value * 1000, detectedAs: "seconds" };
	}

	if (/^-?\d+\.\d+$/.test(trimmed)) {
		return {
			ok: true,
			epochMs: Math.round(Number(trimmed) * 1000),
			detectedAs: "seconds",
		};
	}

	const parsed = Date.parse(trimmed);
	if (Number.isNaN(parsed)) {
		return {
			ok: false,
			error: "Couldn't read that as a Unix timestamp or a date.",
		};
	}
	return { ok: true, epochMs: parsed, detectedAs: "date" };
}

export function epochSeconds(epochMs: number): number {
	return Math.floor(epochMs / 1000);
}

export function toIso(epochMs: number): string {
	return new Date(epochMs).toISOString();
}

/** Format an instant in a specific IANA time zone, e.g. "Jul 4, 2026, 14:30:00". */
export function formatInZone(epochMs: number, timeZone: string): string {
	return new Intl.DateTimeFormat("en-US", {
		timeZone,
		dateStyle: "medium",
		timeStyle: "medium",
	}).format(new Date(epochMs));
}

/** Human relative time from `nowMs`, e.g. "in 3 hours" / "2 days ago". */
export function relativeTime(epochMs: number, nowMs: number): string {
	const diffSeconds = Math.round((epochMs - nowMs) / 1000);
	const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
	const units: [Intl.RelativeTimeFormatUnit, number][] = [
		["year", 60 * 60 * 24 * 365],
		["month", 60 * 60 * 24 * 30],
		["day", 60 * 60 * 24],
		["hour", 60 * 60],
		["minute", 60],
		["second", 1],
	];
	for (const [unit, seconds] of units) {
		if (Math.abs(diffSeconds) >= seconds || unit === "second") {
			return formatter.format(Math.round(diffSeconds / seconds), unit);
		}
	}
	return formatter.format(0, "second");
}
