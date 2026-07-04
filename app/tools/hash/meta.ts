import { FileDigit } from "lucide-react";

import type { ToolMeta } from "../types";

export const hashMeta: ToolMeta = {
	slug: "hash",
	name: "Hash Generator",
	aliases: [
		"md5",
		"sha256",
		"sha-256",
		"sha1",
		"sha512",
		"checksum",
		"hash text",
	],
	tagline: "Hash text with MD5, SHA-1, SHA-256, and SHA-512.",
	description:
		"Type text and see its MD5, SHA-1, SHA-256, and SHA-512 digests update live — handy for checksums and quick fingerprints. Copy any one with a click. SHA hashes use the browser's built-in crypto; everything is computed locally and never uploaded.",
	keywords: [
		"md5 generator",
		"sha256 generator",
		"sha-1 hash",
		"sha512",
		"hash generator",
		"checksum tool",
		"text hash online",
	],
	category: "generator",
	icon: FileDigit,
	status: "stable",
};
