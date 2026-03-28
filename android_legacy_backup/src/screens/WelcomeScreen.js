import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, GraduationCap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://images.unsplash.com/photo-1523050335456-e6cc8390b46d?q=80&w=1471&auto=format&fit=crop';

export default function WelcomeScreen({ onStart, onForgotPassword, onLogin }) {
    const { colors, isDarkMode, shadows } = useTheme();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground
                source={{ uri: BG_IMAGE }}
                style={styles.backgroundImage}
            >
                <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(26, 39, 68, 0.85)' }]} />

                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <View style={styles.iconCircle}>
                                    <GraduationCap size={32} color="white" />
                                </View>
                                <Text style={styles.brand}>CustConnect</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: colors.primary }, shadows.sm]}>
                                <Text style={styles.badgeText}>v2.0 PREMIUM</Text>
                            </View>
                        </View>

                        <View style={styles.heroContainer}>
                            <Text style={styles.title}>Your Campus,{"\n"}Perfected.</Text>
                            <Text style={styles.subtitle}>
                                The ultimate ecosystem for student life. Access your tools, social feed, and resources in one premium space.
                            </Text>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity style={[styles.primaryButton, shadows.lg]} onPress={onStart} activeOpacity={0.8}>
                                <Text style={[styles.primaryButtonText, { color: colors.secondary }]}>Create Account</Text>
                                <ArrowRight size={20} color={colors.secondary} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryButton} onPress={onLogin} activeOpacity={0.7}>
                                <Text style={styles.secondaryButtonText}>Already a member? </Text>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.textButton} onPress={onForgotPassword}>
                                <Text style={styles.textButtonText}>Need technical support?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconCircle: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    brand: {
        fontSize: 30,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -1,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 0.5,
    },
    heroContainer: {
        marginVertical: 40,
    },
    title: {
        fontSize: 62,
        fontWeight: '900',
        color: 'white',
        lineHeight: 64,
        letterSpacing: -2.5,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 25,
        lineHeight: 28,
        fontWeight: '500',
    },
    footer: {
        gap: 18,
        marginBottom: 10,
    },
    primaryButton: {
        backgroundColor: 'white',
        paddingVertical: 20,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '900',
    },
    secondaryButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '500',
    },
    loginLink: {
        color: 'white',
        fontSize: 16,
        fontWeight: '900',
        textDecorationLine: 'underline',
    },
    textButton: {
        alignItems: 'center',
        marginTop: 5,
    },
    textButtonText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontWeight: '500',
    },
});
