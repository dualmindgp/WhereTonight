import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import { useToastContext } from '../contexts/ToastContext'

interface AuthScreenProps {
  onAuthSuccess?: () => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1f3a',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#00d4ff',
    borderRadius: 8,
    fontSize: 14,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#00d4ff80',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  toggleLink: {
    color: '#00d4ff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
})

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const toast = useToastContext()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        toast.success('¡Cuenta creada! Revisa tu email para confirmar')
        setEmail('')
        setPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        toast.success('¡Sesión iniciada correctamente!')
        onAuthSuccess?.()
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>WhereTonight</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={[styles.inputGroup, { marginBottom: 24 }]}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            editable={!loading}
          />
        </View>

        {/* Auth Button */}
        <TouchableOpacity
          onPress={handleEmailAuth}
          disabled={loading}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle Sign Up / Sign In */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isSignUp ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={loading}>
            <Text style={styles.toggleLink}>
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}
