import type { Tool } from "../types";
import { Base64 } from "./base64";
import { base64Meta } from "./meta";

export const base64Tool: Tool = { ...base64Meta, Component: Base64 };
