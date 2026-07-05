export interface SlugifyOptions {
	/** Character placed between words, typically "-" or "_". */
	separator: string;
	/** Lowercase the result. */
	lowercase: boolean;
	/**
	 * Strip anything that isn't a letter, number, or separator. When false,
	 * unknown characters are turned into separators instead of dropped.
	 */
	strict: boolean;
}

export const DEFAULT_OPTIONS: SlugifyOptions = {
	separator: "-",
	lowercase: true,
	strict: true,
};

/** Characters escaped when used inside a character class in a RegExp. */
function escapeForCharClass(char: string): string {
	return char.replace(/[\\\]^-]/g, "\\$&");
}

/**
 * Turn arbitrary text into a URL-safe slug. Accents are stripped, `&` becomes
 * "and", and runs of separators are collapsed. Pure and dependency-free.
 */
export function slugify(input: string, options: SlugifyOptions): string {
	const sep = options.separator;

	let slug = input
		.normalize("NFKD")
		// Drop combining diacritical marks left behind by NFKD decomposition.
		.replace(/[̀-ͯ]/g, "")
		.replace(/&/g, " and ")
		.trim();

	if (options.lowercase) slug = slug.toLowerCase();

	if (options.strict) {
		// Replace any run of non-alphanumeric characters with a single separator.
		slug = slug.replace(/[^a-zA-Z0-9]+/g, sep);
	} else {
		// Collapse whitespace to the separator but keep other characters.
		slug = slug.replace(/\s+/g, sep);
	}

	// Collapse repeated separators and trim them from the ends.
	if (sep) {
		const e = escapeForCharClass(sep);
		slug = slug
			.replace(new RegExp(`${e}{2,}`, "g"), sep)
			.replace(new RegExp(`^${e}+|${e}+$`, "g"), "");
	}

	return slug;
}
