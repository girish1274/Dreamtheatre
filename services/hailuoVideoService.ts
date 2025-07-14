interface HailuoVideoRequest {
  model: string;
  prompt: string;
  image_url?: string;
  duration?: number;
  aspect_ratio?: string;
  style?: string;
}

interface HailuoVideoResponse {
  task_id: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

interface HailuoVideoResult {
  task_id: string;
  status: 'processing' | 'success' | 'failed';
  video_url?: string;
  file_id?: string;
  duration?: number;
  aspect_ratio?: string;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

export class HailuoVideoService {
  private apiKey: string;
  private baseUrl = 'https://api.minimax.chat/v1/video_generation';
  
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_HAILUOAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('HailuoAI API key not found. Video generation will use fallback methods.');
    }
  }

  async generateVideo(
    prompt: string, 
    style: string = 'realistic',
    duration: number = 6,
    aspectRatio: string = '16:9'
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('HailuoAI API key not configured');
    }

    try {
      console.log('🎬 Starting HailuoAI video generation...');
      console.log('Prompt:', prompt);
      console.log('Style:', style);
      console.log('Duration:', duration);
      console.log('Aspect Ratio:', aspectRatio);

      // Step 1: Submit video generation request
      const taskId = await this.submitVideoRequest(prompt, style, duration, aspectRatio);
      console.log('✅ Video generation task submitted:', taskId);

      // Step 2: Poll for completion
      const videoUrl = await this.pollForCompletion(taskId);
      console.log('🎉 Video generation completed:', videoUrl);

      return videoUrl;
    } catch (error) {
      console.error('❌ HailuoAI video generation failed:', error);
      throw error;
    }
  }

  private async submitVideoRequest(
    prompt: string, 
    style: string, 
    duration: number,
    aspectRatio: string
  ): Promise<string> {
    const optimizedPrompt = this.optimizePrompt(prompt, style, duration);
    
    const requestBody: HailuoVideoRequest = {
      model: 'video-01',
      prompt: optimizedPrompt,
      duration: Math.min(Math.max(duration, 3), 10), // Clamp between 3-10 seconds
      aspect_ratio: aspectRatio,
      style: style,
    };

    console.log('📤 Submitting request to HailuoAI:', requestBody);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HailuoAI API Error:', response.status, errorText);
      throw new Error(`HailuoAI API error: ${response.status} - ${errorText}`);
    }

    const result: HailuoVideoResponse = await response.json();
    console.log('📥 HailuoAI response:', result);

    if (result.base_resp.status_code !== 0) {
      throw new Error(`HailuoAI error: ${result.base_resp.status_msg}`);
    }

    return result.task_id;
  }

  private async pollForCompletion(taskId: string, maxAttempts: number = 40): Promise<string> {
    console.log('⏳ Polling for video completion...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.checkTaskStatus(taskId);
        
        console.log(`📊 Attempt ${attempt}/${maxAttempts} - Status: ${result.status}`);

        if (result.status === 'success' && result.video_url) {
          return result.video_url;
        }

        if (result.status === 'failed') {
          throw new Error('Video generation failed on HailuoAI servers');
        }

        // Wait before next poll (exponential backoff with max 15 seconds)
        const waitTime = Math.min(3000 * Math.pow(1.3, attempt - 1), 15000);
        await new Promise(resolve => setTimeout(resolve, waitTime));

      } catch (error) {
        console.error(`Polling attempt ${attempt} failed:`, error);
        
        if (attempt === maxAttempts) {
          throw new Error('Video generation timed out');
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    throw new Error('Video generation timed out after maximum attempts');
  }

  private async checkTaskStatus(taskId: string): Promise<HailuoVideoResult> {
    const response = await fetch(`${this.baseUrl}/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status check failed: ${response.status} - ${errorText}`);
    }

    const result: HailuoVideoResult = await response.json();
    
    if (result.base_resp.status_code !== 0) {
      throw new Error(`Status check error: ${result.base_resp.status_msg}`);
    }

    return result;
  }

  private optimizePrompt(prompt: string, style: string, duration: number): string {
    // Enhanced style-specific optimizations for HailuoAI
    const stylePrompts = {
      // Realistic Styles
      realistic: 'photorealistic cinematic style with professional lighting, detailed textures, and lifelike movement',
      cinematic: 'cinematic film style with dramatic lighting, professional camera work, and movie-quality production',
      documentary: 'documentary style with natural lighting, authentic atmosphere, and realistic human behavior',
      
      // Anime & Animation Styles
      anime: 'Japanese anime style with vibrant colors, expressive characters, dynamic action sequences, and traditional anime aesthetics',
      ghibli: 'Studio Ghibli style with hand-drawn animation, whimsical characters, magical atmosphere, and Miyazaki-inspired visuals',
      manga: 'manga-inspired animation with bold lines, dramatic expressions, and Japanese comic book aesthetics',
      
      // Artistic Styles
      watercolor: 'soft watercolor painting style with flowing, dreamy transitions, ethereal atmosphere, and artistic brush strokes',
      claymation: 'charming stop-motion claymation style with tactile textures, handcrafted appearance, and clay-like characters',
      'hand-drawn': 'traditional hand-drawn animation style with organic lines, sketchy details, artistic flair, and 2D animation',
      
      // Digital Art Styles
      cyberpunk: 'neon-lit cyberpunk aesthetic with glowing elements, digital effects, futuristic atmosphere, and sci-fi visuals',
      'pixel-art': '8-bit pixel art style with retro gaming aesthetics, blocky characters, and nostalgic video game visuals',
      'digital-art': 'modern digital art style with clean lines, vibrant colors, and contemporary illustration techniques',
      
      // Fantasy & Sci-Fi
      fantasy: 'fantasy art style with magical elements, mystical creatures, enchanted environments, and otherworldly atmosphere',
      'sci-fi': 'science fiction style with futuristic technology, space environments, advanced machinery, and alien landscapes',
      steampunk: 'steampunk aesthetic with Victorian-era machinery, brass and copper elements, and retro-futuristic design',
      
      // Abstract & Experimental
      abstract: 'abstract art style with geometric shapes, flowing forms, experimental visuals, and non-representational imagery',
      surreal: 'surreal art style with dreamlike imagery, impossible scenarios, and Salvador Dali-inspired visuals',
      minimalist: 'minimalist style with clean lines, simple forms, limited color palette, and elegant simplicity',
      
      // Vintage & Retro
      vintage: 'vintage film style with aged aesthetics, retro color grading, and classic cinematography',
      'film-noir': 'film noir style with dramatic shadows, high contrast lighting, and classic black and white cinematography',
      '80s-retro': '1980s retro style with neon colors, synthwave aesthetics, and nostalgic 80s visuals'
    };

    const styleDescription = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.realistic;

    // Duration-based pacing instructions
    const pacingInstructions = duration <= 5 
      ? 'fast-paced with quick transitions and dynamic movement'
      : duration <= 8
        ? 'medium-paced with smooth transitions and balanced movement'
        : 'slow-paced with gentle transitions and contemplative movement';

    // Enhanced prompt with comprehensive elements
    const optimizedPrompt = `
      ${prompt}
      
      Visual Style: ${styleDescription}
      
      Cinematography: ${pacingInstructions}, professional camera work, smooth motion, high detail, 4K quality.
      Duration: ${duration} seconds of fluid, engaging motion.
      Atmosphere: immersive and captivating with appropriate mood and tone.
      Quality: premium production value with attention to detail and visual excellence.
    `.trim().replace(/\s+/g, ' ');

    console.log('🎨 Optimized prompt for HailuoAI:', optimizedPrompt);
    return optimizedPrompt;
  }

  // Get all available styles
  getAvailableStyles() {
    return {
      realistic: [
        { id: 'realistic', name: 'Realistic', description: 'Photorealistic with lifelike details' },
        { id: 'cinematic', name: 'Cinematic', description: 'Movie-quality production style' },
        { id: 'documentary', name: 'Documentary', description: 'Natural, authentic atmosphere' },
      ],
      anime: [
        { id: 'anime', name: 'Anime', description: 'Japanese anime with vibrant colors' },
        { id: 'ghibli', name: 'Studio Ghibli', description: 'Miyazaki-inspired whimsical style' },
        { id: 'manga', name: 'Manga', description: 'Japanese comic book aesthetics' },
      ],
      artistic: [
        { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing watercolor painting' },
        { id: 'claymation', name: 'Claymation', description: 'Stop-motion clay animation' },
        { id: 'hand-drawn', name: 'Hand-drawn', description: 'Traditional 2D animation' },
      ],
      digital: [
        { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon-lit futuristic aesthetic' },
        { id: 'pixel-art', name: 'Pixel Art', description: '8-bit retro gaming style' },
        { id: 'digital-art', name: 'Digital Art', description: 'Modern digital illustration' },
      ],
      fantasy: [
        { id: 'fantasy', name: 'Fantasy', description: 'Magical and mystical elements' },
        { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic science fiction' },
        { id: 'steampunk', name: 'Steampunk', description: 'Victorian-era machinery' },
      ],
      experimental: [
        { id: 'abstract', name: 'Abstract', description: 'Geometric and experimental' },
        { id: 'surreal', name: 'Surreal', description: 'Dreamlike and impossible' },
        { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple forms' },
      ],
      vintage: [
        { id: 'vintage', name: 'Vintage', description: 'Aged film aesthetics' },
        { id: 'film-noir', name: 'Film Noir', description: 'Classic black and white' },
        { id: '80s-retro', name: '80s Retro', description: 'Neon synthwave style' },
      ]
    };
  }

  // Get supported durations
  getSupportedDurations() {
    return [
      { value: 3, label: '3 seconds', description: 'Quick preview' },
      { value: 5, label: '5 seconds', description: 'Short clip' },
      { value: 6, label: '6 seconds', description: 'Standard (recommended)' },
      { value: 8, label: '8 seconds', description: 'Extended clip' },
      { value: 10, label: '10 seconds', description: 'Long form' },
    ];
  }

  // Get supported aspect ratios
  getSupportedAspectRatios() {
    return [
      { id: '16:9', name: 'Landscape', description: '16:9 - Perfect for YouTube, desktop' },
      { id: '9:16', name: 'Portrait', description: '9:16 - Perfect for TikTok, Instagram Stories' },
      { id: '1:1', name: 'Square', description: '1:1 - Perfect for Instagram posts' },
      { id: '4:3', name: 'Classic', description: '4:3 - Traditional video format' },
      { id: '21:9', name: 'Ultrawide', description: '21:9 - Cinematic widescreen' },
    ];
  }

  // Check if HailuoAI service is available
  async isServiceAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Simple health check
      const response = await fetch(`${this.baseUrl.replace('/video_generation', '/models')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.warn('HailuoAI service check failed:', error);
      return false;
    }
  }

  // Get estimated generation time based on duration and style
  getEstimatedGenerationTime(duration: number, style: string): number {
    const baseTime = 45000; // 45 seconds base
    const durationMultiplier = duration * 5000; // 5 seconds per video second
    
    const styleMultipliers = {
      'realistic': 1.2,
      'cinematic': 1.3,
      'anime': 1.1,
      'ghibli': 1.4,
      'watercolor': 1.0,
      'claymation': 1.5,
      'cyberpunk': 1.1,
      'abstract': 0.9,
      'minimalist': 0.8,
    };
    
    const styleMultiplier = styleMultipliers[style as keyof typeof styleMultipliers] || 1.0;
    
    return Math.round(baseTime + durationMultiplier * styleMultiplier);
  }

  // Get service info
  getServiceInfo() {
    return {
      name: 'HailuoAI Video Generation',
      provider: 'MiniMax',
      maxDuration: 10, // seconds
      minDuration: 3, // seconds
      supportedStyles: Object.keys(this.getAvailableStyles()).length,
      supportedAspectRatios: this.getSupportedAspectRatios(),
      quality: 'Ultra High (1024x576+)',
      features: [
        'Multiple artistic styles',
        'Customizable duration (3-10s)',
        'Multiple aspect ratios',
        'Professional quality output',
        'Style-specific optimizations'
      ]
    };
  }
}