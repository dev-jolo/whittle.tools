import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// tsconfigPaths lets tests resolve the `@/*` alias (e.g. shared code in
// `app/lib`) the same way the app build does.
export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "node",
		include: ["app/**/*.test.ts"],
	},
});
