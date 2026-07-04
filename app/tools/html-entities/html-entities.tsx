import { useDeferredValue, useMemo, useState } from "react";

import {
	type CodecMode,
	CodecPanel,
	ToggleField,
} from "../shared/codec-panel";
import { DEFAULT_OPTIONS, htmlEntities } from "./transform";

const SAMPLE = `<a href="page.html">Tom & Jerry © 2026</a>`;

export function HtmlEntities() {
	const [mode, setMode] = useState<CodecMode>("encode");
	const [input, setInput] = useState("");
	const [encodeNonAscii, setEncodeNonAscii] = useState(false);

	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => htmlEntities(deferredInput, mode, { encodeNonAscii }),
		[deferredInput, mode, encodeNonAscii],
	);
	const isStale = deferredInput !== input;

	return (
		<CodecPanel
			mode={mode}
			onModeChange={setMode}
			input={input}
			onInput={setInput}
			result={result}
			isStale={isStale}
			sample={SAMPLE}
			inputPlaceholder={
				mode === "encode"
					? "Type or paste text to escape…"
					: "Paste HTML with entities to decode…"
			}
			options={
				mode === "encode" ? (
					<ToggleField
						id="encode-non-ascii"
						label="Escape non-ASCII"
						hint="Also convert accented and non-Latin characters to numeric entities (e.g. é → &#233;)."
						checked={encodeNonAscii}
						onCheckedChange={setEncodeNonAscii}
					/>
				) : undefined
			}
		/>
	);
}
