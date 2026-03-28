import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/gpa_record_model.dart';

class GpaRepository {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<bool> calculateAndSave(Map<String, dynamic> data) async {
    final List subjects = data['subjects'] as List;
    final String semester = data['semester'];
    final int year = data['year'];
    final String userId = _supabase.auth.currentUser!.id;

    // GPA Calculation Logic mirroring the backend
    final Map<String, double> gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    double totalQualityPoints = 0;
    int totalCredits = 0;

    for (var sub in subjects) {
      final credits = sub['credits'] as int;
      final grade = sub['grade'] as String;
      final points = gradePoints[grade] ?? 0.0;
      totalQualityPoints += (points * credits);
      totalCredits += credits;
    }

    final double currentGpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0.0;

    // Get previous record for CGPA
    final previousResponse = await _supabase
        .from('gpa_records')
        .select('cgpa, credits')
        .eq('userId', userId)
        .order('createdAt', ascending: false)
        .limit(1)
        .maybeSingle();

    double newCgpa = currentGpa;
    if (previousResponse != null) {
      final double prevCgpa = (previousResponse['cgpa'] as num).toDouble();
      final int prevCredits = previousResponse['credits'] as int;
      newCgpa = ((prevCgpa * prevCredits) + (currentGpa * totalCredits)) / (prevCredits + totalCredits);
    }

    // Save to Supabase
    final response = await _supabase.from('gpa_records').insert({
      'userId': userId,
      'semester': semester,
      'year': year,
      'gpa': currentGpa,
      'cgpa': newCgpa,
      'credits': totalCredits,
    }).select().single();

    // Also save subject details if your table supports it (JSON or separate table)
    // For now, assuming successful header insert
    return response != null;
  }

  Future<List<GpaRecordModel>> getHistory() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return [];

    final response = await _supabase
        .from('gpa_records')
        .select()
        .eq('userId', userId)
        .order('createdAt', ascending: false);

    return (response as List).map((e) => GpaRecordModel.fromJson(e)).toList();
  }

  Future<double> getCurrent() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return 0.0;

    final response = await _supabase
        .from('gpa_records')
        .select('cgpa')
        .eq('userId', userId)
        .order('createdAt', ascending: false)
        .limit(1)
        .maybeSingle();

    return (response?['cgpa'] as num? ?? 0.0).toDouble();
  }
}
