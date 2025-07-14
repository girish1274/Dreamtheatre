import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Share2, MoreHorizontal } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Dream } from '../../src/types';

interface FeedDream extends Dream {
  user_name: string;
  user_avatar?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export default function Feed() {
  const { user } = useAuth();
  const [feedDreams, setFeedDreams] = useState<FeedDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeedDreams();
  }, []);

  const fetchFeedDreams = async () => {
    try {
      // Fetch public dreams with user information and engagement stats
      const { data, error } = await supabase
        .from('dreams')
        .select(`
          *,
          profiles!inner(name, avatar_url),
          dream_likes(count),
          dream_comments(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform data to include user info and engagement stats
      const transformedDreams = data?.map(dream => ({
        ...dream,
        user_name: dream.profiles?.name || 'Anonymous Dreamer',
        user_avatar: dream.profiles?.avatar_url,
        likes_count: dream.dream_likes?.length || 0,
        comments_count: dream.dream_comments?.length || 0,
        is_liked: false, // TODO: Check if current user liked this dream
      })) || [];

      setFeedDreams(transformedDreams);
    } catch (error) {
      console.error('Error fetching feed dreams:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedDreams();
  };

  const handleLike = async (dreamId: string) => {
    // TODO: Implement like functionality
    console.log('Like dream:', dreamId);
  };

  const handleComment = (dreamId: string) => {
    // TODO: Navigate to comments screen
    console.log('Comment on dream:', dreamId);
  };

  const handleShare = (dreamId: string) => {
    // TODO: Implement share functionality
    console.log('Share dream:', dreamId);
  };

  const renderDreamCard = ({ item }: { item: FeedDream }) => (
    <View style={styles.dreamCard}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.user_avatar ? (
              <Image source={{ uri: item.user_avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.user_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user_name}</Text>
            <Text style={styles.dreamDate}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Dream Title */}
      <Text style={styles.dreamTitle}>{item.title}</Text>

      {/* Dream Image/Video Preview */}
      <View style={styles.dreamMedia}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg' }}
          style={styles.dreamImage}
        />
        <View style={styles.mediaOverlay}>
          <View style={styles.styleTag}>
            <Text style={styles.styleTagText}>{item.style || 'Watercolor'}</Text>
          </View>
        </View>
      </View>

      {/* Dream Content */}
      <View style={styles.dreamContent}>
        <Text style={styles.dreamDescription} numberOfLines={3}>
          {item.content}
        </Text>

        {/* Keywords */}
        {item.keywords && item.keywords.length > 0 && (
          <View style={styles.keywordList}>
            {item.keywords.slice(0, 3).map((keyword, index) => (
              <View key={index} style={styles.keyword}>
                <Text style={styles.keywordText}>#{keyword}</Text>
              </View>
            ))}
            {item.keywords.length > 3 && (
              <Text style={styles.moreKeywords}>+{item.keywords.length - 3} more</Text>
            )}
          </View>
        )}
      </View>

      {/* Engagement Stats */}
      <View style={styles.engagementStats}>
        <View style={styles.statItem}>
          <Eye size={16} color="#666" />
          <Text style={styles.statText}>1.2k</Text>
        </View>
        <View style={styles.statItem}>
          <Heart size={16} color="#666" />
          <Text style={styles.statText}>{item.likes_count}</Text>
        </View>
        <View style={styles.statItem}>
          <MessageCircle size={16} color="#666" />
          <Text style={styles.statText}>{item.comments_count}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, item.is_liked && styles.likedButton]}
          onPress={() => handleLike(item.id)}
        >
          <Heart 
            size={20} 
            color={item.is_liked ? "#fff" : "#666"} 
            fill={item.is_liked ? "#fff" : "none"}
          />
          <Text style={[styles.actionText, item.is_liked && styles.likedText]}>
            {item.is_liked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <MessageCircle size={20} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
        >
          <Share2 size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading dream feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedDreams}
        keyExtractor={(item) => item.id}
        renderItem={renderDreamCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#a855f7"
            colors={['#a855f7']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Inter-Regular',
  },
  listContent: {
    paddingVertical: 10,
  },
  dreamCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  dreamDate: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  moreButton: {
    padding: 8,
  },
  dreamTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dreamMedia: {
    position: 'relative',
    height: 300,
  },
  dreamImage: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  styleTag: {
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
    padding: 16,
  },
  dreamDescription: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 12,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  keyword: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    color: '#a855f7',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  moreKeywords: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  engagementStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  likedButton: {
    backgroundColor: '#a855f7',
  },
  actionText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  likedText: {
    color: '#fff',
  },
});