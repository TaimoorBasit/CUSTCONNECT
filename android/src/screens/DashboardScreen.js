import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const ActionCard = ({ title, icon, color, description, onPress }) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
            <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
        </View>
    </TouchableOpacity>
);

export default function DashboardScreen({ onNavigate, onLogout }) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Morning,</Text>
                        <Text style={styles.userName}>Alex Johnson</Text>
                    </View>
                    <TouchableOpacity style={styles.profileAvatar} onPress={onLogout}>
                        <Text style={styles.avatarText}>AJ</Text>
                    </TouchableOpacity>
                </View>

                {/* CGPA Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerLabel}>Current CGPA</Text>
                        <Text style={styles.bannerValue}>3.85</Text>
                        <View style={styles.standingBadge}>
                            <Text style={styles.standingText}>Outstanding</Text>
                        </View>
                    </View>
                    <View style={styles.bannerDeco} />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.grid}>
                    <ActionCard
                        title="GPA Calculator"
                        icon="📊"
                        color="#A51C30"
                        description="Track your performance"
                        onPress={() => onNavigate('gpa')}
                    />
                    <ActionCard
                        title="Resources"
                        icon="📚"
                        color="#1a2744"
                        description="Download course notes"
                        onPress={() => onNavigate('resources')}
                    />
                    <ActionCard
                        title="Social Feed"
                        icon="💬"
                        color="#059669"
                        description="Connect with peers"
                    />
                    <ActionCard
                        title="Bus Schedule"
                        icon="🚌"
                        color="#d97706"
                        description="View route timings"
                    />
                </View>

                <Text style={styles.sectionTitle}>Recent Updates</Text>
                <View style={styles.updateCard}>
                    <Text style={styles.updateText}>Midterm schedules have been posted for the Department of Computing.</Text>
                    <Text style={styles.updateTime}>2 hours ago</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    greeting: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.secondary,
    },
    profileAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
    },
    banner: {
        backgroundColor: theme.colors.secondary,
        borderRadius: theme.roundness.lg,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        overflow: 'hidden',
        position: 'relative',
    },
    bannerContent: {
        zIndex: 1,
    },
    bannerLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bannerValue: {
        color: 'white',
        fontSize: 42,
        fontWeight: '900',
        marginVertical: theme.spacing.xs,
    },
    standingBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.roundness.full,
    },
    standingText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    bannerDeco: {
        position: 'absolute',
        right: -50,
        top: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: theme.colors.secondary,
        marginBottom: theme.spacing.md,
    },
    grid: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness.md,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    },
    cardDescription: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    updateCard: {
        backgroundColor: '#FFFBEB',
        padding: theme.spacing.md,
        borderRadius: theme.roundness.md,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    updateText: {
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
    updateTime: {
        fontSize: 10,
        color: '#D97706',
        marginTop: 8,
        fontWeight: 'bold',
    }
});
