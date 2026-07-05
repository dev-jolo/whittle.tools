export type CodeLang = "html" | "css" | "js";
export type CodeMode = "beautify" | "minify";
export type CodeIndent = "2" | "4" | "tab";

export interface CodeFormatOptions {
	lang: CodeLang;
	mode: CodeMode;
	/** Indentation for beautify; ignored when minifying. */
	indent: CodeIndent;
}

export const DEFAULT_OPTIONS: CodeFormatOptions = {
	lang: "js",
	mode: "beautify",
	indent: "2",
};

export interface CodeFormatSuccess {
	ok: true;
	output: string;
}

export interface CodeFormatError {
	ok: false;
	error: string;
}

export type CodeFormatResult = CodeFormatSuccess | CodeFormatError;

type Beautifier = (source: string, options?: Record<string, unknown>) => string;

/**
 * The library functions the beautify/minify pipeline needs, injected by the
 * component after it lazily imports js-beautify and terser. Keeping them as
 * parameters lets this module be unit-tested without a static dependency.
 */
export interface CodeEngines {
	beautify: { js: Beautifier; css: Beautifier; html: Beautifier };
	/** terser's `minify_sync`; throws on a syntax error. */
	minifyJs: (source: string) => { code?: string };
}

function beautifyOptions(indent: CodeIndent): Record<string, unknown> {
	return {
		indent_size: indent === "4" ? 4 : 2,
		indent_char: indent === "tab" ? "\t" : " ",
		indent_with_tabs: indent === "tab",
		end_with_newline: false,
		preserve_newlines: true,
		max_preserve_newlines: 2,
	};
}

/**
 * Minify CSS: strip comments and collapse insignificant whitespace, while
 * preserving the contents of quoted strings verbatim. Pure and dependency-free.
 */
export function minifyCss(input: string): string {
	// Split into string / non-string segments so structural whitespace removal
	// never touches text inside quotes (e.g. content: "a ; b").
	const parts: { str: boolean; text: string }[] = [];
	let buf = "";
	let i = 0;
	const n = input.length;
	while (i < n) {
		const c = input[i];
		if (c === '"' || c === "'") {
			if (buf) parts.push({ str: false, text: buf });
			buf = "";
			let s = c;
			i++;
			while (i < n) {
				s += input[i];
				if (input[i] === "\\") {
					s += input[i + 1] ?? "";
					i += 2;
					continue;
				}
				if (input[i] === c) {
					i++;
					break;
				}
				i++;
			}
			parts.push({ str: true, text: s });
			continue;
		}
		if (c === "/" && input[i + 1] === "*") {
			const end = input.indexOf("*/", i + 2);
			i = end === -1 ? n : end + 2;
			continue;
		}
		buf += c;
		i++;
	}
	if (buf) parts.push({ str: false, text: buf });

	return parts
		.map((part) =>
			part.str
				? part.text
				: part.text
						.replace(/\s+/g, " ")
						.replace(/\s*([{}:;,>~+])\s*/g, "$1"),
		)
		.join("")
		.replace(/;}/g, "}")
		.trim();
}

/** Raw-text elements whose contents must not be reformatted. */
const RAW_ELEMENTS = new Set(["pre", "textarea", "script", "style"]);

/**
 * Minify HTML: drop comments and collapse whitespace, preserving the contents
 * of <pre>, <textarea>, <script>, and <style>. Conditional comments (<!--[if])
 * are kept. Pure and dependency-free.
 */
export function minifyHtml(input: string): string {
	let out = "";
	let i = 0;
	const n = input.length;
	while (i < n) {
		if (input[i] === "<") {
			if (input.startsWith("<!--", i)) {
				const end = input.indexOf("-->", i + 4);
				const stop = end === -1 ? n : end + 3;
				const comment = input.slice(i, stop);
				if (/^<!--\[if/i.test(comment) || /\[endif\]/i.test(comment)) {
					out += comment;
				}
				i = stop;
				continue;
			}
			const end = input.indexOf(">", i);
			const stop = end === -1 ? n : end + 1;
			const tag = input.slice(i, stop);
			out += tag;
			const name = /^<([a-zA-Z][\w-]*)/.exec(tag)?.[1].toLowerCase();
			if (name && RAW_ELEMENTS.has(name) && !tag.endsWith("/>")) {
				const close = `</${name}`;
				const idx = input.toLowerCase().indexOf(close, stop);
				const contentEnd = idx === -1 ? n : idx;
				out += input.slice(stop, contentEnd);
				i = contentEnd;
				continue;
			}
			i = stop;
			continue;
		}
		const next = input.indexOf("<", i);
		const end = next === -1 ? n : next;
		const collapsed = input.slice(i, end).replace(/\s+/g, " ");
		// Drop whitespace-only text between tags; keep collapsed real text.
		out += collapsed.trim() === "" ? "" : collapsed;
		i = end;
	}
	return out.trim();
}

/**
 * Beautify or minify HTML, CSS, or JavaScript. Beautification and JS
 * minification are delegated to the injected engines; CSS/HTML minification is
 * handled by the pure helpers above. Returns a friendly error instead of
 * throwing when the input can't be parsed (e.g. invalid JS passed to minify).
 */
export function formatCode(
	input: string,
	options: CodeFormatOptions,
	engines: CodeEngines,
): CodeFormatResult {
	if (input.trim() === "") return { ok: true, output: "" };

	try {
		if (options.mode === "beautify") {
			const opts = beautifyOptions(options.indent);
			const beautify = engines.beautify;
			const output =
				options.lang === "js"
					? beautify.js(input, opts)
					: options.lang === "css"
						? beautify.css(input, opts)
						: beautify.html(input, opts);
			return { ok: true, output };
		}

		// Minify
		if (options.lang === "js") {
			const result = engines.minifyJs(input);
			return { ok: true, output: result.code ?? "" };
		}
		if (options.lang === "css") return { ok: true, output: minifyCss(input) };
		return { ok: true, output: minifyHtml(input) };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
