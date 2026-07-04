import type { Tool } from "../types";
import { timestampMeta } from "./meta";
import { Timestamp } from "./timestamp";

export const timestamp: Tool = { ...timestampMeta, Component: Timestamp };
