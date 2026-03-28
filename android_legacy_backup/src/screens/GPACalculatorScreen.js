import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { gpaApi } from '../services/api';
import { ChevronLeft, Plus, Trash2, Save, GraduationCap } from 'lucide-react-native';

const grades = [
    { grade: 'A+', points: 4.0 }, { grade: 'A', points: 4.0 }, { grade: 'A-', points: 3.7 },
    { grade: 'B+', points: 3.3 }, { grade: 'B', points: 3.0 }, { grade: 'B-', points: 2.7 },
    { grade: 'C+', points: 2.3 }, { grade: 'C', points: 2.0 }, { grade: 'C-', points: 1.7 },
    { grade: 'D+', points: 1.3 }, { grade: 'D', points: 1.0 }, { grade: 'F', points: 0.0 },
];

export default function GPACalculatorScreen({ onBack }) {
    const { colors, isDarkMode, shadows, spacing, roundness } = useTheme();
    const [subjects, setSubjects] = useState([{ name: '', credits: '3', grade: 'A' }]);
    const [loading, setLoading] = useState(false);

    const addSubject = () => {
        setSubjects([...subjects, { name: '', credits: '3', grade: 'A' }]);
    };

    const removeSubject = (index) => {
        if (subjects.length === 1) {
            setSubjects([{ name: '', credits: '3', grade: 'A' }]);
            return;
        }
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
            const credits = parseFloat(s.credits) || 0;
            totalPoints += points * credits;
            totalCredits += credits;
        });
        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    }, [subjects]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const data = {
                semester: "Current",
                gpa: parseFloat(currentGPA),
                courses: subjects.map(s => ({
                    name: s.name || "Course",
                    credits: parseInt(s.credits) || 0,
                    grade: s.grade
                }))
            };
            const response = await gpaApi.calculate(data);
            if (response.data.success) {
                Alert.alert("Success", "GPA record saved to your profile.");
            } else {
                Alert.alert("Error", response.data.message || "Failed to save.");
            }
        } catch (error) {
            console.error('Save GPA error:', error);
            Alert.alert("Error", "Failed to save GPA record.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }, shadows.sm]}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.background }]}>
                    <ChevronLeft color={colors.text.primary} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>GPA Calculator</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading} style={[styles.saveHeaderBtn, { backgroundColor: colors.primary + '15' }]}>
                    {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Save color={colors.primary} size={22} />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.resultCard, { backgroundColor: colors.secondary }, shadows.lg]}>
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultLabel}>ESTIMATED GPA</Text>
                        <Text style={styles.resultValue}>{currentGPA}</Text>
                    </View>
                    <View style={[styles.gpaIconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <GraduationCap size={44} color="white" />
                    </View>
                </View>

                <View style={[styles.mainCard, { backgroundColor: colors.surface }, shadows.md]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Course Details</Text>
                        <TouchableOpacity onPress={addSubject} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                            <Plus size={18} color="white" />
                            <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {subjects.map((subject, index) => (
                        <View key={index} style={[styles.subjectRow, { borderBottomColor: colors.border, borderBottomWidth: index === subjects.length - 1 ? 0 : 1 }]}>
                            <View style={styles.inputCol}>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary, backgroundColor: isDarkMode ? colors.background : '#F8FAFC' }]}
                                    placeholder="Course"
                                    placeholderTextColor={colors.text.light}
                                    value={subject.name}
                                    onChangeText={(text) => updateSubject(index, 'name', text)}
                                />
                            </View>
                            <View style={styles.creditCol}>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary, backgroundColor: isDarkMode ? colors.background : '#F8FAFC', textAlign: 'center' }]}
                                    placeholder="Cr"
                                    placeholderTextColor={colors.text.light}
                                    keyboardType="numeric"
                                    value={subject.credits}
                                    onChangeText={(text) => updateSubject(index, 'credits', text)}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.gradeCol, { backgroundColor: colors.primary }]}
                                onPress={() => {
                                    const nextGradeIdx = (grades.findIndex(g => g.grade === subject.grade) + 1) % grades.length;
                                    updateSubject(index, 'grade', grades[nextGradeIdx].grade);
                                }}
                            >
                                <Text style={styles.gradeText}>{subject.grade}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeSubject(index)} style={styles.removeBtn}>
                                <Trash2 size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={styles.tipCard}>
                    <Text style={[styles.tipText, { color: colors.text.secondary }]}>
                        💡 Tip: Tap the grade badge to cycle through available grades.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: colors.surface }, shadows.lg]}>
                <TouchableOpacity
                    style={[styles.fullSaveBtn, { backgroundColor: colors.secondary }, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <View style={styles.btnContent}>
                            <Save size={20} color="white" />
                            <Text style={styles.fullSaveBtnText}>Save Record to Profile</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
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
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    saveHeaderBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    resultCard: {
        borderRadius: 30,
        padding: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    resultInfo: {
        flex: 1,
    },
    resultLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    resultValue: {
        color: 'white',
        fontSize: 56,
        fontWeight: '900',
    },
    gpaIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCard: {
        borderRadius: 24,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    addBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        gap: 10,
    },
    inputCol: {
        flex: 3,
    },
    creditCol: {
        flex: 1,
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    gradeCol: {
        width: 45,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradeText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 14,
    },
    removeBtn: {
        padding: 5,
    },
    tipCard: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
    },
    tipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    bottomBar: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    fullSaveBtn: {
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
    },
    fullSaveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    }
});
