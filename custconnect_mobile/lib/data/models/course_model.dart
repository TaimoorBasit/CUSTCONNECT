class CourseModel {
  final String name;
  final int credits;
  final String grade;

  CourseModel({
    required this.name,
    required this.credits,
    required this.grade,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      name: json['name'] ?? '',
      credits: json['credits'] ?? 0,
      grade: json['grade'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'credits': credits,
      'grade': grade,
    };
  }
}
