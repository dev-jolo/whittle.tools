import { useEffect } from "react";

/**
 * Registers the service worker on the client in production builds. Renders
 * nothing. Kept out of dev so the SW cache never interferes with HMR.
 */
export function RegisterServiceWorker() {
	useEffect(() => {
		if (!import.meta.env.PROD) return;
		if (!("serviceWorker" in navigator)) return;

		const onLoad = () => {
			navigator.serviceWorker.register("/sw.js").catch((error) => {
				console.error("Service worker registration failed:", error);
			});
		};

		window.addEventListener("load", onLoad);
		return () => window.removeEventListener("load", onLoad);
	}, []);

	return null;
}
