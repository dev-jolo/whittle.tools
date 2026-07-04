import { describe, expect, it } from "vitest";

import {
	hslToRgb,
	parseColor,
	rgbToHsl,
	toHex,
	toHslString,
	toRgbString,
} from "./transform";

describe("parseColor", () => {
	it("parses 6-digit and 3-digit hex", () => {
		expect(parseColor("#ff8800").rgb).toEqual({ r: 255, g: 136, b: 0 });
		expect(parseColor("#f80").rgb).toEqual({ r: 255, g: 136, b: 0 });
	});

	it("parses rgb() with commas or spaces", () => {
		expect(parseColor("rgb(255, 136, 0)").rgb).toEqual({ r: 255, g: 136, b: 0 });
		expect(parseColor("rgb(255 136 0)").rgb).toEqual({ r: 255, g: 136, b: 0 });
	});

	it("parses hsl() strings", () => {
		expect(parseColor("hsl(32, 100%, 50%)").rgb).toEqual({
			r: 255,
			g: 136,
			b: 0,
		});
	});

	it("ignores alpha in hex and rgba", () => {
		expect(parseColor("#ff880080").rgb).toEqual({ r: 255, g: 136, b: 0 });
		expect(parseColor("rgba(255,136,0,0.5)").rgb).toEqual({
			r: 255,
			g: 136,
			b: 0,
		});
	});

	it("errors on unrecognizable input", () => {
		expect(parseColor("not-a-color").ok).toBe(false);
	});

	it("treats blank input as a cleared, error-free result", () => {
		expect(parseColor("  ")).toEqual({ ok: true });
	});
});

describe("conversions", () => {
	it("formats hex, rgb, and hsl", () => {
		const rgb = { r: 255, g: 136, b: 0 };
		expect(toHex(rgb)).toBe("#ff8800");
		expect(toRgbString(rgb)).toBe("rgb(255, 136, 0)");
		expect(toHslString(rgb)).toBe("hsl(32, 100%, 50%)");
	});

	it("round-trips through HSL within rounding tolerance", () => {
		// Integer HSL is lossy, so allow each channel to drift by at most 1.
		const rgb = { r: 64, g: 128, b: 200 };
		const back = hslToRgb(rgbToHsl(rgb));
		expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1);
		expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1);
		expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1);
	});

	it("handles greys with zero saturation", () => {
		expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({
			h: 0,
			s: 0,
			l: 50,
		});
	});
});
