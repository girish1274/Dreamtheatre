export interface DreamElement {
  type: 'environment' | 'objects' | 'actions' | 'emotions';
  value: string;
  prominence: number;
}

export interface DreamAnalysis {
  elements: DreamElement[];
  dominantThemes: string[];
  suggestedPalette: string[];
  moodScore: number;
}

export interface DreamSequence {
  id: string;
  timestamp: number;
  duration: number;
  elements: DreamElement[];
  transitions: {
    from: string;
    to: string;
    duration: number;
  }[];
}

export interface DreamTimeline {
  sequences: DreamSequence[];
  totalDuration: number;
  transitions: number;
}