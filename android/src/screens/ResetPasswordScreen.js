import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme';

export default function ResetPasswordScreen({ onComplete }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            // Mocking success
            setTimeout(() => {
                setLoading(false);
                Alert.alert("Success", "Password updated successfully!");
                onComplete();
            }, 1000);
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", error.message || "Failed to update password.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Secure Your Account</Text>
                    <Text style={styles.subtitle}>
                        Choose a strong password that you haven't used before.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Min. 8 characters"
                            placeholderTextColor={theme.colors.text.light}
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Repeat your password"
                            placeholderTextColor={theme.colors.text.light}
                            secureTextEntry={true}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.disabledButton]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Update Password</Text>
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
    header: {
        marginTop: theme.spacing.xl,
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
        backgroundColor: theme.colors.secondary,
        paddingVertical: 18,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        shadowColor: theme.colors.secondary,
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
