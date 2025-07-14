import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Brain, PlusCircle, Library, Users, Settings, LogOut, Globe, UserPlus, Bell, Sparkles } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { TouchableOpacity } from 'react-native';
import { Redirect, router } from 'expo-router';

export default function TabLayout() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/signin" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: '#666',
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Regular',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Brain color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Globe color={color} size={24} />,
          headerTitle: 'Dream Feed',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ marginRight: 15 }}
            >
              <Bell color="#fff" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="ai-video"
        options={{
          title: 'AI Video',
          tabBarIcon: ({ color }) => <Sparkles color={color} size={24} />,
          headerTitle: 'AI Video Generator',
        }}
      />
      <Tabs.Screen
        name="new-dream"
        options={{
          title: 'New Dream',
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={24} />,
          headerTitle: 'Create Dream',
        }}
      />
      <Tabs.Screen
        name="dream-theater"
        options={{
          title: 'Theater',
          tabBarIcon: ({ color }) => <Library color={color} size={24} />,
          headerTitle: 'Dream Theater',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          headerTitle: 'Friends',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={{ marginRight: 15 }}
            >
              <UserPlus color="#a855f7" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
          headerTitle: 'Settings',
          headerRight: () => (
            <TouchableOpacity
              onPress={signOut}
              style={{ marginRight: 15 }}
            >
              <LogOut color="#fff" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}