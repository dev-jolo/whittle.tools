/**
 * Central site metadata. Single source of truth for branding, SEO defaults,
 * and external links so pages, the manifest, and structured data stay in sync.
 */
export const siteConfig = {
	name: "whittle.tools",
	shortName: "whittle",
	domain: "whittle.tools",
	/** Canonical origin. Override via VITE_SITE_URL in other environments. */
	url: import.meta.env.VITE_SITE_URL ?? "https://whittle.tools",
	tagline: "Sharp little tools for developers.",
	description:
		"A fast, privacy-friendly collection of developer utilities. Transform text and data right in your browser — nothing ever leaves your device.",
	// TODO: point this at the real repository once published.
	repo: "https://github.com/whittle-tools/whittle.tools",
	author: "whittle.tools",
	locale: "en_US",
	themeColor: {
		light: "#ffffff",
		dark: "#0a0a0a",
	},
} as const;

export type SiteConfig = typeof siteConfig;

/** Build an absolute URL for a path against the canonical origin. */
export function absoluteUrl(path = "/"): string {
	return new URL(path, siteConfig.url).toString();
}
