import React, { useState } from 'react';
import { DreamTextArea } from './DreamTextArea';
import { KeywordInput } from './KeywordInput';
import { EmotionPicker } from './EmotionPicker';
import { StyleSelector } from './StyleSelector';
import { RecordButton } from './RecordButton';
import { DreamProgress } from './DreamProgress';
import { DreamPreview } from './DreamPreview';
import { useDreamRecording } from '../../hooks/useDreamRecording';
import { useKeywords } from '../../hooks/useKeywords';
import { useDreamGeneration } from '../../hooks/useDreamGeneration';
import type { AnimationStyle } from '../../types';

export function DreamForm() {
  const [dreamText, setDreamText] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<AnimationStyle>();
  
  const { isRecording, toggleRecording } = useDreamRecording();
  const { keywords, addKeyword, removeKeyword } = useKeywords();
  const { status, progress, result, generateDream } = useDreamGeneration();

  const handleSubmit = async () => {
    if (!dreamText || !selectedStyle) return;
    
    await generateDream(dreamText, selectedEmotions, selectedStyle);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <RecordButton isRecording={isRecording} onClick={toggleRecording} />
          <div className="flex-1">
            <DreamTextArea value={dreamText} onChange={setDreamText} />
          </div>
        </div>

        <KeywordInput
          keywords={keywords}
          onAdd={addKeyword}
          onRemove={removeKeyword}
        />

        <EmotionPicker
          selectedEmotions={selectedEmotions}
          onSelect={(emotion) => {
            setSelectedEmotions((prev) =>
              prev.includes(emotion)
                ? prev.filter((e) => e !== emotion)
                : [...prev, emotion]
            );
          }}
        />

        <StyleSelector onSelect={setSelectedStyle} />
      </div>

      {status !== 'idle' && status !== 'complete' && (
        <DreamProgress status={status} progress={progress} />
      )}

      {result && (
        <DreamPreview
          dream={result}
          onAdjust={(adjustments) => {
            // Handle adjustments
            console.log('Adjustments:', adjustments);
          }}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={!dreamText || !selectedStyle || status !== 'idle'}
        className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 
                 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
      >
        Generate Dream Movie
      </button>
    </div>
  );
}