import { absoluteUrl, siteConfig } from "./site";

interface PageMetaInput {
	/** Full document title, e.g. "Splitter — whittle.tools". */
	title: string;
	description: string;
	/** Absolute path for canonical + og:url, e.g. "/tools/splitter". */
	path: string;
	keywords?: string[];
	/** Path or absolute URL to the social image. Defaults to the site OG image. */
	image?: string;
}

/**
 * Build a consistent set of meta descriptors (title, description, Open Graph,
 * Twitter, canonical) for a route's `meta` export.
 */
export function pageMeta({
	title,
	description,
	path,
	keywords,
	image,
}: PageMetaInput) {
	const url = absoluteUrl(path);
	const imageUrl = absoluteUrl(image ?? "/og.png");

	return [
		{ title },
		{ name: "description", content: description },
		...(keywords?.length
			? [{ name: "keywords", content: keywords.join(", ") }]
			: []),
		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: siteConfig.name },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },
		{ property: "og:image", content: imageUrl },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: imageUrl },
		{ tagName: "link", rel: "canonical", href: url },
	];
}
