import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds: number, running: boolean, initialElapsed: number = 0) {
  const [elapsed, setElapsed] = useState(initialElapsed);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialElapsed > 0) {
      setElapsed(initialElapsed);
      if (running) {
        startTimeRef.current = Date.now() - initialElapsed * 1000;
      }
    }
  }, [initialElapsed, running]);

  useEffect(() => {
    if (running) {
      // Capture wall-clock start, subtract already-elapsed to resume correctly
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const wallElapsed = Math.round((Date.now() - startTimeRef.current!) / 1000);
        setElapsed(wallElapsed);
      }, 500); // 500ms polling keeps display accurate without being costly
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const remaining = Math.max(0, initialSeconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return {
    elapsed,
    remaining,
    display: `${mm}:${ss}`,
    isExpired: remaining === 0,
    reset: () => setElapsed(initialElapsed),
  };
}
