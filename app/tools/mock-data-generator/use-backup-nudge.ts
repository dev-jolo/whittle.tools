import { useEffect, useRef, useState } from "react";

// Timing tuned per autosave/UX guidance: a backup *reminder* is heavier than a
// silent save, so it fires far less often and never mid-edit. See the tool's
// notes — silent autosave is ~1s; this reminder is capped to once per 90s.
const NUDGE_INTERVAL_MS = 90_000;
const PAUSE_MS = 3_000; // wait for the user to stop typing before nudging
const PULSE_MS = 6_000; // how long the attention pulse stays on

/**
 * Drives a gentle, periodic "back up your schema" nudge. Returns whether the
 * Export button should currently pulse. Only nudges when there are unsaved-to-
 * file changes (`dirty`), the user has paused editing, and at most once every
 * interval. Fully inert when `enabled` is false.
 */
export function useBackupNudge({
	dirty,
	changeKey,
	enabled,
}: {
	dirty: boolean;
	/** Changes whenever the schema is edited, so we can detect pauses. */
	changeKey: string;
	enabled: boolean;
}): boolean {
	const [nudging, setNudging] = useState(false);
	const dirtyRef = useRef(dirty);
	const lastChangeRef = useRef(Date.now());
	const lastNudgeRef = useRef(0);

	// Record edit time and, on the clean → dirty transition, arm the timer so
	// the first nudge is a full interval away rather than immediate.
	useEffect(() => {
		lastChangeRef.current = Date.now();
		if (dirty && !dirtyRef.current) lastNudgeRef.current = Date.now();
		dirtyRef.current = dirty;
		if (!dirty) setNudging(false);
	}, [changeKey, dirty]);

	useEffect(() => {
		if (!enabled) {
			setNudging(false);
			return;
		}
		const timer = setInterval(() => {
			if (!dirtyRef.current) return;
			const now = Date.now();
			if (now - lastChangeRef.current < PAUSE_MS) return; // still editing
			if (now - lastNudgeRef.current < NUDGE_INTERVAL_MS) return;
			lastNudgeRef.current = now;
			setNudging(true);
			window.setTimeout(() => setNudging(false), PULSE_MS);
		}, 3_000);
		return () => clearInterval(timer);
	}, [enabled]);

	return nudging;
}
