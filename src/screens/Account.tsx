import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { User, Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export function Account() {
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    dreamCount: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: dreams } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id);

      setProfile({
        email: user.email || '',
        name: user.user_metadata.name || '',
        dreamCount: dreams?.length || 0,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <User size={64} color="#a855f7" />
        <Text style={styles.name}>{profile.name || 'Dream Explorer'}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {profile.dreamCount} Dreams Recorded
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Palette size={24} color="#a855f7" />
          <Text style={styles.sectionTitle}>Animation Preferences</Text>
        </View>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Default Animation Style</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={24} color="#a855f7" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Dream Analysis Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Community Interactions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={24} color="#a855f7" />
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
        </View>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SettingsIcon size={24} color="#a855f7" />
          <Text style={styles.sectionTitle}>App Settings</Text>
        </View>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Theme</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Language</Text>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  stats: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  statsText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  option: {
    paddingVertical: 12,
    marginLeft: 34,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
});