import { Palette } from "lucide-react";

import type { ToolMeta } from "../types";

export const colorConverterMeta: ToolMeta = {
	slug: "color-converter",
	name: "Color Converter",
	aliases: [
		"hex to rgb",
		"rgb to hex",
		"hex to hsl",
		"rgb to hsl",
		"color picker",
		"color code converter",
	],
	tagline: "Convert colors between HEX, RGB, and HSL.",
	description:
		"Pick a color or type a HEX, RGB, or HSL value and see it in all three formats at once, with a live swatch. Edit any field and the rest follow. Handy for translating a design token into whatever your code needs. Runs entirely in your browser.",
	keywords: [
		"hex to rgb",
		"rgb to hex",
		"hex to hsl",
		"rgb to hsl",
		"color converter",
		"color picker",
		"color code converter",
	],
	category: "converter",
	icon: Palette,
	status: "stable",
};
