import { useCallback, useEffect, useMemo, useState } from "react";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { ToggleField } from "../shared/codec-panel";
import {
	type UuidVersion,
	formatUuid,
	generateUuids,
} from "./transform";

export function UuidGenerator() {
	const [version, setVersion] = useState<UuidVersion>("v4");
	const [count, setCount] = useState(5);
	const [uppercase, setUppercase] = useState(false);
	const [hyphens, setHyphens] = useState(true);
	const [uuids, setUuids] = useState<string[]>([]);

	// Generate on the client (avoids SSR/hydration mismatch from randomness) and
	// whenever the version or count changes. Case/hyphens are display-only.
	const generate = useCallback(
		() => setUuids(generateUuids(version, count)),
		[version, count],
	);
	useEffect(() => {
		generate();
	}, [generate]);

	const text = useMemo(
		() => uuids.map((uuid) => formatUuid(uuid, { uppercase, hyphens })).join("\n"),
		[uuids, uppercase, hyphens],
	);

	async function handleCopy() {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success(uuids.length > 1 ? "Copied all UUIDs" : "Copied UUID");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card rounded-xl border p-4 sm:p-5">
				<h2 className="mb-4 text-sm font-medium">Options</h2>
				<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
					<div className="space-y-1.5">
						<Label htmlFor="uuid-version">Version</Label>
						<Select
							value={version}
							onValueChange={(value) => setVersion(value as UuidVersion)}
						>
							<SelectTrigger id="uuid-version" className="w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="v4">v4 (random)</SelectItem>
								<SelectItem value="v7">v7 (time-ordered)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="uuid-count">How many</Label>
						<Input
							id="uuid-count"
							type="number"
							min={1}
							max={1000}
							value={count}
							onChange={(event) => setCount(Number(event.target.value))}
							className="w-28"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:pb-2.5">
						<ToggleField
							id="uuid-uppercase"
							label="Uppercase"
							hint="Show the hex digits in uppercase."
							checked={uppercase}
							onCheckedChange={setUppercase}
						/>
						<ToggleField
							id="uuid-hyphens"
							label="Hyphens"
							hint="Keep the dashes between UUID groups."
							checked={hyphens}
							onCheckedChange={setHyphens}
						/>
					</div>
					<Button onClick={generate} className="sm:ml-auto">
						<RefreshCwIcon className="size-4" />
						Regenerate
					</Button>
				</div>
			</section>

			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">
						Result{uuids.length > 1 ? ` (${uuids.length})` : ""}
					</h2>
					<Button size="sm" onClick={handleCopy} disabled={!text}>
						<CopyIcon className="size-4" />
						Copy
					</Button>
				</header>
				<Textarea
					value={text}
					readOnly
					spellCheck={false}
					className="min-h-40 resize-y rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
				/>
			</section>
		</div>
	);
}
