import { QrCode } from "lucide-react";

import type { ToolMeta } from "../types";

export const qrCodeMeta: ToolMeta = {
	slug: "qr-code",
	name: "QR Code Generator",
	aliases: ["qr generator", "qr code", "generate qr", "url to qr", "qrcode"],
	tagline: "Turn a link or text into a QR code.",
	description:
		"Type a URL or any text and get a QR code instantly, then download it as a crisp SVG or a high-resolution PNG. Choose the error-correction level and a custom color. Generated entirely in your browser — the content never leaves your device.",
	keywords: [
		"qr code generator",
		"generate qr code",
		"url to qr code",
		"qr code from text",
		"qr code png",
		"qr code svg",
		"free qr generator",
	],
	category: "generator",
	icon: QrCode,
	status: "stable",
};
