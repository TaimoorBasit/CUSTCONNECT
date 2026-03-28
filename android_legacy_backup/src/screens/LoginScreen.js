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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ImageBackground,
    Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ChevronLeft
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const BG_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dee9b8?q=80&w=1470&auto=format&fit=crop';

export default function LoginScreen({ onLoginSuccess, onBack, onForgotPassword, onRegister }) {
    const { colors, isDarkMode, shadows, spacing } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Required Fields", "Please enter both your email and password.");
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.login(email, password);
            if (response.data.success) {
                await storage.saveToken(response.data.data.token);
                await storage.saveUser(response.data.data.user);
                onLoginSuccess(response.data.data.user);
            } else {
                Alert.alert("Login Failed", response.data.message || "Invalid credentials.");
            }
        } catch (error) {
            console.error('Login error:', error);
            const msg = error.response?.data?.message || "Ensure your server is running and reachable.";
            Alert.alert("Connection Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: BG_IMAGE }}
                style={styles.backgroundImage}
                blurRadius={2}
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
                                    <Text style={styles.title}>CustConnect</Text>
                                    <Text style={styles.subtitle}>Sign in to your student hub</Text>
                                </View>

                                <View style={[styles.card, { backgroundColor: colors.surface }, shadows.lg]}>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>Email Address</Text>
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

                                    <View style={styles.inputGroup}>
                                        <View style={styles.labelRow}>
                                            <Text style={[styles.label, { color: colors.secondary }]}>Password</Text>
                                            <TouchableOpacity onPress={onForgotPassword}>
                                                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <Lock size={20} color={colors.text.light} style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="••••••••"
                                                placeholderTextColor={colors.text.light}
                                                secureTextEntry={!showPassword}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowPassword(!showPassword)}
                                                style={styles.eyeBtn}
                                            >
                                                {showPassword ?
                                                    <EyeOff size={20} color={colors.text.light} /> :
                                                    <Eye size={20} color={colors.text.light} />
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && styles.disabledBtn]}
                                        onPress={handleLogin}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.loginBtnText}>Sign In</Text>
                                                <ArrowRight size={20} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>New to the portal? </Text>
                                    <TouchableOpacity onPress={onRegister}>
                                        <Text style={styles.registerLink}>Create Account</Text>
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
    },
    card: {
        borderRadius: 30,
        padding: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: 'bold',
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
    eyeBtn: {
        padding: 10,
    },
    loginBtn: {
        borderRadius: 15,
        paddingVertical: 18,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    loginBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
    },
    registerLink: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
