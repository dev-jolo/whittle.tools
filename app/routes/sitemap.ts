import { absoluteUrl } from "@/lib/site";
import { tools } from "@/tools/registry";

/** Resource route: emits sitemap.xml covering the home, directory, and tools. */
export function loader() {
	const entries = [
		{ loc: absoluteUrl("/"), priority: "1.0", changefreq: "weekly" },
		{ loc: absoluteUrl("/tools"), priority: "0.8", changefreq: "weekly" },
		...tools.map((tool) => ({
			loc: absoluteUrl(`/tools/${tool.slug}`),
			priority: "0.7",
			changefreq: "monthly",
		})),
	];

	const urls = entries
		.map(
			({ loc, priority, changefreq }) =>
				`  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
		)
		.join("\n");

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}
