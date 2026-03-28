import { supabase } from '@/lib/supabaseClient';

export interface GPASubject {
    name: string;
    code: string;
    credits: number;
    grade: string;
    gpa?: number;
}

export interface GPARecord {
    id: string;
    semester: string;
    year: string;
    gpa: number;
    cgpa: number;
    credits: number;
    createdAt: string;
}

export const gpaService = {
    calculateGPA: async (data: { subjects: GPASubject[]; semester: string; year: string }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Logic from your Express backend moved to client:
        const gradePoints: { [key: string]: number } = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
        };

        let totalQualityPoints = 0;
        let semesterCredits = 0;
        const subjectsWithGPA = data.subjects.map(sub => {
            const points = gradePoints[sub.grade] || 0;
            totalQualityPoints += (points * sub.credits);
            semesterCredits += sub.credits;
            return { ...sub, gpa: points };
        });

        const currentGPA = semesterCredits > 0 ? (totalQualityPoints / semesterCredits) : 0;

        // Fetch prev CGPA from Supabase
        const { data: latestRecord } = await supabase
            .from('gpa_records')
            .select('cgpa, credits')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })
            .limit(1)
            .maybeSingle();

        let newCGPA = currentGPA;
        if (latestRecord) {
            const prevCGPA = latestRecord.cgpa || 0;
            const prevCredits = latestRecord.credits || 0;
            newCGPA = ((prevCGPA * prevCredits) + (currentGPA * semesterCredits)) / (prevCredits + semesterCredits);
        }

        const { data: record, error } = await supabase.from('gpa_records').insert({
            userId: user.id,
            semester: data.semester,
            year: data.year,
            gpa: currentGPA,
            cgpa: newCGPA,
            credits: semesterCredits,
            // You can store subjects in a JSON column or separate table
            subjects: subjectsWithGPA 
        }).select().single();

        if (error) throw error;
        return { success: true, data: record };
    },

    getHistory: async (page = 1, limit = 10) => {
        const { data: { user } } = await supabase.auth.getUser();
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, count, error } = await supabase
            .from('gpa_records')
            .select('*', { count: 'exact' })
            .eq('userId', user?.id)
            .order('createdAt', { ascending: false })
            .range(start, end);

        if (error) throw error;
        return { success: true, data: data, total: count };
    },

    getCurrentStatus: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
            .from('gpa_records')
            .select('cgpa, credits, semester, year')
            .eq('userId', user?.id)
            .order('createdAt', { ascending: false })
            .limit(1)
            .maybeSingle();

        return { success: true, data: data || { cgpa: 0, credits: 0 } };
    },

    getTips: async () => {
        // Static tips previously in backend
        return {
            success: true,
            tips: [
                { title: "Attend Classes", description: "Regular attendance is key.", category: "Habits" },
                { title: "Take Notes", description: "Detailed notes help retention.", category: "Habits" }
            ]
        };
    },

    deleteRecord: async (id: string) => {
        const { error } = await supabase.from('gpa_records').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },
};
