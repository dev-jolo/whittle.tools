import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import { type Theme, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from "@/lib/theme";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
	/** The user's preference: "light", "dark", or "system". */
	theme: Theme;
	/** The concrete theme currently applied to the document. */
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	);
}

function resolveTheme(theme: Theme): ResolvedTheme {
	if (theme === "system") return systemPrefersDark() ? "dark" : "light";
	return theme;
}

export function ThemeProvider({
	theme: initialTheme,
	children,
}: {
	theme: Theme;
	children: React.ReactNode;
}) {
	const [theme, setThemeState] = useState<Theme>(initialTheme);
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
		resolveTheme(initialTheme),
	);

	const applyTheme = useCallback((next: Theme) => {
		const resolved = resolveTheme(next);
		setResolvedTheme(resolved);
		document.documentElement.classList.toggle("dark", resolved === "dark");
	}, []);

	const setTheme = useCallback(
		(next: Theme) => {
			setThemeState(next);
			document.cookie = `${THEME_COOKIE}=${next};path=/;max-age=${THEME_COOKIE_MAX_AGE};samesite=lax`;
			applyTheme(next);
		},
		[applyTheme],
	);

	// Keep the document class in sync with the OS preference while on "system".
	useEffect(() => {
		if (theme !== "system") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme, applyTheme]);

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
