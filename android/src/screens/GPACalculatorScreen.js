import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { theme } from '../theme';

const grades = [
    { grade: 'A+', points: 4.0 }, { grade: 'A', points: 4.0 }, { grade: 'A-', points: 3.7 },
    { grade: 'B+', points: 3.3 }, { grade: 'B', points: 3.0 }, { grade: 'B-', points: 2.7 },
    { grade: 'C+', points: 2.3 }, { grade: 'C', points: 2.0 }, { grade: 'C-', points: 1.7 },
    { grade: 'D+', points: 1.3 }, { grade: 'D', points: 1.0 }, { grade: 'F', points: 0.0 },
];

export default function GPACalculatorScreen({ onBack }) {
    const [subjects, setSubjects] = useState([{ name: '', credits: 3, grade: 'A' }]);

    const addSubject = () => {
        setSubjects([...subjects, { name: '', credits: 3, grade: 'A' }]);
    };

    const removeSubject = (index) => {
        if (subjects.length === 1) return;
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    const updateSubject = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    const currentGPA = useMemo(() => {
        let totalPoints = 0;
        let totalCredits = 0;
        subjects.forEach((s) => {
            const gradeObj = grades.find((g) => g.grade === s.grade);
            const points = gradeObj ? gradeObj.points : 0;
            totalPoints += points * parseFloat(s.credits || 0);
            totalCredits += parseFloat(s.credits || 0);
        });
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    }, [subjects]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backBtn}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>GPA Calculator</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.resultBanner}>
                <Text style={styles.resultLabel}>Semester GPA</Text>
                <Text style={styles.resultValue}>{currentGPA}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Current Subjects</Text>
                        <TouchableOpacity onPress={addSubject} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>+ Add Course</Text>
                        </TouchableOpacity>
                    </View>

                    {subjects.map((subject, index) => (
                        <View key={index} style={styles.subjectRow}>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Course Name"
                                    value={subject.name}
                                    onChangeText={(text) => updateSubject(index, 'name', text)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cr"
                                    keyboardType="numeric"
                                    value={subject.credits.toString()}
                                    onChangeText={(text) => updateSubject(index, 'credits', text)}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.gradeSelect}
                                onPress={() => {
                                    const nextGradeIdx = (grades.findIndex(g => g.grade === subject.grade) + 1) % grades.length;
                                    updateSubject(index, 'grade', grades[nextGradeIdx].grade);
                                }}
                            >
                                <Text style={styles.gradeText}>{subject.grade}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeSubject(index)} style={styles.removeBtn}>
                                <Text style={styles.removeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert("Saved", "GPA record saved to history.")}>
                    <Text style={styles.saveBtnText}>Save Record</Text>
                </TouchableOpacity>
            </View>
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
    resultBanner: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    resultLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    resultValue: {
        color: 'white',
        fontSize: 48,
        fontWeight: '900',
    },
    scrollContent: {
        padding: theme.spacing.md,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: theme.roundness.lg,
        padding: theme.spacing.md,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    },
    addBtn: {
        backgroundColor: theme.colors.secondary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.roundness.full,
    },
    addBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    },
    subjectRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.roundness.md,
        padding: 10,
        fontSize: 14,
        color: theme.colors.secondary,
    },
    gradeSelect: {
        width: 45,
        height: 40,
        backgroundColor: theme.colors.secondary,
        borderRadius: theme.roundness.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    removeBtn: {
        padding: 5,
    },
    removeBtnText: {
        color: theme.colors.text.light,
        fontSize: 18,
    },
    footer: {
        padding: theme.spacing.lg,
        backgroundColor: 'white',
    },
    saveBtn: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: 16,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
