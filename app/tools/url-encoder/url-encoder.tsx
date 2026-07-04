import { useDeferredValue, useMemo, useState } from "react";

import {
	type CodecMode,
	CodecPanel,
	ToggleField,
} from "../shared/codec-panel";
import { DEFAULT_OPTIONS, urlCodec } from "./transform";

const SAMPLE = "name=Ada Lovelace & Co? price=£100";

export function UrlEncoder() {
	const [mode, setMode] = useState<CodecMode>("encode");
	const [input, setInput] = useState("");
	const [wholeUrl, setWholeUrl] = useState(false);

	const deferredInput = useDeferredValue(input);
	const result = useMemo(
		() => urlCodec(deferredInput, mode, { wholeUrl }),
		[deferredInput, mode, wholeUrl],
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
					? "Type or paste text to encode…"
					: "Paste a percent-encoded string to decode…"
			}
			options={
				<ToggleField
					id="whole-url"
					label="Whole URL"
					hint="Keep :/?&= and other reserved characters intact (encodeURI) instead of escaping everything."
					checked={wholeUrl}
					onCheckedChange={setWholeUrl}
				/>
			}
		/>
	);
}
