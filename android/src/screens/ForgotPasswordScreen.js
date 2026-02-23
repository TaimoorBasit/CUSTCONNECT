import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme';

export default function ForgotPasswordScreen({ onBack, onResetSent }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            // In a real app, call the API here
            // await authService.forgotPassword(email);

            // Mocking success
            setTimeout(() => {
                setLoading(false);
                Alert.alert("Success", "Reset link sent to your email!");
                onResetSent();
            }, 1000);
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", error.message || "Failed to send reset link.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your university email and we'll send you instructions to reset your password.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>University Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. j.doe@university.edu"
                            placeholderTextColor={theme.colors.text.light}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.disabledButton]}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
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
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: theme.colors.secondary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        lineHeight: 24,
    },
    form: {
        gap: theme.spacing.xl,
    },
    inputContainer: {
        gap: theme.spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        marginLeft: 4,
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
    primaryButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
