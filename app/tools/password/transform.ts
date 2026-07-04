export interface PasswordOptions {
	length: number;
	lowercase: boolean;
	uppercase: boolean;
	digits: boolean;
	symbols: boolean;
	/** Drop visually ambiguous characters like O/0 and l/1/I. */
	excludeAmbiguous: boolean;
}

export const DEFAULT_OPTIONS: PasswordOptions = {
	length: 20,
	lowercase: true,
	uppercase: true,
	digits: true,
	symbols: true,
	excludeAmbiguous: false,
};

const CHARSETS = {
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	digits: "0123456789",
	symbols: "!@#$%^&*()-_=+[]{};:,.<>?/",
};

const AMBIGUOUS = new Set("O0oIl1|`");

/** Uniform random integer in [0, maxExclusive) via rejection sampling. */
function randomInt(maxExclusive: number): number {
	const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
	const buffer = new Uint32Array(1);
	let value: number;
	do {
		crypto.getRandomValues(buffer);
		value = buffer[0];
	} while (value >= limit);
	return value % maxExclusive;
}

/** The selected character pools, with ambiguous characters optionally removed. */
export function activePools(options: PasswordOptions): string[] {
	const pools: string[] = [];
	for (const key of ["lowercase", "uppercase", "digits", "symbols"] as const) {
		if (!options[key]) continue;
		let chars = CHARSETS[key];
		if (options.excludeAmbiguous) {
			chars = [...chars].filter((c) => !AMBIGUOUS.has(c)).join("");
		}
		if (chars) pools.push(chars);
	}
	return pools;
}

/**
 * Generate a random password from the selected character classes, guaranteeing
 * at least one character from each (when length allows). Uses the platform
 * CSPRNG; pure aside from that randomness.
 */
export function generatePassword(options: PasswordOptions): string {
	const pools = activePools(options);
	if (pools.length === 0) return "";

	const length = Math.max(1, Math.min(256, Math.floor(options.length) || 1));
	const all = pools.join("");
	const chars: string[] = [];

	for (const pool of pools) {
		if (chars.length < length) chars.push(pool[randomInt(pool.length)]);
	}
	while (chars.length < length) chars.push(all[randomInt(all.length)]);

	// Fisher–Yates shuffle so the guaranteed characters aren't stuck up front.
	for (let i = chars.length - 1; i > 0; i--) {
		const j = randomInt(i + 1);
		[chars[i], chars[j]] = [chars[j], chars[i]];
	}
	return chars.join("");
}

/** Approximate entropy in bits for the given options: length × log2(pool size). */
export function entropyBits(options: PasswordOptions): number {
	const poolSize = activePools(options).join("").length;
	if (poolSize === 0) return 0;
	const length = Math.max(1, Math.min(256, Math.floor(options.length) || 1));
	return Math.floor(length * Math.log2(poolSize));
}
