import { useDeferredValue, useMemo, useState } from "react";
import {
	CopyIcon,
	ShieldAlertIcon,
	SparklesIcon,
	Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { decodeJwt } from "./transform";

// A throwaway HS256 token (signed with "secret") — decodes but isn't verified.
const SAMPLE =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
	".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9" +
	".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function formatTime(seconds: number): string {
	return new Date(seconds * 1000).toLocaleString();
}

function JsonBlock({ title, json }: { title: string; json: string }) {
	return (
		<section className="bg-card flex min-w-0 flex-col rounded-xl border">
			<header className="border-b p-3">
				<h2 className="text-sm font-medium">{title}</h2>
			</header>
			<pre className="min-h-32 overflow-auto p-3 font-mono text-sm">{json}</pre>
		</section>
	);
}

export function JwtDecoder() {
	const [input, setInput] = useState("");

	const deferredInput = useDeferredValue(input);
	const result = useMemo(() => decodeJwt(deferredInput), [deferredInput]);
	const isStale = deferredInput !== input;

	const hasInput = input.trim() !== "";
	const showError = hasInput && !result.ok && !isStale;
	const decoded = result.ok && result.payload !== undefined;

	const now = Date.now();
	const expired = result.exp !== undefined && result.exp * 1000 < now;
	const notYetValid = result.nbf !== undefined && result.nbf * 1000 > now;

	async function copyPayload() {
		if (!result.payload) return;
		try {
			await navigator.clipboard.writeText(result.payload);
			toast.success("Copied payload to clipboard");
		} catch {
			toast.error("Couldn't access the clipboard");
		}
	}

	return (
		<div className="space-y-6">
			<section className="bg-card flex flex-col rounded-xl border">
				<header className="flex items-center justify-between gap-2 border-b p-3">
					<h2 className="text-sm font-medium">JWT</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setInput(SAMPLE)}
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
					placeholder="Paste a JSON Web Token (header.payload.signature)…"
					spellCheck={false}
					className={cn(
						"min-h-28 resize-y rounded-none border-0 font-mono text-sm break-all shadow-none focus-visible:ring-0",
					)}
				/>
				{showError ? (
					<div className="text-destructive border-t px-3 py-2 text-sm">
						{result.error}
					</div>
				) : null}
			</section>

			{decoded ? (
				<div className={cn("space-y-6 transition-opacity", isStale && "opacity-50")}>
					<div className="flex flex-wrap items-center gap-2">
						{expired ? (
							<Badge variant="destructive">Expired</Badge>
						) : result.exp !== undefined ? (
							<Badge className="bg-emerald-600 text-white dark:bg-emerald-500">
								Valid
							</Badge>
						) : null}
						{notYetValid ? <Badge variant="secondary">Not yet valid</Badge> : null}
						{result.iat !== undefined ? (
							<span className="text-muted-foreground text-xs">
								Issued {formatTime(result.iat)}
							</span>
						) : null}
						{result.exp !== undefined ? (
							<span className="text-muted-foreground text-xs">
								{expired ? "Expired" : "Expires"} {formatTime(result.exp)}
							</span>
						) : null}
						{result.nbf !== undefined ? (
							<span className="text-muted-foreground text-xs">
								Not before {formatTime(result.nbf)}
							</span>
						) : null}
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<JsonBlock title="Header" json={result.header ?? ""} />
						<section className="bg-card flex min-w-0 flex-col rounded-xl border">
							<header className="flex items-center justify-between gap-2 border-b p-3">
								<h2 className="text-sm font-medium">Payload</h2>
								<Button size="sm" onClick={copyPayload}>
									<CopyIcon className="size-4" />
									Copy
								</Button>
							</header>
							<pre className="min-h-32 overflow-auto p-3 font-mono text-sm">
								{result.payload}
							</pre>
						</section>
					</div>

					<section className="bg-card flex flex-col rounded-xl border">
						<header className="border-b p-3">
							<h2 className="text-sm font-medium">Signature</h2>
						</header>
						<div className="space-y-3 p-3">
							<p className="font-mono text-sm break-all">
								{result.signature || (
									<span className="text-muted-foreground">
										(no signature segment)
									</span>
								)}
							</p>
							<p className="text-muted-foreground flex items-center gap-1.5 text-xs">
								<ShieldAlertIcon className="size-3.5 shrink-0" />
								The signature is not verified — that requires the signing secret
								or key, which never leaves this page.
							</p>
						</div>
					</section>
				</div>
			) : null}
		</div>
	);
}
