import { describe, expect, it } from "vitest";

import {
	epochSeconds,
	parseTimestamp,
	relativeTime,
	toIso,
} from "./transform";

describe("parseTimestamp", () => {
	it("reads 10-digit input as seconds", () => {
		const result = parseTimestamp("1516239022");
		expect(result.detectedAs).toBe("seconds");
		expect(result.epochMs).toBe(1516239022000);
	});

	it("reads 13-digit input as milliseconds", () => {
		const result = parseTimestamp("1516239022000");
		expect(result.detectedAs).toBe("milliseconds");
		expect(result.epochMs).toBe(1516239022000);
	});

	it("reads fractional seconds", () => {
		expect(parseTimestamp("1516239022.5").epochMs).toBe(1516239022500);
	});

	it("parses an ISO date string", () => {
		const result = parseTimestamp("2018-01-18T01:30:22.000Z");
		expect(result.detectedAs).toBe("date");
		expect(result.epochMs).toBe(1516239022000);
	});

	it("errors on unrecognizable input", () => {
		const result = parseTimestamp("not a date");
		expect(result.ok).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it("treats blank input as an empty, error-free result", () => {
		expect(parseTimestamp("   ")).toEqual({ ok: true });
	});
});

describe("formatting helpers", () => {
	it("derives epoch seconds and ISO", () => {
		expect(epochSeconds(1516239022000)).toBe(1516239022);
		expect(toIso(1516239022000)).toBe("2018-01-18T01:30:22.000Z");
	});

	it("produces relative time in both directions", () => {
		const now = 1516239022000;
		expect(relativeTime(now + 3 * 60 * 60 * 1000, now)).toBe("in 3 hours");
		expect(relativeTime(now - 2 * 24 * 60 * 60 * 1000, now)).toBe("2 days ago");
	});
});
