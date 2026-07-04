import { describe, expect, it } from "vitest";

import {
	DEFAULT_OPTIONS,
	type DiffOptions,
	diffText,
	toUnifiedText,
} from "./transform";

function options(overrides: Partial<DiffOptions> = {}): DiffOptions {
	return { ...DEFAULT_OPTIONS, ...overrides };
}

/** Compact view of the unified output: type + rendered text per line. */
function unified(original: string, changed: string, opts = DEFAULT_OPTIONS) {
	return diffText(original, changed, opts).unified.map((line) => [
		line.type,
		line.segments.map((s) => s.value).join(""),
	]);
}

describe("diffText", () => {
	it("reports identical inputs", () => {
		const result = diffText("a\nb\nc", "a\nb\nc", DEFAULT_OPTIONS);
		expect(result.identical).toBe(true);
		expect(result.additions).toBe(0);
		expect(result.deletions).toBe(0);
		expect(result.unified.every((l) => l.type === "context")).toBe(true);
	});

	it("flags both inputs empty", () => {
		const result = diffText("", "", DEFAULT_OPTIONS);
		expect(result.empty).toBe(true);
		expect(result.identical).toBe(false);
	});

	it("detects a pure addition", () => {
		const result = diffText("a\nc", "a\nb\nc", DEFAULT_OPTIONS);
		expect(result.additions).toBe(1);
		expect(result.deletions).toBe(0);
		expect(unified("a\nc", "a\nb\nc")).toEqual([
			["context", "a"],
			["add", "b"],
			["context", "c"],
		]);
	});

	it("detects a pure deletion", () => {
		const result = diffText("a\nb\nc", "a\nc", DEFAULT_OPTIONS);
		expect(result.deletions).toBe(1);
		expect(result.additions).toBe(0);
	});

	it("highlights only the changed words within a modified line", () => {
		const result = diffText("the quick fox", "the slow fox", DEFAULT_OPTIONS);
		const remove = result.unified.find((l) => l.type === "remove");
		const add = result.unified.find((l) => l.type === "add");
		expect(remove?.segments).toEqual([
			{ value: "the ", changed: false },
			{ value: "quick", changed: true },
			{ value: " fox", changed: false },
		]);
		expect(add?.segments).toEqual([
			{ value: "the ", changed: false },
			{ value: "slow", changed: true },
			{ value: " fox", changed: false },
		]);
	});

	it("pairs modified lines across both sides in the split view", () => {
		const result = diffText("one\ntwo", "one\nTWO!", DEFAULT_OPTIONS);
		const modifiedRow = result.rows.find(
			(r) => r.left?.type === "remove" && r.right?.type === "add",
		);
		expect(modifiedRow?.left?.leftNumber).toBe(2);
		expect(modifiedRow?.right?.rightNumber).toBe(2);
	});

	it("treats case-only changes as equal when ignoreCase is on", () => {
		const sensitive = diffText("Hello", "hello", DEFAULT_OPTIONS);
		expect(sensitive.identical).toBe(false);

		const insensitive = diffText("Hello", "hello", options({ ignoreCase: true }));
		expect(insensitive.identical).toBe(true);
	});

	it("ignores whitespace-only changes when ignoreWhitespace is on", () => {
		const sensitive = diffText("a  b", "a b", DEFAULT_OPTIONS);
		expect(sensitive.identical).toBe(false);

		const insensitive = diffText(
			"  a  b  ",
			"a b",
			options({ ignoreWhitespace: true }),
		);
		expect(insensitive.identical).toBe(true);
	});

	it("assigns independent line numbers to each side", () => {
		const result = diffText("a\nb\nc", "a\nx\nc", DEFAULT_OPTIONS);
		const remove = result.unified.find((l) => l.type === "remove");
		const add = result.unified.find((l) => l.type === "add");
		expect(remove?.leftNumber).toBe(2);
		expect(remove?.rightNumber).toBeUndefined();
		expect(add?.rightNumber).toBe(2);
		expect(add?.leftNumber).toBeUndefined();
	});

	it("serializes a unified patch string", () => {
		const result = diffText("a\nb\nc", "a\nx\nc", DEFAULT_OPTIONS);
		expect(toUnifiedText(result)).toBe(" a\n-b\n+x\n c");
	});

	it("handles comparing against empty text as all additions", () => {
		const result = diffText("", "a\nb", DEFAULT_OPTIONS);
		expect(result.additions).toBe(2);
		expect(result.deletions).toBe(0);
		expect(result.empty).toBe(false);
	});
});
