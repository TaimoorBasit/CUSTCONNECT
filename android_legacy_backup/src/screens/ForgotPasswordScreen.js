import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    ImageBackground,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { authApi } from '../services/api';
import { Mail, ChevronLeft, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://images.unsplash.com/photo-1454165833767-1330084bc6f9?q=80&w=1470&auto=format&fit=crop';

export default function ForgotPasswordScreen({ onBack, onResetSent }) {
    const { colors, isDarkMode, shadows } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetRequest = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.forgotPassword(email);
            if (response.data.success) {
                Alert.alert(
                    "Check Your Email",
                    "If an account exists with this email, you will receive a password reset link shortly.",
                    [{ text: "OK", onPress: onBack }]
                );
            } else {
                Alert.alert("Error", response.data.message || "Failed to send reset link.");
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            const msg = error.response?.data?.message || "Check your internet connection.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: BG_IMAGE }}
                style={styles.backgroundImage}
            >
                <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(26, 39, 68, 0.85)' }]} />

                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flex}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <ChevronLeft stroke="white" size={28} />
                            </TouchableOpacity>

                            <View style={styles.content}>
                                <View style={styles.textHeader}>
                                    <Text style={styles.title}>Reset Access</Text>
                                    <Text style={styles.subtitle}>
                                        Enter your university email and we'll send you instructions to reset your password.
                                    </Text>
                                </View>

                                <View style={[styles.card, { backgroundColor: colors.surface }, shadows.lg]}>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>University Email</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <Mail size={20} color={colors.text.light} style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="j.doe@university.edu"
                                                placeholderTextColor={colors.text.light}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={email}
                                                onChangeText={setEmail}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
                                        onPress={handleResetRequest}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                                                <ArrowRight size={20} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    content: {
        flex: 1,
    },
    textHeader: {
        marginBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        lineHeight: 24,
    },
    card: {
        borderRadius: 30,
        padding: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
    },
    primaryButton: {
        borderRadius: 15,
        paddingVertical: 18,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
