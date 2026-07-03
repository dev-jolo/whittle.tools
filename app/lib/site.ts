/**
 * Central site metadata. Single source of truth for branding, SEO defaults,
 * and external links so pages, the manifest, and structured data stay in sync.
 */
export const siteConfig = {
	name: "whittle.tools",
	shortName: "whittle",
	domain: "whittle-tools.jolonoval-dev.workers.dev",
	/**
	 * Canonical origin — currently the Cloudflare workers.dev subdomain. When a
	 * custom domain is attached, set VITE_SITE_URL (or change this default).
	 */
	url:
		import.meta.env.VITE_SITE_URL ??
		"https://whittle-tools.jolonoval-dev.workers.dev",
	tagline: "Sharp little tools for developers.",
	description:
		"A fast, privacy-friendly collection of developer utilities. Transform text and data right in your browser — nothing ever leaves your device.",
	repo: "https://github.com/dev-jolo/whittle.tools",
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
