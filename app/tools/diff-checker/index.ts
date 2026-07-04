import type { Tool } from "../types";
import { DiffChecker } from "./diff-checker";
import { diffCheckerMeta } from "./meta";

export const diffChecker: Tool = {
	...diffCheckerMeta,
	Component: DiffChecker,
};
