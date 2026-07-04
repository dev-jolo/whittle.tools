import type { Tool } from "../types";
import { HashGenerator } from "./hash";
import { hashMeta } from "./meta";

export const hash: Tool = { ...hashMeta, Component: HashGenerator };
