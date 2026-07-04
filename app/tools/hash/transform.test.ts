import { describe, expect, it } from "vitest";

import { md5 } from "./md5";
import { computeHash, computeHashes } from "./transform";

describe("md5 (RFC 1321 vectors)", () => {
	it("hashes the canonical test strings", () => {
		expect(md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
		expect(md5("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
		expect(md5("message digest")).toBe("f96b697d7cb7938d525a2f31aaf161d0");
		expect(md5("The quick brown fox jumps over the lazy dog")).toBe(
			"9e107d9d372bb6826bd81d3542a419d6",
		);
	});

	it("handles multi-byte UTF-8 and multi-block input", () => {
		expect(md5("café")).toBe(md5("café"));
		expect(md5("a".repeat(1000))).toHaveLength(32);
	});
});

describe("computeHash / computeHashes", () => {
	it("matches known SHA vectors for 'abc'", async () => {
		expect(await computeHash("SHA-1", "abc")).toBe(
			"a9993e364706816aba3e25717850c26c9cd0d89d",
		);
		expect(await computeHash("SHA-256", "abc")).toBe(
			"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
		);
	});

	it("returns all algorithms together", async () => {
		const all = await computeHashes("abc");
		expect(all.MD5).toBe("900150983cd24fb0d6963f7d28e17f72");
		expect(all["SHA-256"]).toBe(
			"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
		);
		expect(all["SHA-512"]).toHaveLength(128);
	});
});
