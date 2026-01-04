import { useState, useCallback, useRef, useEffect } from 'react';

interface HeadlineScore {
  overall_score: number;
  length_score: number;
  readability_score: number;
  power_words_score: number;
  issues: string[];
  suggestions: string[];
}

export function useHeadlineScore(debounceMs: number = 300) {
  const [score, setScore] = useState<HeadlineScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scoreHeadline = useCallback(async (text: string, niche?: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't score empty text
    if (!text.trim()) {
      setScore(null);
      return;
    }

    // Debounce
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/headline/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, niche }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to score headline');
        }

        const data = await response.json();
        setScore(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { score, isLoading, error, scoreHeadline };
}
