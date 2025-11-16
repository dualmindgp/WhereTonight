import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';
import FriendStories from '../components/FriendStories';
import StoryViewer from '../components/StoryViewer';

const { width } = Dimensions.get('window');

interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  city: string;
  created_at: string;
  audience: 'public' | 'friends_only';
  likes_count?: number;
  comments_count?: number;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

interface SocialFeedScreenNewProps {
  userId?: string;
  selectedCity?: { name: string; lat: number; lng: number };
  onClose?: () => void;
}

export default function SocialFeedScreenNew({
  userId,
  selectedCity,
  onClose
}: SocialFeedScreenNewProps) {
  const toast = useToastContext();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [audience, setAudience] = useState<'public' | 'friends_only'>('public');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    if (selectedCity) {
      loadPosts();
    }
  }, [selectedCity, userId]);

  const loadPosts = async () => {
    if (!selectedCity) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('city', selectedCity.name)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set((data || []).map(p => p.user_id))];
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const userMap = new Map(usersData?.map(u => [u.id, u]) || []);

      const postsWithUsers = (data || []).map(post => ({
        ...post,
        user: userMap.get(post.user_id)
      }));

      setPosts(postsWithUsers);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error al cargar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedCity || !userId) {
      toast.error('Completa todos los campos');
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          content: newPostContent,
          city: selectedCity.name,
          city_lat: selectedCity.lat,
          city_lng: selectedCity.lng,
          audience
        });

      if (error) throw error;

      setNewPostContent('');
      setAudience('public');
      toast.success('Post publicado');
      await loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al publicar');
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post eliminado');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar post');
    }
  };

  const handleToggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handleStoryClick = (friendId: string, username: string) => {
    setSelectedFriend({ id: friendId, username });
  };

  const handleCreateStory = () => {
    setNewPostContent('');
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <View style={styles.container}>
      {/* Story Viewer Modal */}
      {selectedFriend && (
        <StoryViewer
          visible={!!selectedFriend}
          friendId={selectedFriend.id}
          friendUsername={selectedFriend.username}
          onClose={() => setSelectedFriend(null)}
          selectedCity={selectedCity}
        />
      )}

      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#0f0f1e']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            
            {/* Elegant Social Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Social</Text>
              <LinearGradient
                colors={['#FF1493', '#00D9FF', '#FF1493']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleUnderline}
              />
              <Text style={styles.subtitle}>Conecta con tu ciudad</Text>
            </View>

            {/* City Pill */}
            {selectedCity && (
              <View style={styles.cityPillWrapper}>
                <LinearGradient
                  colors={['#00D9FF', '#FF1493']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cityPillGradient}
                >
                  <View style={styles.cityPillInner}>
                    <Ionicons name="location" size={12} color="#00D9FF" />
                    <Text style={styles.cityPillText}>{selectedCity.name}</Text>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Friend Stories Section */}
      <View style={styles.storiesSection}>
        <FriendStories
          userId={userId}
          selectedCity={selectedCity}
          onStoryClick={handleStoryClick}
          onCreateStory={handleCreateStory}
        />
      </View>

      {/* Main Feed Content */}
      <ScrollView 
        style={styles.feedScroll}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Create Post Card */}
        {userId && (
          <View style={styles.createPostWrapper}>
            <LinearGradient
              colors={['#0f0f1e', '#1a1a2e']}
              style={styles.createPostCard}
            >
              <View style={styles.createPostHeader}>
                <LinearGradient
                  colors={['#FF1493', '#00D9FF']}
                  style={styles.avatarGradient}
                >
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarEmoji}>✨</Text>
                  </View>
                </LinearGradient>
                <TextInput
                  style={styles.postInput}
                  placeholder="Comparte algo increíble..."
                  placeholderTextColor="#666"
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                  maxLength={280}
                />
              </View>

              {newPostContent.length > 0 && (
                <View style={styles.postActions}>
                  <View style={styles.audienceRow}>
                    <TouchableOpacity
                      style={[
                        styles.audienceChip,
                        audience === 'public' && styles.audienceChipActive
                      ]}
                      onPress={() => setAudience('public')}
                    >
                      <Ionicons 
                        name="globe-outline" 
                        size={14} 
                        color={audience === 'public' ? '#00D9FF' : '#666'}
                      />
                      <Text style={[
                        styles.audienceChipText,
                        audience === 'public' && styles.audienceChipTextActive
                      ]}>
                        Público
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.audienceChip,
                        audience === 'friends_only' && styles.audienceChipActive
                      ]}
                      onPress={() => setAudience('friends_only')}
                    >
                      <Ionicons 
                        name="people-outline" 
                        size={14} 
                        color={audience === 'friends_only' ? '#00D9FF' : '#666'}
                      />
                      <Text style={[
                        styles.audienceChipText,
                        audience === 'friends_only' && styles.audienceChipTextActive
                      ]}>
                        Amigos
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleCreatePost}
                    disabled={posting}
                  >
                    <LinearGradient
                      colors={['#FF1493', '#00D9FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.publishButton}
                    >
                      {posting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="send" size={16} color="#fff" />
                          <Text style={styles.publishButtonText}>Publicar</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCircle}>
              <LinearGradient
                colors={['#FF1493', '#00D9FF']}
                style={styles.loadingGradient}
              >
                <ActivityIndicator size="large" color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.loadingText}>Cargando experiencias...</Text>
          </View>
        ) : posts.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#FF149320', '#00D9FF20']}
              style={styles.emptyIconCircle}
            >
              <Ionicons name="sparkles-outline" size={48} color="#00D9FF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Tu feed está vacío</Text>
            <Text style={styles.emptyText}>
              Sé el primero en compartir algo increíble
              {selectedCity ? ` en ${selectedCity.name}` : ''}
            </Text>
            <TouchableOpacity onPress={() => setNewPostContent('')}>
              <LinearGradient
                colors={['#FF1493', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButton}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Crear post</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          /* Posts List */
          posts.map((item) => (
            <View key={item.id} style={styles.postCardWrapper}>
              <LinearGradient
                colors={['#0f0f1e', '#1a1a2e']}
                style={styles.postCard}
              >
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <View style={styles.userRow}>
                    <LinearGradient
                      colors={['#FF1493', '#00D9FF']}
                      style={styles.userAvatarGradient}
                    >
                      <View style={styles.userAvatarInner}>
                        <Text style={styles.userAvatarText}>
                          {item.user?.username?.charAt(0).toUpperCase() || '👤'}
                        </Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.user?.username || 'Usuario'}</Text>
                      <View style={styles.postMetaRow}>
                        <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
                        {item.audience === 'friends_only' && (
                          <View style={styles.privateBadge}>
                            <Ionicons name="lock-closed" size={10} color="#888" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {item.user_id === userId && (
                    <TouchableOpacity
                      onPress={() => handleDeletePost(item.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF1493" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Post Content */}
                <Text style={styles.postContent}>{item.content}</Text>

                {/* Post Actions */}
                <View style={styles.postFooter}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleLike(item.id)}
                  >
                    <Ionicons
                      name={likedPosts.has(item.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={likedPosts.has(item.id) ? '#FF1493' : '#666'}
                    />
                    <Text style={[
                      styles.actionButtonText,
                      likedPosts.has(item.id) && styles.actionButtonTextActive
                    ]}>
                      {item.likes_count || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#666" />
                    <Text style={styles.actionButtonText}>
                      {item.comments_count || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  headerGradient: {
    paddingBottom: 16,
  },
  headerSafe: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  cityPillWrapper: {
    padding: 1.5,
    borderRadius: 20,
  },
  cityPillGradient: {
    borderRadius: 20,
    padding: 1,
  },
  cityPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 19,
    gap: 4,
  },
  cityPillText: {
    color: '#00D9FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  storiesSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff08',
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    padding: 16,
    paddingBottom: 80,
  },
  createPostWrapper: {
    marginBottom: 16,
  },
  createPostCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  postInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    maxHeight: 120,
    minHeight: 44,
    paddingTop: 12,
  },
  postActions: {
    marginTop: 16,
    gap: 12,
  },
  audienceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  audienceChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff08',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  audienceChipActive: {
    backgroundColor: '#00D9FF15',
    borderColor: '#00D9FF40',
  },
  audienceChipText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  audienceChipTextActive: {
    color: '#00D9FF',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  postCardWrapper: {
    marginBottom: 16,
  },
  postCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userAvatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
  },
  userAvatarInner: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postTime: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  privateBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FF149315',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
    marginBottom: 14,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffffff08',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#FF1493',
  },
});
