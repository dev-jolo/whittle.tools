import type { Faker } from "@faker-js/faker";
import { useCallback, useMemo, useState } from "react";
import { CopyIcon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { FieldTypeCombobox } from "@/components/field-type-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getFieldType } from "@/lib/faker-fields";
import { useLazyModule } from "@/lib/use-lazy-module";
import { cn } from "@/lib/utils";

// Module-scope loader keeps its identity stable and pulls the English Faker
// locale only on this tool's page (dynamic import → separate lazy chunk).
const loadFaker = (): Promise<Faker> =>
	import("@faker-js/faker/locale/en").then((mod) => mod.faker);

export function FakeValue() {
	const [typeId, setTypeId] = useState("fullName");
	// Bumping the nonce rerolls the value without reseeding to the same result.
	const [nonce, setNonce] = useState(0);

	const loader = useCallback(loadFaker, []);
	const { module: faker, loading, error } = useLazyModule(loader);

	// `nonce` is in the dependency list so a reroll recomputes a fresh value.
	const value = useMemo(() => {
		if (!faker) return "";
		return String(getFieldType(typeId).generate(faker, 0));
	}, [faker, typeId, nonce]);

	async function handleCopy() {
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="mx-auto max-w-xl space-y-6">
			<section className="bg-card space-y-4 rounded-xl border p-4 sm:p-5">
				<div className="space-y-1.5">
					<Label htmlFor="value-type">Type</Label>
					<FieldTypeCombobox
						id="value-type"
						value={typeId}
						onChange={setTypeId}
						triggerClassName="w-full"
					/>
				</div>

				<div className="bg-muted/40 flex min-h-20 items-center justify-center rounded-lg border border-dashed p-4">
					{loading ? (
						<Badge variant="secondary" className="text-muted-foreground gap-1">
							<Loader2Icon className="size-3 animate-spin" />
							Loading…
						</Badge>
					) : error ? (
						<span className="text-destructive text-sm">
							Couldn't load the generator: {error}
						</span>
					) : (
						<code className="text-center font-mono text-lg break-all select-all sm:text-xl">
							{value}
						</code>
					)}
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						className="flex-1"
						onClick={() => setNonce((n) => n + 1)}
						disabled={!faker}
					>
						<RefreshCwIcon className="size-4" />
						Reroll
					</Button>
					<Button
						className="flex-1"
						onClick={handleCopy}
						disabled={!value}
					>
						<CopyIcon className="size-4" />
						Copy
					</Button>
				</div>
			</section>

			<p
				className={cn(
					"text-muted-foreground text-center text-xs",
					!faker && "opacity-0",
				)}
			>
				Realistic values via Faker — generated in your browser, never uploaded.
			</p>
		</div>
	);
}
