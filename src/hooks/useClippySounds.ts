import { useCallback } from 'react';

// Sound functions disabled — Clippy uses visual animations only
export function useClippySounds() {
  const noop = useCallback(() => {}, []);
  return { playPop: noop, playTap: noop, playGreeting: noop, playClose: noop, playThinking: noop };
}
