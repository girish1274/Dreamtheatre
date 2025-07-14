import { OpenAI } from 'openai';
import type { DreamAnalysis } from '../types/dreams.js';

export class DreamAnalyzer {
  constructor(private openai: OpenAI) {}

  async analyze(content: string): Promise<DreamAnalysis> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a dream analyst. Analyze the dream and extract key elements, themes, and emotions."
        },
        {
          role: "user",
          content
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content!) as DreamAnalysis;
    
    return {
      elements: analysis.elements,
      dominantThemes: analysis.dominantThemes,
      suggestedPalette: analysis.suggestedPalette,
      moodScore: analysis.moodScore,
    };
  }
}