import React, { useState } from 'react';
import { DreamTextArea } from './DreamTextArea';
import { KeywordInput } from './KeywordInput';
import { RecordButton } from './RecordButton';
import { useDreamRecording } from '../../hooks/useDreamRecording';
import { useKeywords } from '../../hooks/useKeywords';

export function DreamInput() {
  const [dreamText, setDreamText] = useState('');
  const { isRecording, toggleRecording } = useDreamRecording();
  const { keywords, addKeyword, removeKeyword } = useKeywords();

  return (
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
    </div>
  );
}