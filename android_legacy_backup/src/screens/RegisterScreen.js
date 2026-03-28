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
import {
    User,
    Mail,
    Lock,
    IdCard,
    ArrowRight,
    ChevronLeft,
    Eye,
    EyeOff
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://images.unsplash.com/photo-1523050335456-e6cc8390b46d?q=80&w=1471&auto=format&fit=crop';

export default function RegisterScreen({ onRegisterSuccess, onBack, onLogin }) {
    const { colors, isDarkMode, shadows } = useTheme();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        studentId: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        const { firstName, lastName, email, password } = formData;
        if (!firstName || !lastName || !email || !password) {
            Alert.alert("Required Fields", "Please fill in all mandatory fields.");
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.register(formData);
            if (response.data.success) {
                Alert.alert(
                    "Account Created",
                    "Please check your university email for the verification code.",
                    [{ text: "OK", onPress: onRegisterSuccess }]
                );
            } else {
                Alert.alert("Registration Failed", response.data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error('Registration error:', error);
            const msg = error.response?.data?.message || "Ensure your server is running.";
            Alert.alert("Registration Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: BG_IMAGE }}
                style={styles.backgroundImage}
            >
                <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(26, 39, 68, 0.9)' }]} />

                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flex}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                                <ChevronLeft stroke="white" size={28} />
                            </TouchableOpacity>

                            <View style={styles.content}>
                                <View style={styles.textHeader}>
                                    <Text style={styles.title}>Join Us</Text>
                                    <Text style={styles.subtitle}>Unlock your premium campus experience</Text>
                                </View>

                                <View style={[styles.card, { backgroundColor: colors.surface }, shadows.lg]}>
                                    <View style={styles.row}>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: colors.secondary }]}>First Name</Text>
                                            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                                <User size={18} color={colors.text.light} />
                                                <TextInput
                                                    style={[styles.input, { color: colors.text.primary }]}
                                                    placeholder="John"
                                                    placeholderTextColor={colors.text.light}
                                                    value={formData.firstName}
                                                    onChangeText={(v) => updateForm('firstName', v)}
                                                />
                                            </View>
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                                            <Text style={[styles.label, { color: colors.secondary }]}>Last Name</Text>
                                            <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                                <TextInput
                                                    style={[styles.input, { color: colors.text.primary }]}
                                                    placeholder="Doe"
                                                    placeholderTextColor={colors.text.light}
                                                    value={formData.lastName}
                                                    onChangeText={(v) => updateForm('lastName', v)}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>University Email</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <Mail size={18} color={colors.text.light} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="j.doe@university.edu"
                                                placeholderTextColor={colors.text.light}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={formData.email}
                                                onChangeText={(v) => updateForm('email', v)}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>Student ID (Optional)</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <IdCard size={18} color={colors.text.light} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="2024-ABC-123"
                                                placeholderTextColor={colors.text.light}
                                                autoCapitalize="characters"
                                                value={formData.studentId}
                                                onChangeText={(v) => updateForm('studentId', v)}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.secondary }]}>Create Password</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? colors.background : '#F7FAFC', borderColor: colors.border }]}>
                                            <Lock size={18} color={colors.text.light} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="••••••••"
                                                placeholderTextColor={colors.text.light}
                                                secureTextEntry={!showPassword}
                                                value={formData.password}
                                                onChangeText={(v) => updateForm('password', v)}
                                            />
                                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={18} color={colors.text.light} /> : <Eye size={18} color={colors.text.light} />}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
                                        onPress={handleRegister}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.primaryButtonText}>Create Account</Text>
                                                <ArrowRight size={20} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>Already have an account? </Text>
                                    <TouchableOpacity onPress={onLogin}>
                                        <Text style={styles.linkText}>Sign In</Text>
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
        width: width,
        height: height,
        flex: 1,
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
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    content: {
        flex: 1,
    },
    textHeader: {
        marginBottom: 30,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 5,
    },
    card: {
        borderRadius: 30,
        padding: 25,
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        borderWidth: 1,
        paddingHorizontal: 12,
        gap: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
    },
    primaryButton: {
        borderRadius: 15,
        paddingVertical: 18,
        marginTop: 10,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    footerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
    },
    linkText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
