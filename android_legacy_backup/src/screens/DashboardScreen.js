import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Platform
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
    Home,
    BookOpen,
    Plus,
    BarChart3,
    User,
    MessageSquare,
    Bus,
    Bell,
    TrendingUp,
    Moon,
    Sun
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ActionCard = ({ title, icon, color, description, onPress, colors, shadowStyle }) => (
    <TouchableOpacity
        style={[styles.card, { borderTopColor: color, borderTopWidth: 3, backgroundColor: colors.surface }, shadowStyle]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.cardHeaderRow}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                {icon}
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{title}</Text>
                <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>{description}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

export default function DashboardScreen({ user, onNavigate, onLogout }) {
    const { colors, isDarkMode, toggleTheme, shadows, spacing } = useTheme();
    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'AJ';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.text.secondary }]}>Good Morning,</Text>
                        <Text style={[styles.userName, { color: colors.text.primary }]}>{user?.firstName || 'Student'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.surface }, shadows.sm]}
                        >
                            <Bell size={24} color={colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.profileAvatar, { backgroundColor: colors.primary }]}
                            onPress={onLogout}
                        >
                            <Text style={styles.avatarText}>{initials}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* CGPA Banner */}
                <View style={[styles.banner, { backgroundColor: isDarkMode ? colors.surface : colors.secondary }, shadows.lg]}>
                    <View style={styles.bannerLeft}>
                        <View style={styles.standingBadge}>
                            <TrendingUp size={12} color="white" />
                            <Text style={styles.standingText}>DEAN'S LIST</Text>
                        </View>
                        <Text style={styles.bannerValue}>3.85</Text>
                        <Text style={[styles.bannerLabel, { color: isDarkMode ? colors.text.secondary : 'rgba(255,255,255,0.5)' }]}>Current Cumulative GPA</Text>
                    </View>
                    <View style={styles.bannerRight}>
                        <View style={[styles.progressCircle, { borderTopColor: colors.primaryLight }]}>
                            <Text style={styles.progressText}>92%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Quick Actions</Text>
                    <TouchableOpacity>
                        <Text style={[styles.viewAllText, { color: colors.primary }]}>Customize</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    <View style={styles.gridRow}>
                        <ActionCard
                            title="GPA Calc"
                            icon={<BarChart3 size={22} color={colors.primary} />}
                            color={colors.primary}
                            description="Track Performance"
                            onPress={() => onNavigate('gpa')}
                            colors={colors}
                            shadowStyle={shadows.sm}
                        />
                        <ActionCard
                            title="Library"
                            icon={<BookOpen size={22} color={colors.secondary} />}
                            color={colors.secondary}
                            description="Digital Assets"
                            onPress={() => onNavigate('resources')}
                            colors={colors}
                            shadowStyle={shadows.sm}
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <ActionCard
                            title="Social"
                            icon={<MessageSquare size={22} color={colors.accent} />}
                            color={colors.accent}
                            description="Campus Feed"
                            colors={colors}
                            shadowStyle={shadows.sm}
                        />
                        <ActionCard
                            title="Transport"
                            icon={<Bus size={22} color="#D97706" />}
                            color="#D97706"
                            description="Live Tracking"
                            colors={colors}
                            shadowStyle={shadows.sm}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Academic Status</Text>
                <View style={[styles.updateCard, { backgroundColor: colors.surface }, shadows.sm]}>
                    <View style={[styles.updateIconBox, { backgroundColor: isDarkMode ? colors.background : '#FFFBEB' }]}>
                        <Bell size={20} color={isDarkMode ? colors.primary : "#92400E"} />
                    </View>
                    <View style={styles.updateInfo}>
                        <Text style={[styles.updateText, { color: colors.text.primary }]}>Midterm schedules are now available for Spring 2026.</Text>
                        <Text style={[styles.updateTime, { color: colors.text.light }]}>Posted 2h ago</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBarContainer}>
                <View style={[styles.tabBar, { backgroundColor: colors.surface }, shadows.lg]}>
                    <TouchableOpacity style={styles.tabItem}>
                        <Home size={24} color={colors.primary} />
                        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate('resources')}>
                        <BookOpen size={24} color={colors.text.light} />
                    </TouchableOpacity>

                    <View style={styles.centerTab}>
                        <TouchableOpacity style={[styles.centerTabButton, { backgroundColor: colors.secondary, borderColor: colors.background }]} activeOpacity={0.8}>
                            <Plus size={32} color={isDarkMode ? colors.background : "white"} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate('gpa')}>
                        <BarChart3 size={24} color={colors.text.light} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabItem} onPress={onLogout}>
                        <User size={24} color={colors.text.light} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        // padding set dynamically
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 14,
        fontWeight: '600',
    },
    userName: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    profileAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    avatarText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
    },
    banner: {
        borderRadius: 35,
        padding: 30,
        marginBottom: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bannerLeft: {
        flex: 1,
        zIndex: 2,
    },
    bannerLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    bannerValue: {
        color: 'white',
        fontSize: 50,
        fontWeight: '900',
        marginVertical: 4,
    },
    standingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    standingText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    bannerRight: {
        zIndex: 2,
    },
    progressCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    grid: {
        gap: 15,
        marginBottom: 35,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 15,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    cardDescription: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '500',
    },
    tabBarContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 35 : 20,
        left: 20,
        right: 20,
    },
    tabBar: {
        height: 85,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 15,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 6,
    },
    centerTab: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerTabButton: {
        width: 64,
        height: 64,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -55,
        borderWidth: 5,
    },
    updateCard: {
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    updateIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateInfo: {
        flex: 1,
    },
    updateText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    updateTime: {
        fontSize: 11,
        marginTop: 6,
        fontWeight: 'bold',
    }
});
