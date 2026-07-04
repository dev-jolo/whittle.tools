import type { Tool } from "../types";
import { JwtDecoder } from "./jwt-decoder";
import { jwtDecoderMeta } from "./meta";

export const jwtDecoder: Tool = { ...jwtDecoderMeta, Component: JwtDecoder };
