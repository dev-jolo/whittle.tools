export type LoremUnit = "paragraphs" | "sentences" | "words";

export interface LoremOptions {
	unit: LoremUnit;
	count: number;
	/** Begin with the traditional "Lorem ipsum dolor sit amet…" opening. */
	startWithLorem: boolean;
}

export const DEFAULT_OPTIONS: LoremOptions = {
	unit: "paragraphs",
	count: 3,
	startWithLorem: true,
};

const WORDS = [
	"lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
	"elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
	"et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis",
	"nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex",
	"ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
	"voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
	"excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
	"culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
	"laborum", "perspiciatis", "unde", "omnis", "iste", "natus", "error",
	"voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
	"aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
];

const LOREM_OPENING = "lorem ipsum dolor sit amet consectetur adipiscing elit";

function randomInt(rng: () => number, min: number, max: number): number {
	return min + Math.floor(rng() * (max - min + 1));
}

function pick(rng: () => number): string {
	return WORDS[Math.floor(rng() * WORDS.length)];
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeSentence(rng: () => number, opening?: string): string {
	const length = randomInt(rng, 6, 14);
	const words: string[] = [];
	if (opening) {
		words.push(...opening.split(" "));
	}
	while (words.length < length) words.push(pick(rng));
	const text = words.join(" ");
	return `${capitalize(text)}.`;
}

function makeParagraph(rng: () => number, opening?: string): string {
	const sentences = randomInt(rng, 3, 6);
	const out: string[] = [];
	for (let i = 0; i < sentences; i++) {
		out.push(makeSentence(rng, i === 0 ? opening : undefined));
	}
	return out.join(" ");
}

/**
 * Generate placeholder Lorem ipsum text. The random source is injectable so the
 * output is deterministic in tests. Pure and dependency-free.
 */
export function generateLorem(
	options: LoremOptions,
	rng: () => number = Math.random,
): string {
	const count = Math.max(1, Math.min(100, Math.floor(options.count) || 1));
	const opening = options.startWithLorem ? LOREM_OPENING : undefined;

	if (options.unit === "words") {
		const words: string[] = [];
		if (opening) words.push(...opening.split(" "));
		while (words.length < count) words.push(pick(rng));
		return capitalize(words.slice(0, count).join(" "));
	}

	if (options.unit === "sentences") {
		return Array.from({ length: count }, (_, i) =>
			makeSentence(rng, i === 0 ? opening : undefined),
		).join(" ");
	}

	return Array.from({ length: count }, (_, i) =>
		makeParagraph(rng, i === 0 ? opening : undefined),
	).join("\n\n");
}
