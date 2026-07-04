import { describe, expect, it } from "vitest";

import {
	DEFAULT_OPTIONS,
	type PasswordOptions,
	activePools,
	entropyBits,
	generatePassword,
} from "./transform";

function options(overrides: Partial<PasswordOptions> = {}): PasswordOptions {
	return { ...DEFAULT_OPTIONS, ...overrides };
}

describe("generatePassword", () => {
	it("respects the requested length", () => {
		expect(generatePassword(options({ length: 32 }))).toHaveLength(32);
	});

	it("uses only the selected character class", () => {
		const password = generatePassword(
			options({
				length: 40,
				lowercase: false,
				uppercase: false,
				symbols: false,
			}),
		);
		expect(password).toMatch(/^[0-9]+$/);
	});

	it("includes at least one character from every selected class", () => {
		const password = generatePassword(options({ length: 24 }));
		expect(password).toMatch(/[a-z]/);
		expect(password).toMatch(/[A-Z]/);
		expect(password).toMatch(/[0-9]/);
		expect(password).toMatch(/[^a-zA-Z0-9]/);
	});

	it("excludes ambiguous characters when asked", () => {
		const password = generatePassword(
			options({ length: 200, excludeAmbiguous: true }),
		);
		expect(password).not.toMatch(/[O0oIl1|`]/);
	});

	it("returns empty when no classes are selected", () => {
		expect(
			generatePassword(
				options({
					lowercase: false,
					uppercase: false,
					digits: false,
					symbols: false,
				}),
			),
		).toBe("");
	});
});

describe("activePools and entropy", () => {
	it("drops ambiguous characters from the pools", () => {
		const pools = activePools(options({ excludeAmbiguous: true }));
		expect(pools.join("")).not.toMatch(/[O0oIl1|`]/);
	});

	it("grows entropy with length and pool size", () => {
		const small = entropyBits(
			options({ length: 8, uppercase: false, digits: false, symbols: false }),
		);
		const large = entropyBits(options({ length: 32 }));
		expect(large).toBeGreaterThan(small);
	});
});
