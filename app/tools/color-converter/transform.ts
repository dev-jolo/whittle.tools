export interface Rgb {
	r: number;
	g: number;
	b: number;
}

export interface Hsl {
	h: number;
	s: number;
	l: number;
}

export interface ColorParse {
	ok: boolean;
	rgb?: Rgb;
	error?: string;
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

function parseHex(text: string): Rgb | null {
	let hex = text.trim().replace(/^#/, "");
	if (/^[0-9a-fA-F]{3}$/.test(hex)) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	// Accept 6 (rgb) or 8 (rgba — alpha ignored) hex digits.
	if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) return null;
	return {
		r: Number.parseInt(hex.slice(0, 2), 16),
		g: Number.parseInt(hex.slice(2, 4), 16),
		b: Number.parseInt(hex.slice(4, 6), 16),
	};
}

function parseRgb(text: string): Rgb | null {
	const match = text
		.trim()
		.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
	if (!match) return null;
	const [r, g, b] = [match[1], match[2], match[3]].map((n) =>
		clamp(Math.round(Number(n)), 0, 255),
	);
	return { r, g, b };
}

function parseHslString(text: string): Rgb | null {
	const match = text
		.trim()
		.match(/^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/i);
	if (!match) return null;
	return hslToRgb({
		h: Number(match[1]),
		s: clamp(Number(match[2]), 0, 100),
		l: clamp(Number(match[3]), 0, 100),
	});
}

/** Parse a hex, rgb(), or hsl() color string into RGB. Alpha is ignored. */
export function parseColor(text: string): ColorParse {
	const trimmed = text.trim();
	if (trimmed === "") return { ok: true };

	const lower = trimmed.toLowerCase();
	const rgb = lower.startsWith("rgb")
		? parseRgb(trimmed)
		: lower.startsWith("hsl")
			? parseHslString(trimmed)
			: parseHex(trimmed);

	if (!rgb) return { ok: false, error: "Not a recognizable color." };
	return { ok: true, rgb };
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
	const rf = r / 255;
	const gf = g / 255;
	const bf = b / 255;
	const max = Math.max(rf, gf, bf);
	const min = Math.min(rf, gf, bf);
	const delta = max - min;
	const l = (max + min) / 2;

	let h = 0;
	let s = 0;
	if (delta !== 0) {
		s = delta / (1 - Math.abs(2 * l - 1));
		switch (max) {
			case rf:
				h = ((gf - bf) / delta) % 6;
				break;
			case gf:
				h = (bf - rf) / delta + 2;
				break;
			default:
				h = (rf - gf) / delta + 4;
		}
		h *= 60;
		if (h < 0) h += 360;
	}
	return {
		h: Math.round(h),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
	const sf = s / 100;
	const lf = l / 100;
	const c = (1 - Math.abs(2 * lf - 1)) * sf;
	const hp = (((h % 360) + 360) % 360) / 60;
	const x = c * (1 - Math.abs((hp % 2) - 1));
	let r = 0;
	let g = 0;
	let b = 0;
	if (hp < 1) [r, g, b] = [c, x, 0];
	else if (hp < 2) [r, g, b] = [x, c, 0];
	else if (hp < 3) [r, g, b] = [0, c, x];
	else if (hp < 4) [r, g, b] = [0, x, c];
	else if (hp < 5) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];
	const m = lf - c / 2;
	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255),
	};
}

export function toHex({ r, g, b }: Rgb): string {
	const hex = (n: number) => n.toString(16).padStart(2, "0");
	return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export function toRgbString({ r, g, b }: Rgb): string {
	return `rgb(${r}, ${g}, ${b})`;
}

export function toHslString(rgb: Rgb): string {
	const { h, s, l } = rgbToHsl(rgb);
	return `hsl(${h}, ${s}%, ${l}%)`;
}
