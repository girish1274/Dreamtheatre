import React from 'react';
import { StyleCard } from './StyleCard';
import type { AnimationStyle } from '../../types';

const styles = [
  { id: 'watercolor' as const, name: 'Watercolor', description: 'Flowing, ethereal watercolor animation' },
  { id: 'claymation' as const, name: 'Claymation', description: 'Charming, tactile clay-like animation' },
  { id: 'cyberpunk' as const, name: 'Cyberpunk', description: 'Neon-soaked futuristic visuals' },
  { id: 'hand-drawn' as const, name: 'Hand-drawn', description: 'Traditional hand-drawn animation style' },
];

interface StyleSelectorProps {
  onSelect: (style: AnimationStyle) => void;
}

export function StyleSelector({ onSelect }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {styles.map((style) => (
        <StyleCard key={style.id} {...style} onSelect={onSelect} />
      ))}
    </div>
  );
}