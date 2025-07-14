import { useState, useCallback } from 'react';
import type { DreamAnalysis, DreamTimeline, DreamSequence } from '../types';

export function useDreamTimeline(analysis: DreamAnalysis) {
  const [timeline, setTimeline] = useState<DreamTimeline>({
    sequences: [],
    totalDuration: 0,
    transitions: 0,
  });

  const generateTimeline = useCallback(() => {
    const sequences: DreamSequence[] = [];
    let currentTime = 0;

    // Create sequences based on dream elements
    analysis.elements.forEach((element, index) => {
      const sequence: DreamSequence = {
        id: `seq-${index}`,
        timestamp: currentTime,
        duration: 3000 + (element.prominence * 1000), // Base duration + prominence factor
        elements: [element],
        transitions: [],
      };

      // Add transition to next sequence if not last
      if (index < analysis.elements.length - 1) {
        sequence.transitions.push({
          from: element.value,
          to: analysis.elements[index + 1].value,
          duration: 1000, // Standard transition duration
        });
      }

      sequences.push(sequence);
      currentTime += sequence.duration;
    });

    setTimeline({
      sequences,
      totalDuration: currentTime,
      transitions: sequences.length - 1,
    });
  }, [analysis]);

  return {
    timeline,
    generateTimeline,
  };
}