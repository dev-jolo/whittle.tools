export type Theme = "light" | "dark" | "system";

export const THEME_COOKIE = "whittle-theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isTheme(value: unknown): value is Theme {
	return value === "light" || value === "dark" || value === "system";
}

/** Read the persisted theme preference from a Cookie header (server-side). */
export function getThemeFromCookie(cookieHeader: string | null): Theme {
	if (!cookieHeader) return "system";
	const entry = cookieHeader
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${THEME_COOKIE}=`));
	const value = entry?.slice(THEME_COOKIE.length + 1);
	return isTheme(value) ? value : "system";
}

/**
 * Inline script that runs before first paint to apply the correct theme class,
 * preventing a flash of the wrong theme on initial SSR load. Kept dependency-free
 * and tiny so it can be inlined in the document <head>.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);var t=m?m[1]:"system";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
