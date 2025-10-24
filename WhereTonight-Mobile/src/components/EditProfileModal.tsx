import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentProfile: {
    id: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
  };
  onProfileUpdated: () => void;
}

export default function EditProfileModal({
  isVisible,
  onClose,
  currentProfile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const toast = useToastContext();
  const [username, setUsername] = useState(currentProfile.username || '');
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('💾 [EditProfile] Saving profile...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('id', currentProfile.id);

      if (updateError) {
        console.error('❌ [EditProfile] Error:', updateError);
        setError(updateError.message);
        toast.error('Error al actualizar el perfil');
        return;
      }

      console.log('✅ [EditProfile] Profile updated successfully');
      toast.success('Perfil actualizado correctamente');
      onProfileUpdated();
      onClose();
    } catch (error: any) {
      console.error('❌ [EditProfile] Error:', error);
      setError(error.message);
      toast.error('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Editar Perfil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#b0b0b0" size={24} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Avatar placeholder */}
            <View style={styles.avatarSection}>
              {currentProfile.avatar_url ? (
                <Image source={{ uri: currentProfile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>
                    {username.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} disabled>
                <Camera color="#ffffff" size={16} />
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Subida de imágenes próximamente</Text>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                maxLength={30}
                style={styles.input}
                placeholder="tu_nombre"
                placeholderTextColor="#666"
                editable={!loading}
              />
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Biografía</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                maxLength={160}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor="#666"
                editable={!loading}
              />
              <Text style={styles.charCount}>{bio.length}/160</Text>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1f3a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00d9ff30',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D9FF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#00d9ff30',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 28,
    right: '35%',
    backgroundColor: '#00D9FF',
    padding: 8,
    borderRadius: 16,
  },
  avatarHint: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#0a0e27',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#00d9ff30',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#b0b0b0',
    textAlign: 'right',
  },
  errorContainer: {
    backgroundColor: '#ff008030',
    borderWidth: 1,
    borderColor: '#ff008050',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#ff0080',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#00d9ff30',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#0a0e27',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#00D9FF',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
