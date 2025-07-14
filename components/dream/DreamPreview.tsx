import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, RefreshCw } from 'lucide-react-native';
import type { Dream } from '../../types';
import { VideoService } from '../services/videoService';

interface DreamPreviewProps {
  dream: Dream;
  onAdjust?: (adjustments: Partial<Dream>) => void;
}

export function DreamPreview({ dream, onAdjust }: DreamPreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateVideo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRegenerating(false);
      console.log('🎬 Starting video generation for dream:', dream);
      
      // Create mock analysis if not available
      const mockAnalysis = dream.analysis || {
        elements: [
          { type: 'environment', value: 'surreal landscape', prominence: 0.8 },
          { type: 'objects', value: 'floating objects', prominence: 0.6 }
        ],
        dominantThemes: dream.emotions && dream.emotions.length > 0 ? dream.emotions : ['transformation', 'journey'],
        suggestedPalette: ['#8A2BE2', '#4B0082', '#9370DB'],
        moodScore: dream.emotions && (dream.emotions.includes('joy') || dream.emotions.includes('peace')) ? 0.8 : 0.4
      };
      
      const videoService = new VideoService();
      const url = await videoService.generateVideo(mockAnalysis, dream.style || 'watercolor');
      console.log('✅ Video generated successfully:', url);
      setVideoUrl(url);
    } catch (error) {
      console.error('❌ Failed to generate video:', error);
      setError(`Failed to generate video: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateVideo();
  }, [dream]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
      
      // Set volume (0-1 scale)
      videoRef.current.volume = volume / 100;
    }
  }, [isPlaying, volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVideoLoaded = () => {
    console.log('Video loaded successfully');
    // Auto-play when loaded
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setError('Error loading video. Please try again.');
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    generateVideo();
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-white">
                {regenerating ? 'Regenerating your dream video...' : 'Generating your dream video...'}
              </p>
              <p className="text-gray-400 text-sm mt-2">Creating a visual representation of your dream</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={handleRegenerate}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        ) : videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            controls={false}
            loop
            playsInline
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white">No video available</p>
          </div>
        )}
        
        {/* Video Controls */}
        {videoUrl && !isLoading && !error && (
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <button 
                  className="p-3 bg-purple-500 hover:bg-purple-600 rounded-full transition-colors"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 text-white" fill="currentColor" />
                  )}
                </button>
                <button 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = videoRef.current.duration - 0.1;
                    }
                  }}
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRegenerate}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4"
                  title="Generate a new version"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </button>
                <Volume2 className="w-5 h-5 text-white" />
                <input
                  type="range"
                  className="w-24 accent-purple-500"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adjustment Controls */}
      {videoUrl && !isLoading && !error && onAdjust && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Style Intensity</label>
            <input
              type="range"
              className="w-full accent-purple-500"
              min="0"
              max="100"
              defaultValue="50"
              onChange={(e) => onAdjust({ styleIntensity: parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
            <input
              type="range"
              className="w-full accent-purple-500"
              min="0"
              max="100"
              defaultValue="75"
              onChange={(e) => onAdjust({ animationSpeed: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium text-white mb-2">Dream Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Emotions</h4>
                <div className="flex flex-wrap gap-2">
                  {dream.emotions.map((emotion, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {dream.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}