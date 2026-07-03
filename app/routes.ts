import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("tools", "routes/tools.tsx"),
	route("tools/:slug", "routes/tool.tsx"),
	route("sitemap.xml", "routes/sitemap.ts"),
	route("robots.txt", "routes/robots.ts"),
] satisfies RouteConfig;
