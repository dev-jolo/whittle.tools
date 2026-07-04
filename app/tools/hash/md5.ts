/**
 * MD5 (RFC 1321), self-contained. The Web Crypto API only offers SHA-*, so MD5
 * is implemented here rather than pulled in as a dependency. Verified against
 * the RFC test vectors in the test suite. Operates on UTF-8 bytes.
 */

function toUtf8Bytes(text: string): Uint8Array {
	return new TextEncoder().encode(text);
}

function rotl(x: number, c: number): number {
	return (x << c) | (x >>> (32 - c));
}

const S = [
	7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
	9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
	16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
	21,
];

const K = Array.from({ length: 64 }, (_, i) =>
	Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296),
);

export function md5(text: string): string {
	const bytes = toUtf8Bytes(text);
	const originalBits = bytes.length * 8;

	// Pad: append 0x80, then zeros, until length ≡ 56 (mod 64), then 64-bit length.
	const paddedLength = ((bytes.length + 8) >> 6) * 64 + 64;
	const buffer = new Uint8Array(paddedLength);
	buffer.set(bytes);
	buffer[bytes.length] = 0x80;
	const view = new DataView(buffer.buffer);
	view.setUint32(paddedLength - 8, originalBits >>> 0, true);
	view.setUint32(paddedLength - 4, Math.floor(originalBits / 4294967296), true);

	let a0 = 0x67452301;
	let b0 = 0xefcdab89;
	let c0 = 0x98badcfe;
	let d0 = 0x10325476;

	for (let offset = 0; offset < paddedLength; offset += 64) {
		const M = new Array<number>(16);
		for (let i = 0; i < 16; i++) M[i] = view.getUint32(offset + i * 4, true);

		let a = a0;
		let b = b0;
		let c = c0;
		let d = d0;

		for (let i = 0; i < 64; i++) {
			let f: number;
			let g: number;
			if (i < 16) {
				f = (b & c) | (~b & d);
				g = i;
			} else if (i < 32) {
				f = (d & b) | (~d & c);
				g = (5 * i + 1) % 16;
			} else if (i < 48) {
				f = b ^ c ^ d;
				g = (3 * i + 5) % 16;
			} else {
				f = c ^ (b | ~d);
				g = (7 * i) % 16;
			}
			f = (f + a + K[i] + M[g]) | 0;
			a = d;
			d = c;
			c = b;
			b = (b + rotl(f, S[i])) | 0;
		}

		a0 = (a0 + a) | 0;
		b0 = (b0 + b) | 0;
		c0 = (c0 + c) | 0;
		d0 = (d0 + d) | 0;
	}

	const out = new Uint8Array(16);
	const outView = new DataView(out.buffer);
	outView.setUint32(0, a0 >>> 0, true);
	outView.setUint32(4, b0 >>> 0, true);
	outView.setUint32(8, c0 >>> 0, true);
	outView.setUint32(12, d0 >>> 0, true);

	return Array.from(out, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
