import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onStart, onForgotPassword, onLogin }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.brand}>CustConnect</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>University Portal</Text>
                    </View>
                </View>

                <View style={styles.heroContainer}>
                    <Text style={styles.title}>Your Campus,{"\n"}Simplified.</Text>
                    <Text style={styles.subtitle}>
                        Access resources, track your grades, and connect with your university community in one place.
                    </Text>
                </View>

                <View style={styles.illustrationContainer}>
                    {/* In a real app, use an SVG or Image here */}
                    <View style={styles.placeholderLogo}>
                        <Text style={styles.logoText}>C</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={onStart}>
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onLogin}>
                        <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.textButton} onPress={onForgotPassword}>
                        <Text style={styles.textButtonText}>Forgot Password?</Text>
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
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.md,
    },
    brand: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.primary,
        letterSpacing: -0.5,
    },
    badge: {
        backgroundColor: theme.colors.secondary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.roundness.full,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        textTransform: 'uppercase',
    },
    heroContainer: {
        marginTop: theme.spacing.xl,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.secondary,
        lineHeight: 52,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.md,
        lineHeight: 24,
        fontFamily: 'System',
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    placeholderLogo: {
        width: 120,
        height: 120,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 10,
    },
    logoText: {
        fontSize: 60,
        fontWeight: '900',
        color: 'white',
    },
    footer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
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
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
    textButton: {
        alignItems: 'center',
    },
    textButtonText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
