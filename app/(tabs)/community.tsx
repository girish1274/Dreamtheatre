import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Search, UserPlus, Users, Settings } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Dream } from '../../src/types';

interface FriendDream extends Dream {
  user_name: string;
  user_avatar?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar_url?: string;
  mutual_friends: number;
  dream_count: number;
}

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dreams' | 'friends'>('dreams');
  const [friendDreams, setFriendDreams] = useState<FriendDream[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dreams') {
      fetchFriendDreams();
    } else {
      fetchFriends();
    }
  }, [activeTab]);

  const fetchFriendDreams = async () => {
    try {
      setLoading(true);
      // Fetch dreams from friends only
      const { data, error } = await supabase
        .from('dreams')
        .select(`
          *,
          profiles!inner(name, avatar_url),
          dream_likes(count),
          dream_comments(count)
        `)
        .eq('is_public', true)
        .in('user_id', []) // TODO: Replace with actual friend IDs
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedDreams = data?.map(dream => ({
        ...dream,
        user_name: dream.profiles?.name || 'Friend',
        user_avatar: dream.profiles?.avatar_url,
        likes_count: dream.dream_likes?.length || 0,
        comments_count: dream.dream_comments?.length || 0,
        is_liked: false,
      })) || [];

      setFriendDreams(transformedDreams);
    } catch (error) {
      console.error('Error fetching friend dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoading(true);
      // Mock friends data - replace with actual Supabase query
      const mockFriends: Friend[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          mutual_friends: 5,
          dream_count: 12,
        },
        {
          id: '2',
          name: 'Bob Smith',
          mutual_friends: 3,
          dream_count: 8,
        },
        {
          id: '3',
          name: 'Carol Davis',
          avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          mutual_friends: 7,
          dream_count: 15,
        },
      ];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = () => {
    Alert.alert(
      'Add Friends',
      'Choose how you want to add friends:',
      [
        { text: 'Search by Username', onPress: () => console.log('Search username') },
        { text: 'Invite by Email', onPress: () => console.log('Invite email') },
        { text: 'Find Contacts', onPress: () => console.log('Find contacts') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderDreamCard = ({ item }: { item: FriendDream }) => (
    <View style={styles.dreamCard}>
      <View style={styles.dreamHeader}>
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
          <View>
            <Text style={styles.userName}>{item.user_name}</Text>
            <Text style={styles.dreamDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.friendBadge}>
          <Text style={styles.friendBadgeText}>Friend</Text>
        </View>
      </View>

      <Text style={styles.dreamTitle}>{item.title}</Text>

      <Image
        source={{ uri: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg' }}
        style={styles.dreamImage}
      />

      <View style={styles.dreamContent}>
        <Text style={styles.dreamDescription} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.keywordList}>
          {item.keywords.slice(0, 3).map((keyword, index) => (
            <View key={index} style={styles.keyword}>
              <Text style={styles.keywordText}>#{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={20} color="#666" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendCard = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendStats}>
            {item.dream_count} dreams • {item.mutual_friends} mutual friends
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <MessageCircle size={20} color="#a855f7" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search and Add Friend */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'dreams' ? 'Search friend dreams...' : 'Search friends...'}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
          <UserPlus size={24} color="#a855f7" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dreams' && styles.activeTab]}
          onPress={() => setActiveTab('dreams')}
        >
          <Heart size={20} color={activeTab === 'dreams' ? '#a855f7' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'dreams' && styles.activeTabText]}>
            Friend Dreams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Users size={20} color={activeTab === 'friends' ? '#a855f7' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            My Friends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {activeTab === 'dreams' ? 'Loading friend dreams...' : 'Loading friends...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'dreams' ? friendDreams : friends}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'dreams' ? renderDreamCard : renderFriendCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'dreams' 
                  ? 'No friend dreams yet. Add friends to see their dreams!' 
                  : 'No friends yet. Start building your dream community!'}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddFriend}>
                <UserPlus size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#a855f7',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#fff',
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dreamCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dreamHeader: {
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
  userName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  dreamDate: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  friendBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  friendBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  dreamTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dreamImage: {
    width: '100%',
    height: 200,
  },
  dreamContent: {
    padding: 16,
  },
  dreamDescription: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 24,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  actions: {
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
  actionText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  friendCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  friendStats: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  messageButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2d2d2d',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});