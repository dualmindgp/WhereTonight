import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  has_active_posts: boolean;
  last_post_time?: string;
}

interface FriendStoriesProps {
  userId?: string;
  selectedCity?: { name: string; lat: number; lng: number };
  onStoryClick: (friendId: string, username: string) => void;
  onCreateStory: () => void;
}

export default function FriendStories({ 
  userId, 
  selectedCity, 
  onStoryClick,
  onCreateStory 
}: FriendStoriesProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadFriendStories();
    }
  }, [userId, selectedCity]);

  const loadFriendStories = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Obtener amigos del usuario
      const { data: friendships, error: friendError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (friendError) {
        console.error('Error loading friendships:', friendError);
        return;
      }

      const friendIds: string[] = [];
      friendships?.forEach((f) => {
        if (f.user_id === userId) {
          friendIds.push(f.friend_id);
        } else {
          friendIds.push(f.user_id);
        }
      });

      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Obtener perfiles de amigos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Verificar quiénes tienen posts activos (últimas 24h)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      let postsQuery = supabase
        .from('social_posts')
        .select('user_id, created_at')
        .in('user_id', friendIds)
        .gte('created_at', twentyFourHoursAgo.toISOString());

      // Filtrar por ciudad si está seleccionada
      if (selectedCity) {
        postsQuery = postsQuery.eq('city', selectedCity.name);
      }

      const { data: activePosts } = await postsQuery;

      // Mapear amigos con información de posts activos
      const friendsWithPosts = profiles?.map((profile) => {
        const userPosts = activePosts?.filter((post) => post.user_id === profile.id) || [];
        const lastPost = userPosts.length > 0 
          ? userPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null;

        return {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          has_active_posts: userPosts.length > 0,
          last_post_time: lastPost?.created_at
        };
      }) || [];

      // Ordenar: primero los que tienen posts activos
      friendsWithPosts.sort((a, b) => {
        if (a.has_active_posts && !b.has_active_posts) return -1;
        if (!a.has_active_posts && b.has_active_posts) return 1;
        if (a.has_active_posts && b.has_active_posts) {
          return new Date(b.last_post_time!).getTime() - new Date(a.last_post_time!).getTime();
        }
        return a.username.localeCompare(b.username);
      });

      setFriends(friendsWithPosts);
    } catch (error) {
      console.error('Error loading friend stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tu historia/crear nueva publicación - FIRST */}
        <TouchableOpacity style={styles.storyItem} onPress={onCreateStory}>
          <LinearGradient
            colors={['#FF1493', '#00D9FF']}
            style={styles.createStoryGradient}
          >
            <View style={styles.createStoryInner}>
              <LinearGradient
                colors={['#0f0f1e', '#1a1a2e']}
                style={styles.createStoryButton}
              >
                <Ionicons name="add-circle" size={28} color="#00D9FF" />
              </LinearGradient>
            </View>
          </LinearGradient>
          <Text style={styles.createStoryText}>Tu historia</Text>
        </TouchableOpacity>

        {/* Stories de amigos */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#00D9FF" />
          </View>
        ) : (
          <>
            {friends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.storyItem}
                onPress={() => onStoryClick(friend.id, friend.username)}
              >
                {friend.has_active_posts ? (
                  <LinearGradient
                    colors={['#FF1493', '#9D4EDD', '#00D9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeStoryRing}
                  >
                    <View style={styles.storyAvatarInner}>
                      <LinearGradient
                        colors={['#0f0f1e', '#1a1a2e']}
                        style={styles.storyAvatar}
                      >
                        <Text style={styles.avatarText}>
                          {friend.username.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveStoryContainer}>
                    <LinearGradient
                      colors={['#0f0f1e', '#1a1a2e']}
                      style={styles.storyAvatar}
                    >
                      <Text style={styles.avatarTextInactive}>
                        {friend.username.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                  </View>
                )}
                <Text style={[
                  styles.storyUsername,
                  friend.has_active_posts && styles.activeStoryUsername
                ]} numberOfLines={1}>
                  {friend.username}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {!loading && friends.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Agrega amigos aquí
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff08',
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
    gap: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  createStoryGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2.5,
  },
  createStoryInner: {
    flex: 1,
    borderRadius: 32.5,
    backgroundColor: '#0a0a0f',
    padding: 2,
  },
  createStoryButton: {
    flex: 1,
    borderRadius: 30.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createStoryText: {
    fontSize: 11,
    color: '#00D9FF',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
    maxWidth: 70,
  },
  activeStoryRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 2.5,
  },
  storyAvatarInner: {
    flex: 1,
    borderRadius: 32.5,
    backgroundColor: '#0a0a0f',
    padding: 2,
  },
  storyAvatar: {
    flex: 1,
    borderRadius: 30.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveStoryContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ffffff15',
    padding: 2,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  avatarTextInactive: {
    fontSize: 20,
    fontWeight: '800',
    color: '#666',
  },
  storyUsername: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 70,
    fontWeight: '500',
  },
  activeStoryUsername: {
    color: '#00D9FF',
    fontWeight: '700',
  },
  loadingContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});
