import { describe, expect, it } from "vitest";

import { countText, formatReadingTime } from "./transform";

describe("countText", () => {
	it("returns all zeros for empty input", () => {
		expect(countText("")).toEqual({
			characters: 0,
			charactersNoSpaces: 0,
			words: 0,
			sentences: 0,
			lines: 0,
			paragraphs: 0,
			readingTimeSeconds: 0,
		});
	});

	it("counts characters with and without whitespace", () => {
		const stats = countText("ab cd");
		expect(stats.characters).toBe(5);
		expect(stats.charactersNoSpaces).toBe(4);
	});

	it("counts words split on any whitespace", () => {
		expect(countText("  hello   world \n foo ").words).toBe(3);
	});

	it("counts sentences by terminal punctuation", () => {
		expect(countText("Hi there. How are you? Great!").sentences).toBe(3);
		expect(countText("No terminator here").sentences).toBe(0);
	});

	it("counts lines and paragraphs", () => {
		const text = "Line one\nLine two\n\nSecond paragraph";
		const stats = countText(text);
		expect(stats.lines).toBe(4);
		expect(stats.paragraphs).toBe(2);
	});

	it("treats emoji as a single character", () => {
		// A family emoji is several code points joined by ZWJ.
		expect(countText("👨‍👩‍👧").characters).toBe(1);
	});

	it("estimates reading time from word count", () => {
		// 225 words ≈ one minute.
		const text = Array.from({ length: 225 }, () => "word").join(" ");
		expect(countText(text).readingTimeSeconds).toBe(60);
	});
});

describe("formatReadingTime", () => {
	it("formats seconds and minutes", () => {
		expect(formatReadingTime(0)).toBe("0 sec");
		expect(formatReadingTime(30)).toBe("30 sec");
		expect(formatReadingTime(90)).toBe("2 min");
	});
});
