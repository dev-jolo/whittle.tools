import { useDeferredValue, useMemo, useState } from "react";
import { SparklesIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { countText, formatReadingTime, type TextStats } from "./transform";

const SAMPLE = [
	"The quick brown fox jumps over the lazy dog.",
	"",
	"Pack my box with five dozen liquor jugs — a classic pangram used to show",
	"every letter of the alphabet in a short paragraph.",
].join("\n");

function StatCard({
	label,
	value,
	stale,
}: {
	label: string;
	value: string | number;
	stale: boolean;
}) {
	return (
		<div className="bg-card rounded-xl border p-4">
			<div
				className={cn(
					"text-2xl font-semibold tabular-nums transition-opacity sm:text-3xl",
					stale && "opacity-50",
				)}
			>
				{value}
			</div>
			<div className="text-muted-foreground mt-1 text-xs">{label}</div>
		</div>
	);
}

export function CharCounter() {
	const [input, setInput] = useState("");

	const deferredInput = useDeferredValue(input);
	const stats = useMemo(() => countText(deferredInput), [deferredInput]);
	const isStale = deferredInput !== input;

	const cards: { label: string; value: string | number }[] = [
		{ label: "Characters", value: stats.characters.toLocaleString() },
		{
			label: "Characters (no spaces)",
			value: stats.charactersNoSpaces.toLocaleString(),
		},
		{ label: "Words", value: stats.words.toLocaleString() },
		{ label: "Sentences", value: stats.sentences.toLocaleString() },
		{ label: "Lines", value: stats.lines.toLocaleString() },
		{ label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
		{ label: "Reading time", value: formatReadingTime(stats.readingTimeSeconds) },
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{cards.map((card) => (
					<StatCard
						key={card.label}
						label={card.label}
						value={card.value}
						stale={isStale}
					/>
				))}
			</div>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">Text</h2>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)}>
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
					placeholder="Type or paste your text here…"
					spellCheck={false}
					className="min-h-72 resize-y rounded-none border-0 text-sm shadow-none focus-visible:ring-0"
				/>
			</section>
		</div>
	);
}
