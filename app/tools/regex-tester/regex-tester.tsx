import { useDeferredValue, useMemo, useRef, useState } from "react";
import { SparklesIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buildSegments, runRegex } from "./transform";

const SAMPLE_PATTERN = "(?<word>\\w+)@(\\w+)\\.\\w+";
const SAMPLE_FLAGS = "gi";
const SAMPLE_TEXT = [
	"Reach us at Support@Whittle.tools or hello@example.com.",
	"Ignore not-an-email and this.one@sub.domain.dev too.",
].join("\n");

/** The standard JS regex flags, with a short description of each. */
const FLAGS: { flag: string; label: string; hint: string }[] = [
	{ flag: "g", label: "g", hint: "Global — find all matches, not just the first." },
	{ flag: "i", label: "i", hint: "Ignore case." },
	{ flag: "m", label: "m", hint: "Multiline — ^ and $ match line breaks." },
	{ flag: "s", label: "s", hint: "Dotall — . matches newlines." },
	{ flag: "u", label: "u", hint: "Unicode — treat the pattern as Unicode code points." },
	{ flag: "y", label: "y", hint: "Sticky — match only from lastIndex." },
];

// Shared typography so the highlight backdrop lines up exactly with the textarea.
const EDITOR_TYPOGRAPHY =
	"p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words";

export function RegexTester() {
	const [pattern, setPattern] = useState("");
	const [flags, setFlags] = useState("g");
	const [text, setText] = useState("");
	const backdropRef = useRef<HTMLDivElement>(null);

	const deferredText = useDeferredValue(text);
	const deferredPattern = useDeferredValue(pattern);
	const result = useMemo(
		() => runRegex(deferredPattern, flags, deferredText),
		[deferredPattern, flags, deferredText],
	);
	const segments = useMemo(
		() => buildSegments(deferredText, result.matches),
		[deferredText, result.matches],
	);
	const isStale = deferredText !== text || deferredPattern !== pattern;

	function toggleFlag(flag: string) {
		setFlags((prev) =>
			prev.includes(flag) ? prev.replace(flag, "") : prev + flag,
		);
	}

	function loadExample() {
		setPattern(SAMPLE_PATTERN);
		setFlags(SAMPLE_FLAGS);
		setText(SAMPLE_TEXT);
	}

	function clearAll() {
		setPattern("");
		setText("");
	}

	// Keep the highlight layer scrolled in lockstep with the textarea.
	function syncScroll(event: React.UIEvent<HTMLTextAreaElement>) {
		const el = backdropRef.current;
		if (!el) return;
		el.scrollTop = event.currentTarget.scrollTop;
		el.scrollLeft = event.currentTarget.scrollLeft;
	}

	const hasError = result.error !== null;
	const matchCount = result.matches.length;

	return (
		<div className="space-y-6">
			<section className="bg-card space-y-4 rounded-xl border p-4 sm:p-5">
				<div className="space-y-1.5">
					<Label htmlFor="pattern">Pattern</Label>
					<div className="flex items-stretch gap-2">
						<div className="bg-muted text-muted-foreground flex items-center rounded-md border px-2 font-mono text-sm">
							/
						</div>
						<Input
							id="pattern"
							value={pattern}
							onChange={(event) => setPattern(event.target.value)}
							placeholder="\d{4}-\d{2}-\d{2}"
							spellCheck={false}
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							className={cn(
								"flex-1 font-mono",
								hasError && "border-destructive focus-visible:ring-destructive/40",
							)}
						/>
						<div className="bg-muted text-muted-foreground flex items-center rounded-md border px-2 font-mono text-sm">
							/{flags}
						</div>
					</div>
					{hasError ? (
						<p className="text-destructive flex items-center gap-1.5 text-xs">
							<TriangleAlertIcon className="size-3.5 shrink-0" />
							{result.error}
						</p>
					) : null}
				</div>

				<div className="space-y-1.5">
					<Label>Flags</Label>
					<div className="flex flex-wrap gap-1.5">
						{FLAGS.map(({ flag, label, hint }) => {
							const active = flags.includes(flag);
							return (
								<Tooltip key={flag}>
									<TooltipTrigger asChild>
										<Button
											type="button"
											variant={active ? "default" : "outline"}
											size="sm"
											className="w-9 font-mono"
											aria-pressed={active}
											onClick={() => toggleFlag(flag)}
										>
											{label}
										</Button>
									</TooltipTrigger>
									<TooltipContent className="max-w-56">{hint}</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>
			</section>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<div className="flex items-center gap-2">
						<h2 className="text-sm font-medium">Test string</h2>
						{pattern && !hasError ? (
							<Badge
								variant="secondary"
								className={cn("tabular-nums", isStale && "opacity-50")}
							>
								{matchCount} {matchCount === 1 ? "match" : "matches"}
							</Badge>
						) : null}
					</div>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={loadExample}>
							<SparklesIcon className="size-4" />
							Example
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={clearAll}
							disabled={!pattern && !text}
						>
							<Trash2Icon className="size-4" />
							Clear
						</Button>
					</div>
				</header>

				{/* Highlight backdrop + transparent textarea share identical typography
				    so matched ranges render exactly under the user's text. */}
				<div className="relative">
					<div
						ref={backdropRef}
						aria-hidden
						className={cn(
							EDITOR_TYPOGRAPHY,
							"pointer-events-none absolute inset-0 overflow-auto text-transparent transition-opacity",
							isStale && "opacity-50",
						)}
					>
						{segments.map((segment, index) =>
							segment.match ? (
								<mark
									key={index}
									className="rounded bg-amber-300/50 text-transparent dark:bg-amber-400/30"
								>
									{segment.text}
								</mark>
							) : (
								<span key={index}>{segment.text}</span>
							),
						)}
						{/* Trailing newline needs a spacer line to match the textarea. */}
						{deferredText.endsWith("\n") ? "\n" : null}
					</div>
					<textarea
						value={text}
						onChange={(event) => setText(event.target.value)}
						onScroll={syncScroll}
						placeholder="Paste the text you want to match against…"
						spellCheck={false}
						className={cn(
							EDITOR_TYPOGRAPHY,
							"caret-foreground text-foreground placeholder:text-muted-foreground relative min-h-64 w-full resize-y border-0 bg-transparent shadow-none outline-none",
						)}
					/>
				</div>
			</section>

			{pattern && !hasError ? (
				<section className="bg-card rounded-xl border">
					<header className="border-b p-3">
						<h2 className="text-sm font-medium">Matches</h2>
					</header>
					{matchCount === 0 ? (
						<p className="text-muted-foreground p-6 text-center text-sm">
							No matches yet. Adjust the pattern or test string.
						</p>
					) : (
						<ul className="divide-y">
							{result.matches.map((match, index) => {
								const named = Object.entries(match.namedGroups).filter(
									([, value]) => value !== undefined,
								);
								return (
									<li
										key={index}
										className="flex flex-col gap-2 p-3 sm:flex-row sm:items-baseline sm:gap-3"
									>
										<span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
											#{index + 1} @{match.index}
										</span>
										<div className="min-w-0 flex-1 space-y-1.5">
											<code className="bg-amber-300/30 dark:bg-amber-400/20 rounded px-1 py-0.5 font-mono text-sm break-all">
												{match.value || "(empty match)"}
											</code>
											{match.groups.length > 0 || named.length > 0 ? (
												<div className="flex flex-wrap gap-1.5">
													{match.groups.map((group, gi) => (
														<Badge
															key={`g${gi}`}
															variant="outline"
															className="font-mono font-normal"
														>
															<span className="text-muted-foreground">${gi + 1}</span>{" "}
															{group === undefined ? "∅" : group || "‹empty›"}
														</Badge>
													))}
													{named.map(([name, value]) => (
														<Badge
															key={`n${name}`}
															variant="outline"
															className="font-mono font-normal"
														>
															<span className="text-muted-foreground">{name}</span>{" "}
															{value || "‹empty›"}
														</Badge>
													))}
												</div>
											) : null}
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</section>
			) : null}
		</div>
	);
}
