import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  city: string;
  created_at: string;
  audience: 'public' | 'friends_only';
  image_url?: string;
  username?: string;
  avatar_url?: string;
}

interface StoryViewerProps {
  visible: boolean;
  friendId: string;
  friendUsername: string;
  onClose: () => void;
  selectedCity?: { name: string; lat: number; lng: number };
}

export default function StoryViewer({ 
  visible,
  friendId, 
  friendUsername, 
  onClose,
  selectedCity
}: StoryViewerProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      loadFriendPosts();
    } else {
      setPosts([]);
      setCurrentIndex(0);
      setLoading(true);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  }, [visible, friendId, selectedCity]);

  useEffect(() => {
    if (posts.length > 0 && visible) {
      startProgress();
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, posts.length, visible]);

  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });
  };

  const loadFriendPosts = async () => {
    setLoading(true);
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      let query = supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', friendId)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (selectedCity) {
        query = query.eq('city', selectedCity.name);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading friend posts:', error);
      } else {
        // Obtener información del usuario
        const { data: userData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', friendId)
          .single();

        const postsWithUser: SocialPost[] = [];
        if (data) {
          data.forEach((post: any) => {
            postsWithUser.push({
              ...post,
              username: userData?.username,
              avatar_url: userData?.avatar_url
            });
          });
        }

        setPosts(postsWithUser);
      }
    } catch (error) {
      console.error('Error loading friend posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return postDate.toLocaleDateString();
  };

  if (!visible) return null;

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      </Modal>
    );
  }

  if (posts.length === 0) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            {friendUsername} no tiene publicaciones recientes
            {selectedCity && ` en ${selectedCity.name}`}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const currentPost = posts[currentIndex];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {currentIndex < posts.length - 1 && (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Ionicons name="chevron-forward" size={32} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Story content */}
        <View style={styles.storyContainer}>
          {/* Progress bars */}
          <View style={styles.progressContainer}>
            {posts.map((_, index) => (
              <View key={index} style={styles.progressBarBackground}>
                {index < currentIndex && (
                  <View style={[styles.progressBar, { width: '100%' }]} />
                )}
                {index === currentIndex && (
                  <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                )}
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {friendUsername.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.username}>{friendUsername}</Text>
                <View style={styles.metaInfo}>
                  <Ionicons name="time-outline" size={12} color="#fff9" />
                  <Text style={styles.timestamp}>
                    {formatTimestamp(currentPost.created_at)}
                  </Text>
                  <Ionicons 
                    name={currentPost.audience === 'friends_only' ? 'people' : 'globe'} 
                    size={12} 
                    color="#fff9" 
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Post content */}
          <View style={styles.content}>
            <Text style={styles.postText}>{currentPost.content}</Text>
          </View>

          {/* Footer */}
          {currentPost.city && (
            <View style={styles.footer}>
              <View style={styles.cityInfo}>
                <Text style={styles.cityText}>📍 {currentPost.city}</Text>
              </View>
              <Text style={styles.counter}>
                {currentIndex + 1} / {posts.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContainer: {
    width: width * 0.9,
    height: height * 0.75,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D9FF30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D9FF',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: '#fff9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  postText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 13,
    color: '#fff9',
  },
  counter: {
    fontSize: 11,
    color: '#fff7',
  },
  emptyText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  closeButton: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
