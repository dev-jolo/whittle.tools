import { useDeferredValue, useMemo, useState } from "react";
import {
	AlertCircleIcon,
	CopyIcon,
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
import { cn } from "@/lib/utils";
import {
	DEFAULT_OPTIONS,
	type XmlFormatOptions,
	type XmlIndent,
	type XmlMode,
	formatXml,
} from "./transform";

const SAMPLE_INPUT =
	'<?xml version="1.0"?><catalog><book id="1"><title>XML Basics</title><author>A. Dev</author></book><book id="2"><title>Advanced XML</title></book></catalog>';

const MODE_OPTIONS: { value: XmlMode; label: string }[] = [
	{ value: "beautify", label: "Beautify" },
	{ value: "minify", label: "Minify" },
];

const INDENT_OPTIONS: { value: XmlIndent; label: string }[] = [
	{ value: "2", label: "2 spaces" },
	{ value: "4", label: "4 spaces" },
	{ value: "tab", label: "Tabs" },
];

export function XmlFormatter() {
	const [input, setInput] = useState("");
	const [options, setOptions] = useState<XmlFormatOptions>(DEFAULT_OPTIONS);

	// Derive from a deferred copy so typing and large pastes stay responsive.
	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => formatXml(deferredInput, options),
		[deferredInput, options],
	);
	const isStale = deferredInput !== input;

	function setOption<K extends keyof XmlFormatOptions>(
		key: K,
		value: XmlFormatOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	const hasInput = input.trim() !== "";
	const showError = hasInput && !result.ok && !isStale;
	const output = result.ok ? result.output : "";

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
						<Label htmlFor="mode">Mode</Label>
						<Select
							value={options.mode}
							onValueChange={(value) => setOption("mode", value as XmlMode)}
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
							onValueChange={(value) => setOption("indent", value as XmlIndent)}
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
						placeholder={"Paste your XML here…\n<root>\n  <item>value</item>\n</root>"}
						spellCheck={false}
						className="min-h-72 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
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
								<Badge variant="destructive">Invalid XML</Badge>
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
						placeholder="Your formatted XML appears here."
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
