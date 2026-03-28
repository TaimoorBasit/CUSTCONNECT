import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { resourcesApi } from '../services/api';
import {
    Search,
    ChevronLeft,
    UploadCloud,
    FileText,
    Download,
    BookOpen
} from 'lucide-react-native';

export default function ResourcesScreen({ onBack }) {
    const { colors, isDarkMode, shadows, spacing } = useTheme();
    const [search, setSearch] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await resourcesApi.getAll();
            setResources(response.data.resources || []);
        } catch (error) {
            console.error('Failed to fetch resources', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.resourceCard, { backgroundColor: colors.surface }, shadows.sm]}
            activeOpacity={0.7}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                <FileText color={colors.primary} size={24} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={[styles.resourceTitle, { color: colors.text.primary }]}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: colors.secondary + '15' }]}>
                        <Text style={[styles.badgeText, { color: colors.secondary }]}>{item.courseCode || 'GEN'}</Text>
                    </View>
                    <Text style={[styles.metaText, { color: colors.text.secondary }]}>{item.fileSize ? `${(item.fileSize / 1024).toFixed(1)}KB` : '0KB'}</Text>
                    <Text style={[styles.dot, { color: colors.text.light }]}>•</Text>
                    <Text style={[styles.metaText, { color: colors.text.secondary }]}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}</Text>
                </View>
            </View>
            <View style={[styles.downloadIcon, { backgroundColor: colors.primary }]}>
                <Download size={18} color="white" />
            </View>
        </TouchableOpacity>
    );

    const filteredResources = resources.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.courseCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }, shadows.sm]}>
                <TouchableOpacity onPress={onBack} style={[styles.headerBtn, { backgroundColor: colors.background }]}>
                    <ChevronLeft color={colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>University Library</Text>
                <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.background }]}>
                    <UploadCloud color={colors.text.primary} size={22} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { paddingHorizontal: 20, paddingTop: 20 }]}>
                <View style={[styles.searchWrapper, { backgroundColor: colors.surface }, shadows.sm]}>
                    <Search color={colors.text.light} size={20} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text.primary }]}
                        placeholder="Search resources..."
                        placeholderTextColor={colors.text.light}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Fetching knowledge...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredResources}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingHorizontal: 20, paddingTop: 20 }]}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeaderRow}>
                            <BookOpen size={20} color={colors.primary} />
                            <Text style={[styles.listHeader, { color: colors.text.primary }]}>Premium Resources</Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: colors.text.light }]}>No premium resources found.</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        zIndex: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    searchContainer: {
        zIndex: 5,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        paddingHorizontal: 15,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 40,
    },
    listHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    listHeader: {
        fontSize: 16,
        fontWeight: '900',
    },
    resourceCard: {
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    dot: {
        marginHorizontal: 8,
    },
    downloadIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
    }
});
