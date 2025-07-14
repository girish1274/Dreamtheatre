import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Sparkles, Play, Download, Share2, Clock, Wand2, Palette, Monitor } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { VideoService } from '../../services/videoService';

interface VideoGenerationRequest {
  prompt: string;
  duration: number;
  style: string;
  aspectRatio: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  style: string;
  aspectRatio: string;
  createdAt: string;
  status: 'generating' | 'completed' | 'failed';
}

export default function AIVideo() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(6);
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
  const [selectedStyleCategory, setSelectedStyleCategory] = useState('realistic');

  const videoService = new VideoService();
  const availableStyles = videoService.getAvailableStyles();
  const supportedDurations = videoService.getSupportedDurations();
  const supportedAspectRatios = videoService.getSupportedAspectRatios();

  const validatePrompt = (text: string): boolean => {
    if (text.length < 10) {
      Alert.alert('Error', 'Prompt must be at least 10 characters long');
      return false;
    }
    if (text.length > 500) {
      Alert.alert('Error', 'Prompt must be less than 500 characters');
      return false;
    }
    return true;
  };

  const generateVideo = async () => {
    if (!validatePrompt(prompt)) return;
    if (!user) {
      Alert.alert('Error', 'Please sign in to generate videos');
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new video entry
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: '',
        prompt,
        duration,
        style,
        aspectRatio,
        createdAt: new Date().toISOString(),
        status: 'generating',
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      setCurrentVideo(newVideo);

      // Create mock analysis from the prompt
      const mockAnalysis = {
        elements: [
          { type: 'environment' as const, value: 'dreamscape', prominence: 0.8 },
          { type: 'actions' as const, value: 'flowing', prominence: 0.6 }
        ],
        dominantThemes: ['transformation', 'journey'],
        suggestedPalette: ['#8A2BE2', '#4B0082', '#9370DB'],
        moodScore: 0.7
      };
      
      console.log('🎬 Generating video with enhanced HailuoAI...');
      const videoUrl = await videoService.generateVideo(mockAnalysis, style, duration, aspectRatio);

      // Update the video with the generated URL
      const updatedVideo: GeneratedVideo = {
        ...newVideo,
        url: videoUrl,
        status: 'completed',
      };

      setGeneratedVideos(prev => 
        prev.map(video => 
          video.id === newVideo.id ? updatedVideo : video
        )
      );
      setCurrentVideo(updatedVideo);

      Alert.alert('Success', `Video generated successfully with ${style} style!`);
    } catch (error) {
      console.error('Error generating video:', error);
      
      // Update status to failed
      setGeneratedVideos(prev => 
        prev.map(video => 
          video.id === currentVideo?.id 
            ? { ...video, status: 'failed' } 
            : video
        )
      );

      Alert.alert('Error', `Failed to generate video: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareVideo = async (video: GeneratedVideo) => {
    try {
      Alert.alert('Share', 'Video sharing functionality would be implemented here');
    } catch (error) {
      Alert.alert('Error', 'Failed to share video');
    }
  };

  const downloadVideo = async (video: GeneratedVideo) => {
    try {
      Alert.alert('Download', 'Video download functionality would be implemented here');
    } catch (error) {
      Alert.alert('Error', 'Failed to download video');
    }
  };

  const getEstimatedTime = () => {
    const estimatedMs = videoService.getEstimatedGenerationTime(duration, style);
    const estimatedSeconds = Math.round(estimatedMs / 1000);
    return estimatedSeconds > 60 
      ? `${Math.round(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`
      : `${estimatedSeconds}s`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Sparkles size={32} color="#a855f7" />
          <Wand2 size={24} color="#fbbf24" style={styles.sparkles} />
        </View>
        <Text style={styles.title}>AI Video Generator</Text>
        <Text style={styles.subtitle}>Create stunning videos with 20+ artistic styles</Text>
      </View>

      {/* Video Generation Form */}
      <View style={styles.form}>
        {/* Prompt Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Video Prompt</Text>
          <TextInput
            style={styles.textArea}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe your video... (e.g., 'A majestic dragon soaring through a mystical forest with glowing particles')"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{prompt.length}/500</Text>
        </View>

        {/* Style Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Style Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {Object.keys(availableStyles).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedStyleCategory === category && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedStyleCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedStyleCategory === category && styles.categoryTextSelected,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Style Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Video Style</Text>
          <View style={styles.styleGrid}>
            {availableStyles[selectedStyleCategory as keyof typeof availableStyles]?.map((styleOption) => (
              <TouchableOpacity
                key={styleOption.id}
                style={[
                  styles.styleCard,
                  style === styleOption.id && styles.styleCardSelected,
                ]}
                onPress={() => setStyle(styleOption.id)}
              >
                <Palette size={20} color={style === styleOption.id ? '#fff' : '#a855f7'} />
                <Text
                  style={[
                    styles.styleTitle,
                    style === styleOption.id && styles.styleTitleSelected,
                  ]}
                >
                  {styleOption.name}
                </Text>
                <Text
                  style={[
                    styles.styleDescription,
                    style === styleOption.id && styles.styleDescriptionSelected,
                  ]}
                >
                  {styleOption.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.optionGrid}>
            {supportedDurations.map((dur) => (
              <TouchableOpacity
                key={dur.value}
                style={[
                  styles.optionButton,
                  duration === dur.value && styles.optionButtonSelected,
                ]}
                onPress={() => setDuration(dur.value)}
              >
                <Clock size={16} color={duration === dur.value ? '#fff' : '#a855f7'} />
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionText,
                      duration === dur.value && styles.optionTextSelected,
                    ]}
                  >
                    {dur.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtext,
                      duration === dur.value && styles.optionSubtextSelected,
                    ]}
                  >
                    {dur.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aspect Ratio Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aspect Ratio</Text>
          <View style={styles.aspectGrid}>
            {supportedAspectRatios.map((ratio) => (
              <TouchableOpacity
                key={ratio.id}
                style={[
                  styles.aspectCard,
                  aspectRatio === ratio.id && styles.aspectCardSelected,
                ]}
                onPress={() => setAspectRatio(ratio.id)}
              >
                <Monitor size={16} color={aspectRatio === ratio.id ? '#fff' : '#a855f7'} />
                <Text
                  style={[
                    styles.aspectTitle,
                    aspectRatio === ratio.id && styles.aspectTitleSelected,
                  ]}
                >
                  {ratio.name}
                </Text>
                <Text
                  style={[
                    styles.aspectDescription,
                    aspectRatio === ratio.id && styles.aspectDescriptionSelected,
                  ]}
                >
                  {ratio.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generation Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Generation Details</Text>
          <Text style={styles.infoText}>Style: {style}</Text>
          <Text style={styles.infoText}>Duration: {duration} seconds</Text>
          <Text style={styles.infoText}>Aspect Ratio: {aspectRatio}</Text>
          <Text style={styles.infoText}>Estimated Time: {getEstimatedTime()}</Text>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateVideo}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.generateButtonText}>Generating Video...</Text>
            </>
          ) : (
            <>
              <Sparkles size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Video</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Current Video Preview */}
      {currentVideo && (
        <View style={styles.videoPreview}>
          <Text style={styles.sectionTitle}>Generated Video</Text>
          <View style={styles.videoCard}>
            {currentVideo.status === 'generating' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={styles.loadingText}>Generating your video...</Text>
                <Text style={styles.loadingSubtext}>Using {style} style • {duration}s duration</Text>
                <Text style={styles.loadingSubtext}>Estimated time: {getEstimatedTime()}</Text>
              </View>
            ) : currentVideo.status === 'completed' && currentVideo.url ? (
              <>
                <Video
                  source={{ uri: currentVideo.url }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
                <View style={styles.videoActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => shareVideo(currentVideo)}
                  >
                    <Share2 size={20} color="#a855f7" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => downloadVideo(currentVideo)}
                  >
                    <Download size={20} color="#a855f7" />
                    <Text style={styles.actionButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to generate video</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={generateVideo}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.videoInfo}>
              <Text style={styles.videoPrompt} numberOfLines={2}>
                "{currentVideo.prompt}"
              </Text>
              <View style={styles.videoMeta}>
                <Text style={styles.videoMetaText}>
                  {currentVideo.duration}s • {currentVideo.style} • {currentVideo.aspectRatio}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Video History */}
      {generatedVideos.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Videos</Text>
          {generatedVideos.slice(0, 5).map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.historyItem}
              onPress={() => setCurrentVideo(video)}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyPrompt} numberOfLines={1}>
                  {video.prompt}
                </Text>
                <Text style={styles.historyMeta}>
                  {video.duration}s • {video.style} • {new Date(video.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.historyStatus}>
                {video.status === 'generating' && (
                  <ActivityIndicator size="small" color="#a855f7" />
                )}
                {video.status === 'completed' && (
                  <Play size={20} color="#10b981" />
                )}
                {video.status === 'failed' && (
                  <Text style={styles.failedText}>Failed</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkles: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  form: {
    padding: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    height: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'right',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  categoryText: {
    color: '#a855f7',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  styleGrid: {
    gap: 12,
  },
  styleCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  styleCardSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  styleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    flex: 1,
  },
  styleTitleSelected: {
    color: '#fff',
  },
  styleDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 2,
  },
  styleDescriptionSelected: {
    color: '#e5e7eb',
  },
  optionGrid: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    color: '#a855f7',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  optionTextSelected: {
    color: '#fff',
  },
  optionSubtext: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  optionSubtextSelected: {
    color: '#e5e7eb',
  },
  aspectGrid: {
    gap: 8,
  },
  aspectCard: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aspectCardSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  aspectTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    flex: 1,
  },
  aspectTitleSelected: {
    color: '#fff',
  },
  aspectDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 2,
  },
  aspectDescriptionSelected: {
    color: '#e5e7eb',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  videoPreview: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 16,
  },
  videoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  video: {
    width: '100%',
    height: 200,
  },
  videoActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#a855f7',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  videoInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
  },
  videoPrompt: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoMetaText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyPrompt: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  historyMeta: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  historyStatus: {
    marginLeft: 12,
  },
  failedText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});