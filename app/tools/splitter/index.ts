import type { Tool } from "../types";
import { splitterMeta } from "./meta";
import { Splitter } from "./splitter";

export const splitter: Tool = { ...splitterMeta, Component: Splitter };
