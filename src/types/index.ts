import type { DreamAnalysis, DreamElement } from './dream';

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  content: string;
  emotions: string[];
  keywords: string[];
  style?: AnimationStyle;
  analysis?: DreamAnalysis;
  animation?: {
    frames: any[];
    style: string;
    duration: number;
  };
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type AnimationStyle = 'watercolor' | 'claymation' | 'cyberpunk' | 'hand-drawn';
export type AnimationStyle = 'realistic' | 'cinematic' | 'documentary' | 'anime' | 'ghibli' | 'manga' | 'watercolor' | 'claymation' | 'hand-drawn' | 'cyberpunk' | 'pixel-art' | 'digital-art' | 'fantasy' | 'sci-fi' | 'steampunk' | 'abstract' | 'surreal' | 'minimalist' | 'vintage' | 'film-noir' | '80s-retro';

export interface DreamPalette {
  name: string;
  mood: 'eerie' | 'whimsical' | 'romantic' | 'surreal';
  colors: string[];
}

export interface User {
  id: string;
  name: string;
  dreamCount: number;
  preferences: {
    defaultStyle: AnimationStyle;
    privateGallery: boolean;
  };
}

export type { DreamAnalysis, DreamElement };