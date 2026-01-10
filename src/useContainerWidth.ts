import { useState, useEffect, useRef, useCallback } from 'react';

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T & { cancel: () => void };

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

export function useContainerWidth(resizeDebounce: number): {
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      const newWidth = containerRef.current.getBoundingClientRect().width;
      setWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateWidth();

    const debouncedUpdate = debounce(updateWidth, resizeDebounce);

    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdate();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      debouncedUpdate.cancel();
    };
  }, [updateWidth, resizeDebounce]);

  return { containerRef, width };
}
