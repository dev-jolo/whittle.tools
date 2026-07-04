import { useMemo, useState } from "react";
import { ClockIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	epochSeconds,
	formatInZone,
	parseTimestamp,
	relativeTime,
	toIso,
} from "./transform";

const ZONES: { value: string; label: string }[] = [
	{ value: "local", label: "Local time" },
	{ value: "UTC", label: "UTC" },
	{ value: "America/New_York", label: "New York" },
	{ value: "America/Chicago", label: "Chicago" },
	{ value: "America/Denver", label: "Denver" },
	{ value: "America/Los_Angeles", label: "Los Angeles" },
	{ value: "Europe/London", label: "London" },
	{ value: "Europe/Paris", label: "Paris / Berlin" },
	{ value: "Asia/Kolkata", label: "India" },
	{ value: "Asia/Shanghai", label: "China" },
	{ value: "Asia/Tokyo", label: "Tokyo" },
	{ value: "Asia/Manila", label: "Manila" },
	{ value: "Australia/Sydney", label: "Sydney" },
	{ value: "Pacific/Auckland", label: "Auckland" },
];

function resolveZone(zone: string): string {
	if (zone !== "local") return zone;
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function OutputRow({ label, value }: { label: string; value: string }) {
	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(`Copied ${label}`);
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}
	return (
		<div className="flex items-center gap-3 px-3 py-2">
			<span className="text-muted-foreground w-40 shrink-0 text-sm">{label}</span>
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

export function Timestamp() {
	const [input, setInput] = useState("");
	const [zone, setZone] = useState("local");

	const parsed = useMemo(() => parseTimestamp(input), [input]);
	const hasInput = input.trim() !== "";
	const epochMs = parsed.epochMs;

	const rows = useMemo(() => {
		if (epochMs === undefined) return null;
		const resolved = resolveZone(zone);
		return [
			{ label: "Unix (seconds)", value: String(epochSeconds(epochMs)) },
			{ label: "Unix (milliseconds)", value: String(epochMs) },
			{ label: "ISO 8601 (UTC)", value: toIso(epochMs) },
			{
				label: ZONES.find((z) => z.value === zone)?.label ?? resolved,
				value: `${formatInZone(epochMs, resolved)} (${resolved})`,
			},
			{ label: "Relative", value: relativeTime(epochMs, Date.now()) },
		];
	}, [epochMs, zone]);

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex-1 space-y-1.5">
						<Label htmlFor="ts-input">Timestamp or date</Label>
						<div className="flex gap-2">
							<Input
								id="ts-input"
								value={input}
								onChange={(event) => setInput(event.target.value)}
								placeholder="e.g. 1516239022 or 2026-07-04 14:30"
								spellCheck={false}
								className="font-mono"
							/>
							<Button
								variant="outline"
								onClick={() => setInput(String(Date.now()))}
							>
								<ClockIcon className="size-4" />
								Now
							</Button>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="ts-zone">Time zone</Label>
						<Select value={zone} onValueChange={setZone}>
							<SelectTrigger id="ts-zone" className="w-full sm:w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ZONES.map((z) => (
									<SelectItem key={z.value} value={z.value}>
										{z.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				{hasInput && parsed.detectedAs ? (
					<p className="text-muted-foreground mt-3 text-xs">
						Read as{" "}
						<Badge variant="secondary" className="align-middle">
							{parsed.detectedAs}
						</Badge>
					</p>
				) : null}
			</section>

			{rows ? (
				<section className="bg-card divide-y rounded-xl border">
					{rows.map((row) => (
						<OutputRow key={row.label} label={row.label} value={row.value} />
					))}
				</section>
			) : hasInput && !parsed.ok ? (
				<div className="text-destructive bg-card rounded-xl border p-4 text-sm">
					{parsed.error}
				</div>
			) : (
				<p className="text-muted-foreground bg-card rounded-xl border p-6 text-center text-sm">
					Enter a Unix timestamp or a date, or press{" "}
					<span className="font-medium">Now</span>, to see it every way.
				</p>
			)}
		</div>
	);
}
