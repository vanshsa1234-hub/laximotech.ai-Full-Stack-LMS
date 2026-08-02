import { useEffect, useState } from 'react';

export interface AlgoStepBase {
  pseudoLine: number;
  note: string;
  error?: string;
  commit?: unknown;
}

/**
 * Headless controller for step-by-step algorithm walkthroughs.
 * Owns only playback position/state — the actual `steps` array is created
 * and owned by the visualizer (via its own build*Steps() function), so this
 * hook works identically for Linked List, Stack, Queue, or anything else
 * that produces an array of steps shaped like AlgoStepBase.
 */
export function useAlgorithmPlayer<T extends AlgoStepBase>(
  steps: T[] | null,
  onFinish: (lastStep: T) => void,
  stepDelayMs = 1000,
) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Whenever a fresh steps array arrives, jump to the start and auto-play.
  useEffect(() => {
    if (steps) {
      setStepIdx(0);
      setPlaying(true);
    }
  }, [steps]);

  const isLast = steps ? stepIdx === steps.length - 1 : false;

  useEffect(() => {
    if (!playing || !steps) return;
    if (isLast) {
      const t = setTimeout(() => {
        onFinish(steps[steps.length - 1]);
        setPlaying(false);
      }, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), stepDelayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, stepIdx, steps]);

  return {
    step: steps ? steps[stepIdx] : null,
    stepIdx,
    total: steps?.length ?? 0,
    isLast,
    playing,
    togglePlay: () => setPlaying(p => !p),
    pause: () => setPlaying(false),
    next: () => { setPlaying(false); setStepIdx(i => Math.min((steps?.length ?? 1) - 1, i + 1)); },
    prev: () => { setPlaying(false); setStepIdx(i => Math.max(0, i - 1)); },
    finishNow: () => { if (steps) onFinish(steps[steps.length - 1]); },
  };
}