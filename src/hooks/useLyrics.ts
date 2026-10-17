import { useCallback, useEffect, useRef, useState } from "react";
import { LoadOptions, LyricsState, loadLyrics } from "../services/lyrics";

/**
 * Loads lyrics for the active track as soon as it changes, so the
 * collapsed drawer can already show the current line before it's opened.
 * A request counter discards results that arrive after the track changed.
 * Duration is read from a ref so a late-arriving duration doesn't
 * trigger a second lookup for the same song.
 */
export function useLyrics(trackId: string | undefined, title: string, durationSec: number) {
  const [state, setState] = useState<LyricsState>({ status: "loading" });
  const requestRef = useRef(0);
  const durationRef = useRef(durationSec);
  durationRef.current = durationSec;

  const run = useCallback(
    async (options: LoadOptions = {}) => {
      if (!trackId) return;
      const request = ++requestRef.current;
      setState({ status: "loading" });
      const result = await loadLyrics(trackId, title, durationRef.current, options);
      if (request === requestRef.current) setState(result);
    },
    [trackId, title]
  );

  useEffect(() => {
    run();
  }, [run]);

  return { state, retry: run };
}
