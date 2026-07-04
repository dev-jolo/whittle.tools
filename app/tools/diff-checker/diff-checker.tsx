import { useDeferredValue, useMemo, useState } from "react";
import {
	ArrowLeftRightIcon,
	CopyIcon,
	InfoIcon,
	SparklesIcon,
	Trash2Icon,
} from "lucide-react";
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
import {
	DEFAULT_OPTIONS,
	type DiffLine,
	type DiffOptions,
	type DiffRow,
	type LineType,
	type Segment,
	diffText,
	toUnifiedText,
} from "./transform";

type ViewMode = "split" | "unified";

const SAMPLE_ORIGINAL = [
	"The quick brown fox",
	"jumps over the lazy dog.",
	"Line to be removed.",
	"Shared closing line.",
].join("\n");

const SAMPLE_CHANGED = [
	"The quick red fox",
	"jumps over the lazy dog.",
	"A brand new line.",
	"Shared closing line.",
].join("\n");

function lineBg(type: LineType): string {
	if (type === "add") return "bg-emerald-500/10";
	if (type === "remove") return "bg-red-500/10";
	return "";
}

function Segments({ segments, type }: { segments: Segment[]; type: LineType }) {
	return (
		<>
			{segments.map((segment, index) =>
				segment.changed ? (
					<span
						key={index}
						className={cn(
							"rounded-[2px]",
							type === "add"
								? "bg-emerald-500/25 dark:bg-emerald-400/20"
								: "bg-red-500/30 dark:bg-red-400/20",
						)}
					>
						{segment.value}
					</span>
				) : (
					<span key={index}>{segment.value}</span>
				),
			)}
		</>
	);
}

const gutter =
	"w-10 shrink-0 select-none px-1 text-right text-muted-foreground/50 tabular-nums";
const content = "min-w-0 flex-1 whitespace-pre-wrap break-words px-2";

function UnifiedLine({ line }: { line: DiffLine }) {
	const marker = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
	return (
		<div className={cn("flex", lineBg(line.type))}>
			<span className={gutter}>{line.leftNumber ?? ""}</span>
			<span className={gutter}>{line.rightNumber ?? ""}</span>
			<span className="text-muted-foreground/60 w-4 shrink-0 select-none text-center">
				{marker}
			</span>
			<span className={content}>
				<Segments segments={line.segments} type={line.type} />
			</span>
		</div>
	);
}

function SplitCell({ line, side }: { line?: DiffLine; side: "left" | "right" }) {
	if (!line) return <div className="bg-muted/40 flex-1" />;
	const number = side === "left" ? line.leftNumber : line.rightNumber;
	return (
		<div className={cn("flex min-w-0 flex-1", lineBg(line.type))}>
			<span className={gutter}>{number ?? ""}</span>
			<span className={content}>
				<Segments segments={line.segments} type={line.type} />
			</span>
		</div>
	);
}

function SplitRow({ row }: { row: DiffRow }) {
	return (
		<div className="flex items-stretch">
			<SplitCell line={row.left} side="left" />
			<div className="bg-border w-px shrink-0" />
			<SplitCell line={row.right} side="right" />
		</div>
	);
}

function OptionSwitch({
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
		// Trailing switch, tightly grouped — see the toggle-placement house style.
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

export function DiffChecker() {
	const [original, setOriginal] = useState("");
	const [changed, setChanged] = useState("");
	const [view, setView] = useState<ViewMode>("split");
	const [options, setOptions] = useState<DiffOptions>(DEFAULT_OPTIONS);

	// Derive from deferred copies so typing/pasting stays responsive on large
	// inputs; `isStale` dims the output while it catches up. (Offline PWA — all
	// diffing is client-side.)
	const deferredOriginal = useDeferredValue(original);
	const deferredChanged = useDeferredValue(changed);
	const result = useMemo(
		() => diffText(deferredOriginal, deferredChanged, options),
		[deferredOriginal, deferredChanged, options],
	);
	const isStale =
		deferredOriginal !== original || deferredChanged !== changed;

	function setOption<K extends keyof DiffOptions>(
		key: K,
		value: DiffOptions[K],
	) {
		setOptions((prev) => ({ ...prev, [key]: value }));
	}

	function loadExample() {
		setOriginal(SAMPLE_ORIGINAL);
		setChanged(SAMPLE_CHANGED);
	}

	function clearAll() {
		setOriginal("");
		setChanged("");
	}

	function swap() {
		setOriginal(changed);
		setChanged(original);
	}

	async function handleCopy() {
		if (result.empty || result.identical) {
			toast.info("Nothing to copy yet.");
			return;
		}
		try {
			await navigator.clipboard.writeText(toUnifiedText(result));
			toast.success("Copied diff to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	const hasContent = !result.empty;

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}>
						<TabsList>
							<TabsTrigger value="split">Side by side</TabsTrigger>
							<TabsTrigger value="unified">Inline</TabsTrigger>
						</TabsList>
					</Tabs>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
						<OptionSwitch
							id="ignore-case"
							label="Ignore case"
							hint="Treat text that differs only in letter case as unchanged."
							checked={options.ignoreCase}
							onCheckedChange={(value) => setOption("ignoreCase", value)}
						/>
						<OptionSwitch
							id="ignore-whitespace"
							label="Ignore whitespace"
							hint="Ignore indentation and spacing differences between lines."
							checked={options.ignoreWhitespace}
							onCheckedChange={(value) => setOption("ignoreWhitespace", value)}
						/>
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-2">
				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<h2 className="text-sm font-medium">Original</h2>
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" onClick={loadExample}>
								<SparklesIcon className="size-4" />
								Example
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={swap}
								disabled={!original && !changed}
							>
								<ArrowLeftRightIcon className="size-4" />
								Swap
							</Button>
						</div>
					</header>
					<Textarea
						value={original}
						onChange={(event) => setOriginal(event.target.value)}
						placeholder="Paste the original text here…"
						spellCheck={false}
						className="min-h-64 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
				</section>

				<section className="bg-card flex flex-col rounded-xl border">
					<header className="flex items-center justify-between gap-2 border-b p-3">
						<h2 className="text-sm font-medium">Changed</h2>
						<Button
							variant="ghost"
							size="sm"
							onClick={clearAll}
							disabled={!original && !changed}
						>
							<Trash2Icon className="size-4" />
							Clear
						</Button>
					</header>
					<Textarea
						value={changed}
						onChange={(event) => setChanged(event.target.value)}
						placeholder="Paste the changed text here…"
						spellCheck={false}
						className="min-h-64 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
					/>
				</section>
			</div>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<div className="flex items-center gap-2">
						<h2 className="text-sm font-medium">Differences</h2>
						{isStale && hasContent ? (
							<Badge variant="secondary" className="text-muted-foreground">
								Comparing…
							</Badge>
						) : result.empty ? null : result.identical ? (
							<Badge variant="secondary">Identical</Badge>
						) : (
							<div className="flex items-center gap-1.5 text-xs font-medium tabular-nums">
								<span className="text-emerald-600 dark:text-emerald-400">
									+{result.additions}
								</span>
								<span className="text-red-600 dark:text-red-400">
									−{result.deletions}
								</span>
							</div>
						)}
					</div>
					<Button
						size="sm"
						onClick={handleCopy}
						disabled={result.empty || result.identical}
					>
						<CopyIcon className="size-4" />
						Copy diff
					</Button>
				</header>

				{result.empty ? (
					<p className="text-muted-foreground p-6 text-center text-sm">
						Paste text into both panes to see the differences.
					</p>
				) : result.identical ? (
					<p className="text-muted-foreground p-6 text-center text-sm">
						The two texts are identical
						{options.ignoreCase || options.ignoreWhitespace
							? " under the current options"
							: ""}
						.
					</p>
				) : (
					<div
						className={cn(
							"max-h-[36rem] overflow-auto text-sm leading-relaxed transition-opacity",
							isStale && "opacity-50",
						)}
					>
						{view === "split"
							? result.rows.map((row, index) => (
									<SplitRow key={index} row={row} />
								))
							: result.unified.map((line, index) => (
									<UnifiedLine key={index} line={line} />
								))}
					</div>
				)}
			</section>
		</div>
	);
}
