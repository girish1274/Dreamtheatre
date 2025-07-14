import { useState, useCallback } from 'react';
import type { Dream, AnimationStyle, DreamAnalysis } from '../types';

interface DreamGenerationState {
  status: 'idle' | 'analyzing' | 'generating' | 'finalizing' | 'complete';
  progress: number;
  result: Dream | null;
}

export function useDreamGeneration() {
  const [state, setState] = useState<DreamGenerationState>({
    status: 'idle',
    progress: 0,
    result: null,
  });

  const generateDream = useCallback(async (
    content: string,
    emotions: string[],
    style: AnimationStyle
  ) => {
    setState({ status: 'analyzing', progress: 0, result: null });

    // Enhanced dream analysis with better content understanding
    await simulateProgress('analyzing', 2000);
    
    const analysis: DreamAnalysis = createAdvancedDreamAnalysis(content, emotions);
    
    // More sophisticated generation process
    await simulateProgress('generating', 3000);
    
    await simulateProgress('finalizing', 1000);

    // Create more accurate dream result
    setState({
      status: 'complete',
      progress: 100,
      result: {
        id: Date.now().toString(),
        title: generateIntelligentTitle(content, emotions),
        content,
        emotions,
        keywords: extractAdvancedKeywords(content),
        style,
        createdAt: new Date(),
        isRecurring: detectRecurringPattern(content),
        analysis
      },
    });
  }, []);

  const simulateProgress = async (status: DreamGenerationState['status'], duration: number) => {
    const steps = 20; // More granular progress updates
    const stepTime = duration / steps;
    
    for (let i = 0; i < steps; i++) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            status,
            progress: Math.min(((i + 1) / steps) * 100, 100),
          }));
          resolve();
        }, stepTime);
      });
    }
  };

  const createAdvancedDreamAnalysis = (content: string, emotions: string[]): DreamAnalysis => {
    const elements: DreamElement[] = [];
    const contentLower = content.toLowerCase();
    
    // Enhanced environment detection with context awareness
    const environmentPatterns = {
      'underwater': ['ocean', 'sea', 'underwater', 'swimming', 'diving', 'fish', 'coral'],
      'forest': ['forest', 'trees', 'woods', 'jungle', 'leaves', 'branches', 'nature'],
      'city': ['city', 'building', 'street', 'urban', 'skyscraper', 'traffic', 'crowd'],
      'mountains': ['mountain', 'peak', 'cliff', 'valley', 'hiking', 'summit', 'rocks'],
      'sky': ['sky', 'clouds', 'flying', 'floating', 'air', 'wind', 'birds'],
      'space': ['space', 'stars', 'planets', 'galaxy', 'universe', 'cosmic', 'void'],
      'house': ['house', 'home', 'room', 'bedroom', 'kitchen', 'living room', 'basement'],
      'school': ['school', 'classroom', 'teacher', 'students', 'desk', 'hallway', 'library'],
      'hospital': ['hospital', 'doctor', 'nurse', 'patient', 'medical', 'surgery', 'emergency'],
      'beach': ['beach', 'sand', 'waves', 'shore', 'sunset', 'seashells', 'tide']
    };
    
    // Detect environments with scoring
    Object.entries(environmentPatterns).forEach(([env, keywords]) => {
      const matches = keywords.filter(keyword => contentLower.includes(keyword));
      if (matches.length > 0) {
        const prominence = Math.min(matches.length * 0.3, 1.0);
        elements.push({ 
          type: 'environment', 
          value: env, 
          prominence 
        });
      }
    });
    
    // Enhanced object detection with symbolic meaning
    const objectPatterns = {
      'mirror': ['mirror', 'reflection', 'glass', 'looking glass'],
      'door': ['door', 'entrance', 'exit', 'doorway', 'portal'],
      'water': ['water', 'river', 'lake', 'pond', 'stream', 'rain'],
      'fire': ['fire', 'flame', 'burning', 'smoke', 'heat', 'light'],
      'car': ['car', 'vehicle', 'driving', 'road', 'highway', 'traffic'],
      'phone': ['phone', 'call', 'calling', 'telephone', 'mobile'],
      'book': ['book', 'reading', 'pages', 'story', 'words', 'text'],
      'stairs': ['stairs', 'steps', 'climbing', 'ascending', 'descending'],
      'bridge': ['bridge', 'crossing', 'over', 'connection', 'span'],
      'key': ['key', 'lock', 'unlock', 'open', 'access']
    };
    
    Object.entries(objectPatterns).forEach(([obj, keywords]) => {
      const matches = keywords.filter(keyword => contentLower.includes(keyword));
      if (matches.length > 0) {
        const prominence = Math.min(matches.length * 0.25, 0.8);
        elements.push({ 
          type: 'objects', 
          value: obj, 
          prominence 
        });
      }
    });
    
    // Enhanced action detection with emotional context
    const actionPatterns = {
      'flying': ['flying', 'soaring', 'floating', 'levitating', 'airborne'],
      'running': ['running', 'chasing', 'pursuing', 'sprinting', 'racing'],
      'falling': ['falling', 'dropping', 'plummeting', 'tumbling', 'descending'],
      'swimming': ['swimming', 'diving', 'floating', 'underwater', 'submerged'],
      'climbing': ['climbing', 'ascending', 'scaling', 'mounting', 'rising'],
      'searching': ['searching', 'looking', 'seeking', 'finding', 'hunting'],
      'hiding': ['hiding', 'concealing', 'escaping', 'avoiding', 'fleeing'],
      'dancing': ['dancing', 'moving', 'rhythm', 'music', 'celebration'],
      'fighting': ['fighting', 'battling', 'struggling', 'conflict', 'war'],
      'talking': ['talking', 'speaking', 'conversation', 'dialogue', 'communication']
    };
    
    Object.entries(actionPatterns).forEach(([action, keywords]) => {
      const matches = keywords.filter(keyword => contentLower.includes(keyword));
      if (matches.length > 0) {
        const prominence = Math.min(matches.length * 0.3, 0.9);
        elements.push({ 
          type: 'actions', 
          value: action, 
          prominence 
        });
      }
    });
    
    // Add emotion elements based on content analysis
    emotions.forEach(emotion => {
      elements.push({
        type: 'emotions',
        value: emotion,
        prominence: 0.7
      });
    });
    
    // Add default elements if none found
    if (elements.length === 0) {
      elements.push(
        { type: 'environment', value: 'surreal landscape', prominence: 0.8 },
        { type: 'objects', value: 'mysterious objects', prominence: 0.6 },
        { type: 'actions', value: 'wandering', prominence: 0.5 }
      );
    }
    
    // Calculate sophisticated mood score
    const moodScore = calculateAdvancedMoodScore(content, emotions, elements);
    
    // Generate contextual color palette
    const suggestedPalette = generateContextualColorPalette(moodScore, elements, emotions);
    
    // Extract sophisticated themes
    const dominantThemes = extractSophisticatedThemes(content, elements, emotions);
    
    return {
      elements,
      dominantThemes,
      suggestedPalette,
      moodScore
    };
  };

  const calculateAdvancedMoodScore = (content: string, emotions: string[], elements: DreamElement[]): number => {
    let score = 0.5; // neutral baseline
    let factors = 1;
    
    // Emotion-based scoring with weights
    const emotionWeights = {
      'joy': 0.8, 'happiness': 0.8, 'love': 0.7, 'peace': 0.6, 'excitement': 0.7,
      'fear': -0.6, 'anxiety': -0.5, 'terror': -0.8, 'sadness': -0.4, 'anger': -0.5,
      'mystery': 0.1, 'curiosity': 0.3, 'wonder': 0.4, 'confusion': -0.2
    };
    
    emotions.forEach(emotion => {
      const weight = emotionWeights[emotion.toLowerCase()] || 0;
      score += weight;
      factors += 1;
    });
    
    // Content-based mood indicators
    const positiveWords = ['beautiful', 'bright', 'warm', 'safe', 'happy', 'peaceful', 'wonderful', 'amazing'];
    const negativeWords = ['dark', 'scary', 'cold', 'dangerous', 'lost', 'trapped', 'broken', 'dead'];
    
    const contentLower = content.toLowerCase();
    positiveWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 0.2;
        factors += 0.5;
      }
    });
    
    negativeWords.forEach(word => {
      if (contentLower.includes(word)) {
        score -= 0.2;
        factors += 0.5;
      }
    });
    
    // Element-based mood adjustments
    elements.forEach(element => {
      const elementMoodImpact = {
        'flying': 0.3, 'dancing': 0.4, 'swimming': 0.2,
        'falling': -0.3, 'running': -0.1, 'hiding': -0.2,
        'fire': 0.1, 'water': 0.1, 'mirror': -0.1
      };
      
      const impact = elementMoodImpact[element.value] || 0;
      score += impact * element.prominence;
      factors += 0.3;
    });
    
    // Normalize score
    score = score / factors;
    return Math.max(0.1, Math.min(0.9, score));
  };

  const generateContextualColorPalette = (moodScore: number, elements: DreamElement[], emotions: string[]): string[] => {
    const palette: string[] = [];
    
    // Base palette based on mood
    if (moodScore > 0.7) {
      palette.push('#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4');
    } else if (moodScore > 0.4) {
      palette.push('#A8E6CF', '#DCEDC1', '#FFD3A5', '#FD9853', '#C7CEEA');
    } else {
      palette.push('#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7');
    }
    
    // Environment-specific colors
    const environmentColors = {
      'underwater': ['#006994', '#0099CC', '#66B2FF', '#99CCFF'],
      'forest': ['#228B22', '#32CD32', '#90EE90', '#98FB98'],
      'city': ['#708090', '#778899', '#B0C4DE', '#D3D3D3'],
      'space': ['#191970', '#4B0082', '#8A2BE2', '#9370DB'],
      'fire': ['#FF4500', '#FF6347', '#FF7F50', '#FFA500'],
      'sky': ['#87CEEB', '#87CEFA', '#B0E0E6', '#E0F6FF']
    };
    
    elements.forEach(element => {
      if (element.type === 'environment') {
        const colors = environmentColors[element.value];
        if (colors) {
          colors.forEach(color => palette.push(color));
        }
      }
    });
    
    // Emotion-based color adjustments
    const emotionColors = {
      'joy': ['#FFD700', '#FFA500', '#FF69B4'],
      'fear': ['#2F4F4F', '#696969', '#800000'],
      'peace': ['#B0E0E6', '#E6E6FA', '#F0F8FF'],
      'love': ['#FF69B4', '#FFB6C1', '#FFC0CB'],
      'mystery': ['#4B0082', '#663399', '#8A2BE2']
    };
    
    emotions.forEach(emotion => {
      const colors = emotionColors[emotion.toLowerCase()];
      if (colors) {
        colors.forEach(color => palette.push(color));
      }
    });
    
    // Return unique colors, limited to 6
    return [...new Set(palette)].slice(0, 6);
  };

  const extractSophisticatedThemes = (content: string, elements: DreamElement[], emotions: string[]): string[] => {
    const themes: string[] = [];
    const contentLower = content.toLowerCase();
    
    // Advanced theme detection patterns
    const themePatterns = {
      'transformation': {
        keywords: ['change', 'transform', 'different', 'becoming', 'turning into', 'metamorphosis'],
        elements: ['mirror', 'door', 'stairs'],
        emotions: ['mystery', 'fear', 'wonder']
      },
      'journey': {
        keywords: ['path', 'road', 'travel', 'journey', 'destination', 'walking', 'moving'],
        elements: ['bridge', 'car', 'stairs', 'door'],
        emotions: ['curiosity', 'excitement', 'anxiety']
      },
      'pursuit': {
        keywords: ['chase', 'follow', 'run', 'escape', 'flee', 'hunting', 'searching'],
        elements: ['running', 'hiding', 'car'],
        emotions: ['fear', 'anxiety', 'excitement']
      },
      'loss': {
        keywords: ['lost', 'missing', 'gone', 'disappear', 'vanish', 'forgotten'],
        elements: ['searching', 'crying', 'empty'],
        emotions: ['sadness', 'fear', 'anxiety']
      },
      'discovery': {
        keywords: ['find', 'discover', 'reveal', 'uncover', 'hidden', 'secret'],
        elements: ['door', 'key', 'book', 'light'],
        emotions: ['curiosity', 'wonder', 'excitement']
      },
      'freedom': {
        keywords: ['free', 'escape', 'liberate', 'break', 'open', 'release'],
        elements: ['flying', 'running', 'door', 'sky'],
        emotions: ['joy', 'relief', 'excitement']
      },
      'connection': {
        keywords: ['together', 'meet', 'friend', 'family', 'love', 'unite'],
        elements: ['talking', 'dancing', 'bridge'],
        emotions: ['love', 'joy', 'peace']
      },
      'conflict': {
        keywords: ['fight', 'battle', 'struggle', 'war', 'argue', 'compete'],
        elements: ['fighting', 'running', 'hiding'],
        emotions: ['anger', 'fear', 'anxiety']
      }
    };
    
    // Score each theme based on multiple factors
    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      let score = 0;
      
      // Check keywords in content
      pattern.keywords.forEach(keyword => {
        if (contentLower.includes(keyword)) {
          score += 1;
        }
      });
      
      // Check for relevant elements
      pattern.elements.forEach(elementValue => {
        const hasElement = elements.some(el => el.value === elementValue);
        if (hasElement) {
          score += 0.5;
        }
      });
      
      // Check for relevant emotions
      pattern.emotions.forEach(emotion => {
        if (emotions.includes(emotion)) {
          score += 0.7;
        }
      });
      
      // Add theme if score is significant
      if (score >= 1) {
        themes.push(theme);
      }
    });
    
    // Add default themes if none found
    if (themes.length === 0) {
      if (emotions.length > 0) {
        themes.push('emotional journey');
      } else {
        themes.push('mystery', 'exploration');
      }
    }
    
    return themes.slice(0, 4); // Limit to 4 most relevant themes
  };

  const extractAdvancedKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    
    // Enhanced stop words list
    const stopWords = new Set([
      'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'was', 'were', 
      'that', 'this', 'there', 'their', 'they', 'it', 'is', 'are', 'be', 'been', 
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'or', 'as', 'if', 
      'then', 'else', 'when', 'up', 'down', 'out', 'about', 'who', 'which', 'what', 
      'where', 'how', 'why', 'can', 'will', 'just', 'should', 'now', 'me', 'my', 
      'myself', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'hers'
    ]);
    
    // Extract meaningful words with frequency scoring
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });
    
    // Sort by frequency and relevance
    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
    
    return sortedWords.slice(0, 8); // Return top 8 keywords
  };

  const generateIntelligentTitle = (content: string, emotions: string[]): string => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    
    // Extract key phrases from first sentence
    const keyPhrases = extractKeyPhrases(firstSentence);
    
    if (keyPhrases.length > 0) {
      const mainPhrase = keyPhrases[0];
      return capitalizeTitle(mainPhrase);
    }
    
    // Fallback to emotion-based titles
    if (emotions.length > 0) {
      const primaryEmotion = emotions[0];
      const emotionTitles = {
        'joy': 'A Joyful Dream',
        'fear': 'The Dark Vision',
        'peace': 'Tranquil Moments',
        'mystery': 'The Unknown Path',
        'love': 'Dreams of Love',
        'anxiety': 'Restless Nights',
        'wonder': 'A Wondrous Journey',
        'excitement': 'The Great Adventure'
      };
      
      return emotionTitles[primaryEmotion] || 'My Dream Journey';
    }
    
    return 'Untitled Dream';
  };

  const extractKeyPhrases = (text: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    // Look for meaningful 2-3 word combinations
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
      if (twoWordPhrase.length > 6 && !twoWordPhrase.includes('was') && !twoWordPhrase.includes('were')) {
        phrases.push(twoWordPhrase);
      }
      
      if (i < words.length - 2) {
        const threeWordPhrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (threeWordPhrase.length > 10) {
          phrases.push(threeWordPhrase);
        }
      }
    }
    
    return phrases.slice(0, 3);
  };

  const capitalizeTitle = (title: string): string => {
    return title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const detectRecurringPattern = (content: string): boolean => {
    const recurringIndicators = [
      'again', 'recurring', 'same', 'repeat', 'always', 'every night', 
      'keeps happening', 'over and over', 'familiar'
    ];
    
    const contentLower = content.toLowerCase();
    return recurringIndicators.some(indicator => contentLower.includes(indicator));
  };

  return {
    ...state,
    generateDream,
  };
}

// Enhanced helper type for the dream analysis
interface DreamElement {
  type: 'environment' | 'objects' | 'actions' | 'emotions';
  value: string;
  prominence: number;
}