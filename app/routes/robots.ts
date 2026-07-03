import { absoluteUrl } from "@/lib/site";

/** Resource route: emits robots.txt pointing crawlers at the sitemap. */
export function loader() {
	const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
}
