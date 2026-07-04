import { describe, expect, it } from "vitest";

import { decodeJwt } from "./transform";

// header {"alg":"HS256","typ":"JWT"} . payload {"sub":"123","name":"Ada","iat":1516239022,"exp":1516242622} . sig
const SAMPLE_JWT =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
	".eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9" +
	".signature-not-verified";

describe("decodeJwt", () => {
	it("decodes header and payload", () => {
		const result = decodeJwt(SAMPLE_JWT);
		expect(result.ok).toBe(true);
		expect(JSON.parse(result.header!)).toEqual({ alg: "HS256", typ: "JWT" });
		expect(JSON.parse(result.payload!)).toMatchObject({
			sub: "123",
			name: "Ada",
		});
	});

	it("extracts standard time claims and the signature", () => {
		const result = decodeJwt(SAMPLE_JWT);
		expect(result.iat).toBe(1516239022);
		expect(result.exp).toBe(1516242622);
		expect(result.nbf).toBeUndefined();
		expect(result.signature).toBe("signature-not-verified");
	});

	it("accepts a token without a signature segment", () => {
		const withoutSig = SAMPLE_JWT.split(".").slice(0, 2).join(".");
		const result = decodeJwt(withoutSig);
		expect(result.ok).toBe(true);
		expect(result.signature).toBe("");
	});

	it("errors when the structure isn't a JWT", () => {
		const result = decodeJwt("just-a-plain-string");
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/JWT/);
	});

	it("errors when a segment isn't valid JSON", () => {
		const result = decodeJwt("bm90anNvbg.bm90anNvbg.sig");
		expect(result.ok).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it("treats empty input as an empty, error-free result", () => {
		expect(decodeJwt("   ")).toEqual({ ok: true });
	});
});
