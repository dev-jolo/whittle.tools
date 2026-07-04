import type { Tool } from "../types";
import { qrCodeMeta } from "./meta";
import { QrCode } from "./qr-code";

export const qrCode: Tool = { ...qrCodeMeta, Component: QrCode };
