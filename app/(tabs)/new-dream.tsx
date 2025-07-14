import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Mic, Tag, X, Palette, Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const ANIMATION_STYLES = [
  { id: 'watercolor', name: 'Watercolor', description: 'Flowing, ethereal watercolor animation' },
  { id: 'claymation', name: 'Claymation', description: 'Charming, tactile clay-like animation' },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon-soaked futuristic visuals' },
  { id: 'hand-drawn', name: 'Hand-drawn', description: 'Traditional hand-drawn animation style' },
];

const EMOTIONS = [
  { id: 'joy', label: 'Joy', color: '#fbbf24' },
  { id: 'fear', label: 'Fear', color: '#ef4444' },
  { id: 'peace', label: 'Peace', color: '#3b82f6' },
  { id: 'mystery', label: 'Mystery', color: '#8b5cf6' },
  { id: 'anxiety', label: 'Anxiety', color: '#f97316' },
  { id: 'love', label: 'Love', color: '#ec4899' },
];

export default function NewDream() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    style?: string;
    general?: string;
  }>({});

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Dream title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Dream description is required';
    } else if (content.trim().length < 10) {
      newErrors.content = 'Dream description must be at least 10 characters';
    }

    if (!selectedStyle) {
      newErrors.style = 'Please select an animation style';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.from('dreams').insert({
        user_id: user?.id,
        title: title.trim(),
        content: content.trim(),
        keywords,
        emotions: selectedEmotions,
        style: selectedStyle,
        is_public: false,
      });

      if (error) throw error;

      Alert.alert(
        'Success!',
        'Your dream has been created successfully.',
        [
          {
            text: 'View Dreams',
            onPress: () => router.push('/dream-theater'),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setTitle('');
              setContent('');
              setKeywords([]);
              setSelectedEmotions([]);
              setSelectedStyle('');
            },
          },
        ]
      );
    } catch (error) {
      setErrors({ general: 'Failed to create dream. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Voice Recording', 'Voice recording is not available on web. Please type your dream instead.');
      return;
    }
    setIsRecording(!isRecording);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Sparkles size={32} color="#a855f7" />
        <Text style={styles.title}>Create Your Dream Movie</Text>
        <Text style={styles.subtitle}>Transform your dream into a cinematic experience</Text>
      </View>

      <View style={styles.form}>
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Dream Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dream Title</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: undefined });
            }}
            placeholder="Enter a title for your dream"
            placeholderTextColor="#666"
          />
          {errors.title && <Text style={styles.fieldError}>{errors.title}</Text>}
        </View>

        {/* Dream Description */}
        <View style={styles.inputGroup}>
          <View style={styles.recordHeader}>
            <Text style={styles.label}>Dream Description</Text>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recording]}
              onPress={toggleRecording}
            >
              <Mic size={20} color={isRecording ? '#fff' : '#a855f7'} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.textArea, errors.content && styles.inputError]}
            value={content}
            onChangeText={(text) => {
              setContent(text);
              if (errors.content) setErrors({ ...errors, content: undefined });
            }}
            placeholder="Describe your dream in detail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {errors.content && <Text style={styles.fieldError}>{errors.content}</Text>}
        </View>

        {/* Keywords */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Keywords</Text>
          <View style={styles.keywordInput}>
            <Tag size={20} color="#666" />
            <TextInput
              style={styles.keywordTextInput}
              value={newKeyword}
              onChangeText={setNewKeyword}
              onSubmitEditing={addKeyword}
              placeholder="Add keywords (press return)"
              placeholderTextColor="#666"
              returnKeyType="done"
            />
          </View>
          <View style={styles.keywordList}>
            {keywords.map((keyword, index) => (
              <TouchableOpacity
                key={index}
                style={styles.keyword}
                onPress={() => removeKeyword(index)}
              >
                <Text style={styles.keywordText}>{keyword}</Text>
                <X size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emotions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>How did this dream make you feel?</Text>
          <View style={styles.emotionGrid}>
            {EMOTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion.id}
                style={[
                  styles.emotionButton,
                  selectedEmotions.includes(emotion.id) && {
                    backgroundColor: emotion.color,
                  },
                ]}
                onPress={() => toggleEmotion(emotion.id)}
              >
                <Text
                  style={[
                    styles.emotionText,
                    selectedEmotions.includes(emotion.id) && styles.emotionTextSelected,
                  ]}
                >
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Animation Style */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Animation Style</Text>
          <View style={styles.styleGrid}>
            {ANIMATION_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  selectedStyle === style.id && styles.styleCardSelected,
                ]}
                onPress={() => {
                  setSelectedStyle(style.id);
                  if (errors.style) setErrors({ ...errors, style: undefined });
                }}
              >
                <Palette size={24} color={selectedStyle === style.id ? '#fff' : '#a855f7'} />
                <Text
                  style={[
                    styles.styleTitle,
                    selectedStyle === style.id && styles.styleTitleSelected,
                  ]}
                >
                  {style.name}
                </Text>
                <Text
                  style={[
                    styles.styleDescription,
                    selectedStyle === style.id && styles.styleDescriptionSelected,
                  ]}
                >
                  {style.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.style && <Text style={styles.fieldError}>{errors.style}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Dream Movie...' : 'Generate Dream Movie'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
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
  errorContainer: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    height: 120,
    borderWidth: 1,
    borderColor: '#333',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  recording: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  keywordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  keywordTextInput: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  keyword: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a855f7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  keywordText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emotionButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  emotionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emotionTextSelected: {
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
  },
  styleCardSelected: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  styleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  styleTitleSelected: {
    color: '#fff',
  },
  styleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  styleDescriptionSelected: {
    color: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#a855f7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});