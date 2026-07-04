export type NumberBase = 2 | 8 | 10 | 16;

export const BASES: { base: NumberBase; label: string; prefix: string }[] = [
	{ base: 10, label: "Decimal", prefix: "" },
	{ base: 16, label: "Hexadecimal", prefix: "0x" },
	{ base: 8, label: "Octal", prefix: "0o" },
	{ base: 2, label: "Binary", prefix: "0b" },
];

const PATTERNS: Record<NumberBase, RegExp> = {
	2: /^[01]+$/,
	8: /^[0-7]+$/,
	10: /^\d+$/,
	16: /^[0-9a-fA-F]+$/,
};

const PREFIXES: Record<NumberBase, string> = {
	2: "0b",
	8: "0o",
	10: "",
	16: "0x",
};

export interface ParseResult {
	ok: boolean;
	/** Undefined when the field is blank (a valid "cleared" state). */
	value?: bigint;
	error?: string;
}

/**
 * Parse a string written in the given base into a BigInt (sign-magnitude, so a
 * leading "-" is allowed). Pure and dependency-free; supports arbitrarily large
 * values. An optional 0x/0o/0b prefix matching the base is tolerated.
 */
export function parseInBase(text: string, base: NumberBase): ParseResult {
	const trimmed = text.trim();
	if (trimmed === "") return { ok: true };

	const negative = trimmed.startsWith("-");
	let digits = negative ? trimmed.slice(1) : trimmed;

	const prefix = PREFIXES[base];
	if (prefix && digits.toLowerCase().startsWith(prefix)) {
		digits = digits.slice(prefix.length);
	}

	if (!PATTERNS[base].test(digits)) {
		const label = BASES.find((b) => b.base === base)?.label ?? `base-${base}`;
		return { ok: false, error: `Not a valid ${label.toLowerCase()} number.` };
	}

	const magnitude = BigInt(`${PREFIXES[base]}${digits}`);
	return { ok: true, value: negative ? -magnitude : magnitude };
}

/** Render a BigInt in the given base (lowercase digits, no prefix). */
export function formatInBase(value: bigint, base: NumberBase): string {
	return value.toString(base);
}
