import { useDeferredValue, useEffect, useState } from "react";
import { CopyIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ToggleField } from "../shared/codec-panel";
import {
	HASH_ALGORITHMS,
	type HashAlgorithm,
	computeHashes,
} from "./transform";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

function HashRow({ label, value }: { label: string; value: string }) {
	async function copy() {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`Copied ${label}`);
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}
	return (
		<div className="flex items-center gap-3 px-3 py-2">
			<span className="text-muted-foreground w-20 shrink-0 font-mono text-xs">
				{label}
			</span>
			<span className="min-w-0 flex-1 font-mono text-sm break-all">{value}</span>
			<Button
				variant="ghost"
				size="icon"
				className="size-7 shrink-0"
				onClick={copy}
				aria-label={`Copy ${label}`}
			>
				<CopyIcon className="size-3.5" />
			</Button>
		</div>
	);
}

export function HashGenerator() {
	const [input, setInput] = useState("");
	const [uppercase, setUppercase] = useState(false);
	const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(
		null,
	);

	const deferredInput = useDeferredValue(input);
	const hasInput = input.trim() !== "";
	const isStale = deferredInput !== input;

	useEffect(() => {
		let cancelled = false;
		computeHashes(deferredInput).then((result) => {
			if (!cancelled) setHashes(result);
		});
		return () => {
			cancelled = true;
		};
	}, [deferredInput]);

	return (
		<div className="space-y-6">
			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">Input</h2>
					<div className="flex items-center gap-3">
						<ToggleField
							id="hash-uppercase"
							label="Uppercase"
							hint="Show the hex digests in uppercase."
							checked={uppercase}
							onCheckedChange={setUppercase}
						/>
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
					placeholder="Type or paste text to hash…"
					spellCheck={false}
					className="min-h-28 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
				/>
			</section>

			{hasInput && hashes ? (
				<section
					className={cn(
						"bg-card divide-y rounded-xl border transition-opacity",
						isStale && "opacity-50",
					)}
				>
					{HASH_ALGORITHMS.map((algorithm) => (
						<HashRow
							key={algorithm}
							label={algorithm}
							value={
								uppercase
									? hashes[algorithm].toUpperCase()
									: hashes[algorithm]
							}
						/>
					))}
				</section>
			) : (
				<p className="text-muted-foreground bg-card rounded-xl border p-6 text-center text-sm">
					Type something to see its MD5, SHA-1, SHA-256, and SHA-512 hashes.
				</p>
			)}
		</div>
	);
}
