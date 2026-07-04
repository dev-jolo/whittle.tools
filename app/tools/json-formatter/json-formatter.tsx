import { useDeferredValue, useMemo, useState } from "react";
import {
	AlertCircleIcon,
	CopyIcon,
	InfoIcon,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	DEFAULT_OPTIONS,
	type IndentStyle,
	type JsonFormatOptions,
	formatJson,
} from "./transform";

const SAMPLE_INPUT =
	'{"name":"whittle","tools":["splitter","json-formatter"],"nested":{"z":1,"a":2},"active":true,"count":42}';

const INDENT_OPTIONS: { value: IndentStyle; label: string }[] = [
	{ value: "2", label: "2 spaces" },
	{ value: "4", label: "4 spaces" },
	{ value: "tab", label: "Tabs" },
	{ value: "minify", label: "Minified" },
];

export function JsonFormatter() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<JsonFormatOptions>(DEFAULT_OPTIONS);

	// Derive the output from a deferred copy of the input so typing and large
	// pastes stay responsive — the parse/format + output render run at a lower
	// priority. `isStale` is true while the output is catching up. See the
	// large-input performance pattern; everything is client-side (offline PWA).
	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => formatJson(deferredInput, options),
		[deferredInput, options],
	);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof JsonFormatOptions>(
		key: K,
		value: JsonFormatOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	async function handleCopy() {
		if (!result.ok || !result.output) {
			toast.info("Nothing to copy yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(result.output);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	const hasInput = input.trim() !== "";
	// While stale, suppress the error/valid state so it doesn't flicker mid-type.
	const showError = hasInput && !result.ok && !isStale;
	const output = result.ok ? result.output : "";

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
					<div className="space-y-1.5">
						<div className="flex items-center gap-1.5">
							<Label htmlFor="indent">Indentation</Label>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="text-muted-foreground/70 hover:text-foreground"
										aria-label="About indentation"
									>
										<InfoIcon className="size-3.5" />
									</button>
								</TooltipTrigger>
								<TooltipContent className="max-w-56">
									How the output is indented. “Minified” strips all whitespace
									for the smallest possible size.
								</TooltipContent>
							</Tooltip>
						</div>
						<Select
							value={options.indent}
							onValueChange={(value) =>
								setOption("indent", value as IndentStyle)
							}
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

					<div className="flex items-center gap-2">
						<Switch
							id="sort-keys"
							checked={options.sortKeys}
							onCheckedChange={(value) => setOption("sortKeys", value)}
						/>
						<Label htmlFor="sort-keys" className="font-normal">
							Sort keys A→Z
						</Label>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="text-muted-foreground/70 hover:text-foreground"
									aria-label="About sort keys"
								>
									<InfoIcon className="size-3.5" />
								</button>
							</TooltipTrigger>
							<TooltipContent className="max-w-56">
								Alphabetically sort every object's keys for tidy, diff-friendly
								output. Array order is left untouched.
							</TooltipContent>
						</Tooltip>
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
								onClick={() => setInput(SAMPLE_INPUT)}
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
						placeholder={'Paste your JSON here…\n{ "hello": "world" }'}
						spellCheck={false}
						className={cn(
							"min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0",
							showError && "text-foreground",
						)}
					/>
					{showError ? (
						<div className="text-destructive flex items-start gap-2 border-t px-3 py-2 text-sm">
							<AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
							<span>{result.error}</span>
						</div>
					) : null}
				</section>

				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-medium">Output</h2>
							{isStale && hasInput ? (
								<Badge variant="secondary" className="text-muted-foreground">
									Formatting…
								</Badge>
							) : showError ? (
								<Badge variant="destructive">Invalid JSON</Badge>
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
						placeholder="Your formatted JSON appears here."
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
