import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../theme';

export default function LoginScreen({ onLoginSuccess, onBack, onForgotPassword, onRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            // Mocking success for UI demonstration
            setTimeout(() => {
                setLoading(false);
                onLoginSuccess();
            }, 1000);
        } catch (error) {
            setLoading(false);
            Alert.alert("Login Failed", error.message || "Invalid credentials.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue to your university portal</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email / Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.colors.text.light}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <TouchableOpacity onPress={onForgotPassword}>
                                    <Text style={styles.forgotText}>Forgot?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter your password"
                                    placeholderTextColor={theme.colors.text.light}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? '👁ï¸' : '🙈'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={onRegister}>
                                <Text style={styles.linkText}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
    },
    backButton: {
        marginBottom: theme.spacing.xl,
    },
    backText: {
        fontSize: 16,
        color: theme.colors.secondary,
        fontWeight: '600',
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: theme.colors.secondary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    form: {
        gap: theme.spacing.xl,
    },
    inputContainer: {
        gap: theme.spacing.sm,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        marginLeft: 4,
    },
    forgotText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: theme.roundness.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 16,
        fontSize: 16,
        color: theme.colors.secondary,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    passwordWrapper: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: theme.roundness.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 16,
        fontSize: 16,
        color: theme.colors.secondary,
    },
    eyeButton: {
        paddingHorizontal: theme.spacing.md,
    },
    eyeIcon: {
        fontSize: 18,
    },
    primaryButton: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: 18,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
        marginTop: theme.spacing.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.md,
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    linkText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
