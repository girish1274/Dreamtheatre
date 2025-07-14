import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, UserPlus, Users, Hash, TrendingUp } from 'lucide-react-native';
import { supabase } from '../src/lib/supabase';

interface SearchResult {
  id: string;
  type: 'user' | 'dream' | 'keyword';
  title: string;
  subtitle?: string;
  avatar_url?: string;
  user_count?: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrendingKeywords();
    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchTrendingKeywords = async () => {
    // Mock trending keywords - in real app, this would be calculated from dream keywords
    const trending = [
      'flying', 'ocean', 'forest', 'city', 'space', 'mirror', 'falling', 'running'
    ];
    setTrendingKeywords(trending);
  };

  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('is_private', false)
        .limit(5);

      if (error) throw error;

      const users = data?.map(user => ({
        id: user.id,
        type: 'user' as const,
        title: user.name,
        subtitle: 'Suggested for you',
        avatar_url: user.avatar_url,
      })) || [];

      setSuggestedUsers(users);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const results: SearchResult[] = [];

      // Search users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${searchQuery}%`)
        .eq('is_private', false)
        .limit(10);

      if (!usersError && users) {
        results.push(...users.map(user => ({
          id: user.id,
          type: 'user' as const,
          title: user.name,
          subtitle: 'User',
          avatar_url: user.avatar_url,
        })));
      }

      // Search dreams
      const { data: dreams, error: dreamsError } = await supabase
        .from('dreams')
        .select('id, title, user_id, profiles!inner(name)')
        .or(`title.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`)
        .eq('is_public', true)
        .limit(10);

      if (!dreamsError && dreams) {
        results.push(...dreams.map(dream => ({
          id: dream.id,
          type: 'dream' as const,
          title: dream.title,
          subtitle: `by ${dream.profiles?.name || 'Unknown'}`,
        })));
      }

      // Search keywords
      const matchingKeywords = trendingKeywords.filter(keyword =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );

      results.push(...matchingKeywords.map(keyword => ({
        id: keyword,
        type: 'keyword' as const,
        title: `#${keyword}`,
        subtitle: 'Keyword',
        user_count: Math.floor(Math.random() * 100) + 10,
      })));

      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        router.push(`/profile/${result.id}`);
        break;
      case 'dream':
        router.push(`/dream/${result.id}`);
        break;
      case 'keyword':
        // Navigate to keyword search results
        console.log('Search keyword:', result.title);
        break;
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item)}>
      <View style={styles.resultIcon}>
        {item.type === 'user' ? (
          item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )
        ) : item.type === 'keyword' ? (
          <Hash size={24} color="#a855f7" />
        ) : (
          <Search size={24} color="#666" />
        )}
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
        )}
        {item.user_count && (
          <Text style={styles.resultCount}>{item.user_count} dreams</Text>
        )}
      </View>
      {item.type === 'user' && (
        <TouchableOpacity style={styles.followButton}>
          <UserPlus size={20} color="#a855f7" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderTrendingKeyword = (keyword: string, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.trendingItem}
      onPress={() => setSearchQuery(keyword)}
    >
      <Hash size={16} color="#a855f7" />
      <Text style={styles.trendingText}>{keyword}</Text>
    </TouchableOpacity>
  );

  const renderSuggestedUser = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.suggestedUser}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.suggestedAvatar}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.suggestedName} numberOfLines={1}>{item.title}</Text>
      <TouchableOpacity style={styles.suggestedFollowButton}>
        <UserPlus size={16} color="#a855f7" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, dreams, keywords..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {searchQuery.trim() ? (
          // Search Results
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={renderSearchResult}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loading ? 'Searching...' : 'No results found'}
                </Text>
              </View>
            }
          />
        ) : (
          // Discovery Content
          <View style={styles.discoveryContent}>
            {/* Trending Keywords */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color="#a855f7" />
                <Text style={styles.sectionTitle}>Trending Keywords</Text>
              </View>
              <View style={styles.trendingContainer}>
                {trendingKeywords.slice(0, 6).map(renderTrendingKeyword)}
              </View>
            </View>

            {/* Suggested Users */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users size={20} color="#a855f7" />
                <Text style={styles.sectionTitle}>Suggested for You</Text>
              </View>
              <FlatList
                data={suggestedUsers}
                keyExtractor={(item) => item.id}
                renderItem={renderSuggestedUser}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedList}
              />
            </View>
          </View>
        )}
      </View>
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
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
  content: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  resultIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
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
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  resultSubtitle: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resultCount: {
    color: '#a855f7',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  followButton: {
    padding: 8,
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
  },
  discoveryContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  trendingText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  suggestedList: {
    paddingRight: 16,
  },
  suggestedUser: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  suggestedAvatar: {
    marginBottom: 8,
  },
  suggestedName: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 8,
  },
  suggestedFollowButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 6,
  },
});