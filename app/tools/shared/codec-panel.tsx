import type { ReactNode } from "react";
import { CopyIcon, InfoIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CodecMode = "encode" | "decode";

export interface CodecResult {
	ok: boolean;
	output: string;
	error?: string;
}

/** A trailing switch tied tightly to its label — the house toggle style. */
export function ToggleField({
	id,
	label,
	hint,
	checked,
	onCheckedChange,
}: {
	id: string;
	label: string;
	hint: string;
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<Label htmlFor={id} className="font-normal">
				{label}
			</Label>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						className="text-muted-foreground/70 hover:text-foreground"
						aria-label={`About ${label}`}
					>
						<InfoIcon className="size-3.5" />
					</button>
				</TooltipTrigger>
				<TooltipContent className="max-w-56">{hint}</TooltipContent>
			</Tooltip>
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}

/**
 * Shared layout for encode/decode tools: an Encode/Decode toggle, an optional
 * options slot, a single input pane, and a live output pane with error and copy
 * handling. Each tool owns its state + transform and passes the computed result.
 */
export function CodecPanel({
	mode,
	onModeChange,
	encodeLabel = "Encode",
	decodeLabel = "Decode",
	input,
	onInput,
	result,
	isStale,
	options,
	inputPlaceholder,
	sample,
}: {
	mode: CodecMode;
	onModeChange: (mode: CodecMode) => void;
	encodeLabel?: string;
	decodeLabel?: string;
	input: string;
	onInput: (value: string) => void;
	result: CodecResult;
	isStale: boolean;
	options?: ReactNode;
	inputPlaceholder?: string;
	/** When provided, an "Example" button loads this text (and switches to encode). */
	sample?: string;
}) {
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
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Tabs
						value={mode}
						onValueChange={(value) => onModeChange(value as CodecMode)}
					>
						<TabsList>
							<TabsTrigger value="encode">{encodeLabel}</TabsTrigger>
							<TabsTrigger value="decode">{decodeLabel}</TabsTrigger>
						</TabsList>
					</Tabs>
					{options ? (
						<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
							{options}
						</div>
					) : null}
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<h2 className="text-sm font-medium">Input</h2>
						<div className="flex items-center gap-2">
							{sample !== undefined ? (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onInput(sample)}
								>
									<SparklesIcon className="size-4" />
									Example
								</Button>
							) : null}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onInput("")}
								disabled={!input}
							>
								<Trash2Icon className="size-4" />
								Clear
							</Button>
						</div>
					</header>
					<Textarea
						value={input}
						onChange={(event) => onInput(event.target.value)}
						placeholder={inputPlaceholder}
						spellCheck={false}
						className="min-h-64 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
				</section>

				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-medium">Output</h2>
							{isStale && hasInput ? (
								<Badge variant="secondary" className="text-muted-foreground">
									Working…
								</Badge>
							) : showError ? (
								<Badge variant="destructive">Invalid input</Badge>
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
						placeholder="The result appears here."
						spellCheck={false}
						className={cn(
							"min-h-64 resize-y rounded-none border-0 font-mono text-sm shadow-none transition-opacity focus-visible:ring-0",
							!output && "text-muted-foreground",
							isStale && "opacity-50",
						)}
					/>
					{showError ? (
						<div className="text-destructive border-t px-3 py-2 text-sm">
							{result.error}
						</div>
					) : null}
				</section>
			</div>
		</div>
	);
}
