import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { theme } from '../theme';

const MOCK_RESOURCES = [
    { id: '1', title: 'Calculus III Notes', type: 'PDF', size: '2.4MB', department: 'CS', date: 'Oct 24, 2025' },
    { id: '2', title: 'Data Structures Cheat Sheet', type: 'IMAGE', size: '1.1MB', department: 'CS', date: 'Nov 12, 2025' },
    { id: '3', title: 'Economics 101 Midterm', type: 'DOCX', size: '0.8MB', department: 'BUS', date: 'Dec 02, 2025' },
    { id: '4', title: 'Physics Lab Report Guide', type: 'PDF', size: '3.1MB', department: 'SCI', date: 'Jan 10, 2026' },
];

export default function ResourcesScreen({ onBack }) {
    const [search, setSearch] = useState('');

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.iconBox}>
                <Text style={styles.iconText}>{item.type[0]}</Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.resourceTitle}>{item.title}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{item.department}</Text>
                    <Text style={styles.dot}>â€¢</Text>
                    <Text style={styles.metaText}>{item.size}</Text>
                    <Text style={styles.dot}>â€¢</Text>
                    <Text style={styles.metaText}>{item.date}</Text>
                </View>
            </View>
            <View style={styles.downloadIcon}>
                <Text>â¬ï¸</Text>
            </View>
        </TouchableOpacity>
    );

    const filteredResources = MOCK_RESOURCES.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backBtn}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>University Library</Text>
                <TouchableOpacity style={styles.uploadBtn}>
                    <Text>☁️</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search resources by title or code..."
                    placeholderTextColor={theme.colors.text.light}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={filteredResources}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <Text style={styles.listHeader}>Recent Resources</Text>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No resources found matching your search.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        backgroundColor: 'white',
    },
    backBtn: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: theme.colors.secondary,
    },
    uploadBtn: {
        padding: 5,
    },
    searchContainer: {
        padding: theme.spacing.md,
    },
    searchInput: {
        backgroundColor: 'white',
        borderRadius: theme.roundness.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        fontSize: 14,
        color: theme.colors.secondary,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    listHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.md,
    },
    resourceCard: {
        backgroundColor: 'white',
        borderRadius: theme.roundness.md,
        padding: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: theme.colors.secondary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: theme.colors.secondary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    cardInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    dot: {
        marginHorizontal: 5,
        color: theme.colors.text.light,
        fontSize: 12,
    },
    downloadIcon: {
        marginLeft: theme.spacing.sm,
    },
    emptyState: {
        padding: theme.spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.text.light,
        textAlign: 'center',
    }
});
