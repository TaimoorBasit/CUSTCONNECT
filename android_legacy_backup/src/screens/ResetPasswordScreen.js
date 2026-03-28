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
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop';

export default function ResetPasswordScreen({ onComplete }) {
    const { colors, isDarkMode, shadows } = useTheme();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                            <View style={styles.content}>
                                <View style={styles.textHeader}>
                                    <Text style={styles.title}>Secure Your Account</Text>
                                    <Text style={styles.subtitle}>
                                        Choose a strong password that you haven't used before.
                                    </Text>
                                </View>

                                <View style={[styles.card, { backgroundColor: colors.surface }, shadows.lg]}>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>New Password</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <Lock size={20} color={colors.text.light} style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="Min. 8 characters"
                                                placeholderTextColor={colors.text.light}
                                                secureTextEntry={!showPassword}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={20} color={colors.text.light} /> : <Eye size={20} color={colors.text.light} />}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>Confirm Password</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <Lock size={20} color={colors.text.light} style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="Repeat your password"
                                                placeholderTextColor={colors.text.light}
                                                secureTextEntry={!showPassword}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: colors.secondary }, loading && styles.disabledButton]}
                                        onPress={handleUpdate}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.primaryButtonText}>Update Password</Text>
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
        paddingTop: 60,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
    },
    textHeader: {
        marginBottom: 40,
    },
    title: {
        fontSize: 38,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -1,
        lineHeight: 44,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 10,
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
