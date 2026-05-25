import { useEffect } from 'react';
import { useTimer } from './useTimer';

export function useExamTimer(
  durationMinutes: number,
  running: boolean,
  onExpire?: () => void,
  initialElapsed: number = 0,
) {
  const initialSeconds = durationMinutes * 60;
  const timer = useTimer(initialSeconds, running, initialElapsed);

  useEffect(() => {
    if (timer.isExpired && running && onExpire) {
      onExpire();
    }
  }, [timer.isExpired, running, onExpire]);

  // Warning when remaining time is less than or equal to 5 minutes (300 seconds)
  const isWarning = timer.remaining <= 300;

  return {
    elapsed: timer.elapsed,
    remaining: timer.remaining,
    display: timer.display,
    isExpired: timer.isExpired,
    isWarning,
    reset: timer.reset,
  };
}
