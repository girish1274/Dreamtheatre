import React from 'react';
import { Brain, Palette, Clock } from 'lucide-react';
import type { DreamAnalysis } from '../../types';

interface DreamAnalysisViewProps {
  analysis: DreamAnalysis;
}

export function DreamAnalysisView({ analysis }: DreamAnalysisViewProps) {
  return (
    <div className="space-y-6 bg-white/5 rounded-lg p-6">
      <div className="flex items-center space-x-2">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-medium text-white">Dream Analysis</h3>
      </div>

      <div className="grid gap-4">
        {/* Dominant Themes */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Themes</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.dominantThemes.map((theme) => (
              <span
                key={theme}
                className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Palette className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-400">Suggested Palette</h4>
          </div>
          <div className="flex space-x-2">
            {analysis.suggestedPalette.map((color) => (
              <div
                key={color}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Mood Score */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-400">Mood Intensity</h4>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${analysis.moodScore * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}