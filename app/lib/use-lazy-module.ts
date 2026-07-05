import { useEffect, useState } from "react";

export interface LazyModuleState<T> {
	/** The resolved module, or null until it has loaded. */
	module: T | null;
	loading: boolean;
	error: string | null;
}

/**
 * Load a module on demand via dynamic `import()`, keeping heavy formatting
 * libraries out of the shared bundle so they only download on the tool page
 * that needs them. Pass a module-scope `loader` so its identity is stable and
 * the import runs once.
 */
export function useLazyModule<T>(loader: () => Promise<T>): LazyModuleState<T> {
	const [state, setState] = useState<LazyModuleState<T>>({
		module: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		let cancelled = false;
		loader().then(
			(module) => {
				if (!cancelled) setState({ module, loading: false, error: null });
			},
			(error: unknown) => {
				if (!cancelled) {
					setState({
						module: null,
						loading: false,
						error:
							error instanceof Error ? error.message : "Failed to load module",
					});
				}
			},
		);
		return () => {
			cancelled = true;
		};
	}, [loader]);

	return state;
}
