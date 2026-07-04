import { describe, expect, it } from "vitest";

import {
	formatUuid,
	generateUuids,
	uuidV4,
	uuidV7,
} from "./transform";

const V4_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V7_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("uuid generation", () => {
	it("produces a valid v4 UUID", () => {
		expect(uuidV4()).toMatch(V4_RE);
	});

	it("produces a valid, time-ordered v7 UUID", () => {
		expect(uuidV7()).toMatch(V7_RE);
		const earlier = uuidV7(1_000_000_000_000);
		const later = uuidV7(2_000_000_000_000);
		expect(earlier < later).toBe(true);
	});

	it("encodes the timestamp in the leading bytes of v7", () => {
		const id = uuidV7(0x0123456789ab);
		// First 48 bits render as the first two hyphen groups: 01234567-89ab.
		expect(id.startsWith("01234567-89ab")).toBe(true);
	});

	it("generates the requested count and clamps the range", () => {
		expect(generateUuids("v4", 5)).toHaveLength(5);
		expect(generateUuids("v4", 0)).toHaveLength(1);
		expect(generateUuids("v4", 99999)).toHaveLength(1000);
	});

	it("returns unique values", () => {
		const ids = generateUuids("v4", 50);
		expect(new Set(ids).size).toBe(50);
	});
});

describe("formatUuid", () => {
	const uuid = "0189a3f4-1c2b-7def-89ab-0123456789ab";

	it("uppercases when asked", () => {
		expect(formatUuid(uuid, { uppercase: true, hyphens: true })).toBe(
			uuid.toUpperCase(),
		);
	});

	it("strips hyphens when asked", () => {
		expect(formatUuid(uuid, { uppercase: false, hyphens: false })).toBe(
			"0189a3f41c2b7def89ab0123456789ab",
		);
	});
});
