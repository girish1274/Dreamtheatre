import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause,
  MoreHorizontal,
  Flag
} from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Dream } from '../../src/types';

interface DreamDetails extends Dream {
  user_name: string;
  user_avatar?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments: Array<{
    id: string;
    content: string;
    user_name: string;
    user_avatar?: string;
    created_at: string;
  }>;
}

export default function DreamDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [dream, setDream] = useState<DreamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDreamDetails();
    }
  }, [id]);

  const fetchDreamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select(`
          *,
          profiles!inner(name, avatar_url),
          dream_likes(count),
          dream_comments(
            id,
            content,
            created_at,
            profiles!inner(name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const dreamDetails: DreamDetails = {
        ...data,
        user_name: data.profiles?.name || 'Anonymous Dreamer',
        user_avatar: data.profiles?.avatar_url,
        likes_count: data.dream_likes?.length || 0,
        comments_count: data.dream_comments?.length || 0,
        is_liked: false, // TODO: Check if current user liked this dream
        comments: data.dream_comments?.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          user_name: comment.profiles?.name || 'Anonymous',
          user_avatar: comment.profiles?.avatar_url,
          created_at: comment.created_at,
        })) || [],
      };

      setDream(dreamDetails);
    } catch (error) {
      console.error('Error fetching dream details:', error);
      Alert.alert('Error', 'Failed to load dream details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!dream || !user) return;

    try {
      if (dream.is_liked) {
        // Unlike
        await supabase
          .from('dream_likes')
          .delete()
          .eq('dream_id', dream.id)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('dream_likes')
          .insert({
            dream_id: dream.id,
            user_id: user.id,
          });
      }

      setDream(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1,
      } : null);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    if (!dream) return;

    try {
      await Share.share({
        message: `Check out this amazing dream: "${dream.title}" by ${dream.user_name}`,
        url: `https://dreamcinema.app/dream/${dream.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Dream',
      'Why are you reporting this dream?',
      [
        { text: 'Inappropriate content', onPress: () => console.log('Report: Inappropriate') },
        { text: 'Spam', onPress: () => console.log('Report: Spam') },
        { text: 'Copyright violation', onPress: () => console.log('Report: Copyright') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dream...</Text>
        </View>
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Dream not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReport} style={styles.moreButton}>
          <MoreHorizontal size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => router.push(`/profile/${dream.user_id}`)}
          >
            <View style={styles.avatar}>
              {dream.user_avatar ? (
                <Image source={{ uri: dream.user_avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {dream.user_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{dream.user_name}</Text>
              <Text style={styles.dreamDate}>
                {new Date(dream.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Dream Title */}
        <Text style={styles.dreamTitle}>{dream.title}</Text>

        {/* Dream Video/Image */}
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg' }}
            style={styles.dreamMedia}
          />
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause size={32} color="#fff" fill="#fff" />
            ) : (
              <Play size={32} color="#fff" fill="#fff" />
            )}
          </TouchableOpacity>
          <View style={styles.styleTag}>
            <Text style={styles.styleTagText}>{dream.style || 'Watercolor'}</Text>
          </View>
        </View>

        {/* Dream Content */}
        <View style={styles.dreamContent}>
          <Text style={styles.dreamDescription}>{dream.content}</Text>

          {/* Keywords */}
          {dream.keywords && dream.keywords.length > 0 && (
            <View style={styles.keywordSection}>
              <Text style={styles.sectionTitle}>Keywords</Text>
              <View style={styles.keywordList}>
                {dream.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keyword}>
                    <Text style={styles.keywordText}>#{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Emotions */}
          {dream.emotions && dream.emotions.length > 0 && (
            <View style={styles.emotionSection}>
              <Text style={styles.sectionTitle}>Emotions</Text>
              <View style={styles.emotionList}>
                {dream.emotions.map((emotion, index) => (
                  <View key={index} style={styles.emotion}>
                    <Text style={styles.emotionText}>{emotion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.actionButton, dream.is_liked && styles.likedButton]}
            onPress={handleLike}
          >
            <Heart 
              size={24} 
              color={dream.is_liked ? "#fff" : "#666"} 
              fill={dream.is_liked ? "#fff" : "none"}
            />
            <Text style={[styles.actionText, dream.is_liked && styles.likedText]}>
              {dream.likes_count} {dream.likes_count === 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color="#666" />
            <Text style={styles.actionText}>
              {dream.comments_count} {dream.comments_count === 1 ? 'Comment' : 'Comments'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={24} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments</Text>
          {dream.comments.length > 0 ? (
            dream.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    {comment.user_avatar ? (
                      <Image source={{ uri: comment.user_avatar }} style={styles.commentAvatarImage} />
                    ) : (
                      <View style={styles.commentAvatarPlaceholder}>
                        <Text style={styles.commentAvatarText}>
                          {comment.user_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.commentInfo}>
                    <Text style={styles.commentUserName}>{comment.user_name}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  userSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  dreamDate: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  dreamTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 32,
  },
  mediaContainer: {
    position: 'relative',
    height: 400,
    marginBottom: 20,
  },
  dreamMedia: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(168, 85, 247, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  styleTagText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  dreamContent: {
    paddingHorizontal: 16,
  },
  dreamDescription: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  keywordSection: {
    marginBottom: 24,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyword: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    color: '#a855f7',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emotionSection: {
    marginBottom: 24,
  },
  emotionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotion: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  emotionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2d2d2d',
    marginVertical: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  likedButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
  },
  actionText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  likedText: {
    color: '#fff',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  commentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    marginRight: 12,
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  commentInfo: {
    flex: 1,
  },
  commentUserName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  commentDate: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  commentContent: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  noComments: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});