import type { Tool } from "../types";
import { urlEncoderMeta } from "./meta";
import { UrlEncoder } from "./url-encoder";

export const urlEncoder: Tool = { ...urlEncoderMeta, Component: UrlEncoder };
