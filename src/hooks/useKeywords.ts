import { useState, useCallback } from 'react';

export function useKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);

  const addKeyword = useCallback((keyword: string) => {
    setKeywords((prev) => [...prev, keyword]);
  }, []);

  const removeKeyword = useCallback((index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    keywords,
    addKeyword,
    removeKeyword,
  };
}