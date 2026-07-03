/**
 * Generates the PWA/favicon icon set from a single vector source (the whittle
 * mark) so branding stays consistent. Run with: `pnpm run icons`.
 *
 * Outputs PNGs into public/icons plus an apple-touch-icon and favicon.svg.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const iconsDir = resolve(publicDir, "icons");

const BG = "#0a0a0a";
const FG = "#fafafa";

/** The whittle mark, drawn in a 24×24 coordinate space. */
const MARK = `
	<path d="M4 20L14.5 9.5" stroke="${FG}" stroke-width="2" stroke-linecap="round"/>
	<path d="M13 8L18 3L21 6L16 11L13 8Z" stroke="${FG}" stroke-width="2" stroke-linejoin="round"/>
	<path d="M5 15C7 15.5 8.5 17 9 19" stroke="${FG}" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
`;

/**
 * Build an SVG string. `maskable` uses a full-bleed background and shrinks the
 * mark into the safe zone; otherwise the icon has rounded corners.
 */
function svg(size, { maskable = false } = {}) {
	const inset = maskable ? size * 0.28 : size * 0.24;
	const markSize = size - inset * 2;
	const radius = maskable ? 0 : Math.round(size * 0.22);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
	<rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
	<svg x="${inset}" y="${inset}" width="${markSize}" height="${markSize}" viewBox="0 0 24 24" fill="none">${MARK}</svg>
</svg>`;
}

const targets = [
	{ file: "icons/icon-192.png", size: 192 },
	{ file: "icons/icon-512.png", size: 512 },
	{ file: "icons/icon-maskable-512.png", size: 512, maskable: true },
	{ file: "apple-touch-icon.png", size: 180 },
	{ file: "favicon-32.png", size: 32 },
];

await mkdir(iconsDir, { recursive: true });

for (const { file, size, maskable } of targets) {
	const out = resolve(publicDir, file);
	await sharp(Buffer.from(svg(size, { maskable }))).png().toFile(out);
	console.log(`✓ ${file} (${size}px${maskable ? ", maskable" : ""})`);
}

// A crisp vector favicon for browsers that support it.
await writeFile(resolve(publicDir, "favicon.svg"), svg(512), "utf8");
console.log("✓ favicon.svg");
