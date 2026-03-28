import 'course_model.dart';

class GpaRecordModel {
  final String semester;
  final double gpa;
  final List<CourseModel> courses;

  GpaRecordModel({
    required this.semester,
    required this.gpa,
    required this.courses,
  });

  factory GpaRecordModel.fromJson(Map<String, dynamic> json) {
    return GpaRecordModel(
      semester: json['semester'] ?? '',
      gpa: (json['gpa'] ?? 0.0).toDouble(),
      courses: (json['courses'] as List<dynamic>?)
              ?.map((c) => CourseModel.fromJson(c as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'semester': semester,
      'gpa': gpa,
      'courses': courses.map((c) => c.toJson()).toList(),
    };
  }
}
