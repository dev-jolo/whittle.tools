import { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
	AlertCircleIcon,
	CopyIcon,
	Loader2Icon,
	SparklesIcon,
	Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLazyModule } from "@/lib/use-lazy-module";
import { cn } from "@/lib/utils";
import {
	type CodeEngines,
	type CodeFormatOptions,
	type CodeIndent,
	type CodeLang,
	type CodeMode,
	DEFAULT_OPTIONS,
	formatCode,
} from "./transform";

const SAMPLES: Record<CodeLang, string> = {
	js: "const greet=(name)=>{if(!name){return 'Hello, world!'}\nreturn `Hello, ${name}!`};console.log(greet('whittle'))",
	css: "body{margin:0;font-family:system-ui}.card{padding:1rem;border:1px solid #ddd;border-radius:8px}.card h2{margin:0 0 .5rem}",
	html: '<!DOCTYPE html><html><head><title>Demo</title></head><body><main><h1>Hi</h1><p>A <a href="#">link</a>.</p></main></body></html>',
};

const LANG_OPTIONS: { value: CodeLang; label: string }[] = [
	{ value: "js", label: "JavaScript" },
	{ value: "css", label: "CSS" },
	{ value: "html", label: "HTML" },
];

const MODE_OPTIONS: { value: CodeMode; label: string }[] = [
	{ value: "beautify", label: "Beautify" },
	{ value: "minify", label: "Minify" },
];

const INDENT_OPTIONS: { value: CodeIndent; label: string }[] = [
	{ value: "2", label: "2 spaces" },
	{ value: "4", label: "4 spaces" },
	{ value: "tab", label: "Tabs" },
];

const LANG_LABEL: Record<CodeLang, string> = {
	js: "JavaScript",
	css: "CSS",
	html: "HTML",
};

// Module-scope loader: pull in js-beautify + terser only on this tool's page,
// in parallel, so they stay out of the shared bundle.
const loadEngines = (): Promise<CodeEngines> =>
	Promise.all([import("js-beautify"), import("terser")]).then(
		([jsb, terser]) => ({
			beautify: {
				js: jsb.default.js,
				css: jsb.default.css,
				html: jsb.default.html,
			},
			minifyJs: terser.minify_sync,
		}),
	);

export function CodeFormatter() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<CodeFormatOptions>(DEFAULT_OPTIONS);

	const loader = useCallback(loadEngines, []);
	const { module: engines, loading, error: loadError } = useLazyModule(loader);

	const deferredInput = useDeferredValue(input);
	const result = useMemo(() => {
		if (!engines) return null;
		return formatCode(deferredInput, options, engines);
	}, [engines, deferredInput, options]);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof CodeFormatOptions>(
		key: K,
		value: CodeFormatOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	const hasInput = input.trim() !== "";
	const showError = hasInput && result !== null && !result.ok && !isStale;
	const output = result?.ok ? result.output : "";

	async function handleCopy() {
		if (!output) {
			toast.info("Nothing to copy yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(output);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
					<div className="space-y-1.5">
						<Label htmlFor="lang">Language</Label>
						<Select
							value={options.lang}
							onValueChange={(value) => setOption("lang", value as CodeLang)}
						>
							<SelectTrigger id="lang" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LANG_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="mode">Mode</Label>
						<Select
							value={options.mode}
							onValueChange={(value) => setOption("mode", value as CodeMode)}
						>
							<SelectTrigger id="mode" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MODE_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="indent">Indentation</Label>
						<Select
							value={options.indent}
							onValueChange={(value) => setOption("indent", value as CodeIndent)}
							disabled={options.mode === "minify"}
						>
							<SelectTrigger id="indent" className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{INDENT_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<h2 className="text-sm font-medium">Input</h2>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setInput(SAMPLES[options.lang])}
							>
								<SparklesIcon className="size-4" />
								Example
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setInput("")}
								disabled={!input}
							>
								<Trash2Icon className="size-4" />
								Clear
							</Button>
						</div>
					</header>
					<Textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						placeholder={`Paste your ${LANG_LABEL[options.lang]} here…`}
						spellCheck={false}
						className="min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
					{showError ? (
						<div className="text-destructive flex items-start gap-2 border-t px-3 py-2 text-sm">
							<AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
							<span>{result && !result.ok ? result.error : ""}</span>
						</div>
					) : null}
				</section>

				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-medium">Output</h2>
							{loading ? (
								<Badge variant="secondary" className="text-muted-foreground gap-1">
									<Loader2Icon className="size-3 animate-spin" />
									Loading…
								</Badge>
							) : isStale && hasInput ? (
								<Badge variant="secondary" className="text-muted-foreground">
									Working…
								</Badge>
							) : showError ? (
								<Badge variant="destructive">
									Invalid {LANG_LABEL[options.lang]}
								</Badge>
							) : hasInput && output ? (
								<Badge variant="secondary" className="tabular-nums">
									{output.length.toLocaleString()}{" "}
									{output.length === 1 ? "char" : "chars"}
								</Badge>
							) : null}
						</div>
						<Button size="sm" onClick={handleCopy} disabled={!output}>
							<CopyIcon className="size-4" />
							Copy
						</Button>
					</header>
					<Textarea
						value={output}
						readOnly
						placeholder={
							loadError
								? `Couldn't load the formatter: ${loadError}`
								: "Your formatted code appears here."
						}
						spellCheck={false}
						className={cn(
							"min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none transition-opacity focus-visible:ring-0",
							!output && "text-muted-foreground",
							isStale && "opacity-50",
						)}
					/>
				</section>
			</div>
		</div>
	);
}
