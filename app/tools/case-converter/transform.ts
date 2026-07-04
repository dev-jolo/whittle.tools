export interface CaseVariant {
	key: string;
	label: string;
	value: string;
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Break arbitrary text into words, splitting on separators (space, _, -, .),
 * and on camelCase / PascalCase / acronym boundaries. Pure and dependency-free.
 */
export function toWords(input: string): string[] {
	return input
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.replace(/[_\-.]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean);
}

/** Produce every supported case variant of the input, in display order. */
export function convertCase(input: string): CaseVariant[] {
	const words = toWords(input);
	const lower = words.map((w) => w.toLowerCase());

	const camel = lower
		.map((w, i) => (i === 0 ? w : capitalize(w)))
		.join("");
	const pascal = lower.map(capitalize).join("");

	return [
		{ key: "camel", label: "camelCase", value: camel },
		{ key: "pascal", label: "PascalCase", value: pascal },
		{ key: "snake", label: "snake_case", value: lower.join("_") },
		{ key: "kebab", label: "kebab-case", value: lower.join("-") },
		{
			key: "constant",
			label: "CONSTANT_CASE",
			value: lower.map((w) => w.toUpperCase()).join("_"),
		},
		{ key: "title", label: "Title Case", value: words.map(capitalize).join(" ") },
		{
			key: "sentence",
			label: "Sentence case",
			value: lower.length
				? capitalize(lower[0]) + (lower.length > 1 ? " " + lower.slice(1).join(" ") : "")
				: "",
		},
		{ key: "lower", label: "lower case", value: lower.join(" ") },
		{
			key: "upper",
			label: "UPPER CASE",
			value: lower.map((w) => w.toUpperCase()).join(" "),
		},
	];
}
