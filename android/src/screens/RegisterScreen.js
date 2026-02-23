import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../theme';

export default function RegisterScreen({ onRegisterSuccess, onBack, onLogin }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        studentId: '',
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const { firstName, lastName, email, password } = formData;
        if (!firstName || !lastName || !email || !password) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Mocking success
            setTimeout(() => {
                setLoading(false);
                Alert.alert("Success", "Account created! Please verify your email.");
                onRegisterSuccess();
            }, 1000);
        } catch (error) {
            setLoading(false);
            Alert.alert("Registration Failed", error.message || "Something went wrong.");
        }
    };

    const updateForm = (field, value) => {
        setFormData({ ...formData, [field]: value });
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
                        <Text style={styles.title}>Join Us</Text>
                        <Text style={styles.subtitle}>Create your student account to get started</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChangeText={(v) => updateForm('firstName', v)}
                                />
                            </View>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChangeText={(v) => updateForm('lastName', v)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>University Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="j.doe@university.edu"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(v) => updateForm('email', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Student ID (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 2024-ABC-123"
                                autoCapitalize="characters"
                                value={formData.studentId}
                                onChangeText={(v) => updateForm('studentId', v)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Min. 8 characters"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(v) => updateForm('password', v)}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={onLogin}>
                                <Text style={styles.linkText}>Login</Text>
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
        marginBottom: theme.spacing.xl,
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
        gap: theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    inputContainer: {
        gap: theme.spacing.xs,
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
        paddingVertical: 14,
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
        marginBottom: theme.spacing.xl,
    },
    footerText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    linkText: {
        color: theme.colors.secondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
