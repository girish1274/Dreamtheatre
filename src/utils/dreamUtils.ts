import type { Dream } from '../types';

export function generateDreamId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createDream(
  title: string,
  content: string,
  keywords: string[],
  emotions: string[] = []
): Dream {
  return {
    id: generateDreamId(),
    title,
    content,
    keywords,
    emotions,
    createdAt: new Date(),
    isRecurring: false,
  };
}