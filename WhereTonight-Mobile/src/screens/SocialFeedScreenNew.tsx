import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';

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

      // Obtener información de usuarios
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitle}>
          <Ionicons name="chatbubbles" size={24} color="#00D9FF" />
          <Text style={styles.title}>Feed Social</Text>
        </View>
        {selectedCity && (
          <View style={styles.cityBadge}>
            <Text style={styles.cityBadgeText}>{selectedCity.name}</Text>
          </View>
        )}
      </View>

      {/* Create Post */}
      {userId && (
        <View style={styles.createPostContainer}>
          <View style={styles.createPostCard}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <TextInput
              style={styles.postInput}
              placeholder="¿Qué está pasando en la ciudad?"
              placeholderTextColor="#666"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              maxLength={280}
            />
          </View>

          {newPostContent.length > 0 && (
            <View style={styles.postActions}>
              <View style={styles.audienceSelector}>
                <TouchableOpacity
                  style={[
                    styles.audienceButton,
                    audience === 'public' && styles.audienceButtonActive
                  ]}
                  onPress={() => setAudience('public')}
                >
                  <Ionicons 
                    name="globe" 
                    size={16} 
                    color={audience === 'public' ? '#00D9FF' : '#888'}
                  />
                  <Text style={[
                    styles.audienceButtonText,
                    audience === 'public' && styles.audienceButtonTextActive
                  ]}>
                    Público
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.audienceButton,
                    audience === 'friends_only' && styles.audienceButtonActive
                  ]}
                  onPress={() => setAudience('friends_only')}
                >
                  <Ionicons 
                    name="people" 
                    size={16} 
                    color={audience === 'friends_only' ? '#00D9FF' : '#888'}
                  />
                  <Text style={[
                    styles.audienceButtonText,
                    audience === 'friends_only' && styles.audienceButtonTextActive
                  ]}>
                    Amigos
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.publishButton}
                onPress={handleCreatePost}
                disabled={posting}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#000" />
                    <Text style={styles.publishButtonText}>Publicar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Posts Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Cargando posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#00D9FF30" />
          <Text style={styles.emptyTitle}>Sin posts</Text>
          <Text style={styles.emptyText}>Sé el primero en compartir qué está pasando</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {item.user?.username?.charAt(0).toUpperCase() || '👤'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.user?.username || 'Usuario'}</Text>
                    <View style={styles.postMeta}>
                      <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
                      {item.audience === 'friends_only' && (
                        <Ionicons name="lock-closed" size={12} color="#888" />
                      )}
                    </View>
                  </View>
                </View>

                {item.user_id === userId && (
                  <TouchableOpacity
                    onPress={() => handleDeletePost(item.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={18} color="#FF1493" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.postContent}>{item.content}</Text>

              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleLike(item.id)}
                >
                  <Ionicons
                    name={likedPosts.has(item.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={likedPosts.has(item.id) ? '#FF1493' : '#888'}
                  />
                  <Text style={styles.actionButtonText}>
                    {item.likes_count || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={18} color="#888" />
                  <Text style={styles.actionButtonText}>
                    {item.comments_count || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={18} color="#888" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.feedContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00D9FF10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cityBadge: {
    backgroundColor: '#00D9FF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D9FF40',
  },
  cityBadgeText: {
    color: '#00D9FF',
    fontSize: 12,
    fontWeight: '600',
  },
  createPostContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF10',
  },
  createPostCard: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00D9FF20',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D9FF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  postInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  postActions: {
    marginTop: 12,
    gap: 8,
  },
  audienceSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  audienceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D9FF30',
    backgroundColor: 'transparent',
    gap: 6,
  },
  audienceButtonActive: {
    backgroundColor: '#00D9FF20',
    borderColor: '#00D9FF',
  },
  audienceButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  audienceButtonTextActive: {
    color: '#00D9FF',
  },
  publishButton: {
    flexDirection: 'row',
    backgroundColor: '#00D9FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  publishButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  feedContent: {
    padding: 12,
  },
  postCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00D9FF20',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D9FF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF149310',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00D9FF10',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
});
