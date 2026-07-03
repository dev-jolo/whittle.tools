import {
	isRouteErrorResponse,
	Links,
	Link,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/site";
import { getThemeFromCookie, THEME_INIT_SCRIPT, type Theme } from "@/lib/theme";
import "./app.css";

export function loader({ request }: Route.LoaderArgs) {
	return { theme: getThemeFromCookie(request.headers.get("cookie")) };
}

export const meta: Route.MetaFunction = () => [
	{ title: `${siteConfig.name} — ${siteConfig.tagline}` },
	{ name: "description", content: siteConfig.description },
];

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>("root");
	const theme: Theme = data?.theme ?? "system";

	return (
		<html
			lang="en"
			className={theme === "dark" ? "dark" : undefined}
			suppressHydrationWarning
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content={siteConfig.themeColor.dark} />
				<Meta />
				<Links />
				{/* Applies the persisted theme before paint to avoid a flash. */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
			</head>
			<body className="antialiased">
				<ThemeProvider theme={theme}>
					<TooltipProvider delayDuration={200}>
						<div className="relative flex min-h-dvh flex-col">
							<SiteHeader />
							<main className="flex-1">{children}</main>
							<SiteFooter />
						</div>
						<Toaster position="bottom-center" />
					</TooltipProvider>
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let title = "Something went wrong";
	let message = "An unexpected error occurred. Please try again.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			title = "Page not found";
			message = "We couldn't find the tool or page you were looking for.";
		} else {
			title = `${error.status} ${error.statusText}`;
			message = error.data?.message ?? message;
		}
	} else if (import.meta.env.DEV && error instanceof Error) {
		message = error.message;
		stack = error.stack;
	}

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">{message}</p>
			</div>
			<Button asChild>
				<Link to="/">Back to home</Link>
			</Button>
			{stack && (
				<pre className="bg-muted w-full overflow-x-auto rounded-lg p-4 text-left text-xs">
					<code>{stack}</code>
				</pre>
			)}
		</div>
	);
}
