import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Camera, Globe, FileText, Save } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function EditProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    avatar_url: '',
    is_private: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          website: data.website || '',
          avatar_url: data.avatar_url || '',
          is_private: data.is_private || false,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          name: formData.name.trim(),
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          is_private: formData.is_private,
        });

      if (error) throw error;

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <Save size={20} color="#a855f7" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.avatar_url ? (
              <Image source={{ uri: formData.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.avatarButton}>
              <Camera size={20} color="#a855f7" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your display name"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                maxLength={50}
              />
            </View>
            <Text style={styles.characterCount}>{formData.name.length}/50</Text>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={styles.textAreaContainer}>
              <FileText size={20} color="#666" style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about yourself and your dreams..."
                placeholderTextColor="#666"
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={160}
              />
            </View>
            <Text style={styles.characterCount}>{formData.bio.length}/160</Text>
          </View>

          {/* Website */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.inputContainer}>
              <Globe size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="https://yourwebsite.com"
                placeholderTextColor="#666"
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>

          {/* Privacy Setting */}
          <View style={styles.privacySection}>
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>Privacy Settings</Text>
              <Text style={styles.privacySubtitle}>
                Control who can see your profile and dreams
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => setFormData({ ...formData, is_private: !formData.is_private })}
            >
              <View style={styles.privacyOptionContent}>
                <Text style={styles.privacyOptionTitle}>Private Account</Text>
                <Text style={styles.privacyOptionDescription}>
                  Only approved followers can see your dreams
                </Text>
              </View>
              <View style={[
                styles.toggle,
                formData.is_private && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleThumb,
                  formData.is_private && styles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    color: '#a855f7',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    minHeight: 100,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'right',
  },
  privacySection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  privacyHeader: {
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  privacySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyOptionContent: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  privacyOptionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#a855f7',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
});