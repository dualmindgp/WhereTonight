import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import { useToastContext } from '../contexts/ToastContext'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { Chrome } from 'lucide-react-native'
import { colors, spacing, borderRadius, fontSize } from '../styles/theme'

interface AuthScreenProps {
  onAuthSuccess?: () => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text.light,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  inputGroup: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.light,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.card,
    color: colors.text.light,
    borderWidth: 1,
    borderColor: colors.neon.blue,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.sm,
  },
  button: {
    width: '100%',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.neon.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#00d4ff80',
  },
  buttonText: {
    color: colors.text.light,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  toggleLink: {
    color: colors.neon.blue,
    fontWeight: 'bold',
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#00d4ff30',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#b0b0b0',
    fontSize: 12,
  },
})

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const toast = useToastContext()
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    console.log('🔐 [AuthScreen] Starting auth with:', email)
    setLoading(true)
    try {
      if (isSignUp) {
        console.log('📝 [AuthScreen] Signing up...')
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        })
        
        console.log('📝 [AuthScreen] SignUp result:', data, error)
        if (error) throw error
        toast.success('¡Cuenta creada! Revisa tu email para confirmar')
        setEmail('')
        setPassword('')
      } else {
        console.log('🔑 [AuthScreen] Signing in...')
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        console.log('🔑 [AuthScreen] SignIn result:', data.session ? 'SESSION OK' : 'NO SESSION', error)
        if (error) throw error
        
        console.log('✅ [AuthScreen] Login successful, session:', data.session?.user?.id)
        toast.success('¡Sesión iniciada correctamente!')
        
        // Pequeño delay para asegurar que la sesión se persista
        setTimeout(() => {
          console.log('✅ [AuthScreen] Calling onAuthSuccess callback')
          onAuthSuccess?.()
        }, 100)
      }
    } catch (err: any) {
      console.error('❌ [AuthScreen] Auth error:', err.message)
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

        {/* Google Sign In Button */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading || googleLoading}
          style={[styles.googleButton, (loading || googleLoading) && styles.buttonDisabled]}
        >
          {googleLoading ? (
            <ActivityIndicator color="#666" />
          ) : (
            <>
              <Chrome color="#666" size={20} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
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
