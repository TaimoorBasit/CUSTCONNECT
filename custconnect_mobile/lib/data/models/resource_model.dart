class ResourceModel {
  final String id;
  final String title;
  final String? courseCode;
  final int? fileSize;
  final String? createdAt;

  ResourceModel({
    required this.id,
    required this.title,
    this.courseCode,
    this.fileSize,
    this.createdAt,
  });

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    return ResourceModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      courseCode: json['courseCode'],
      fileSize: json['fileSize'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'courseCode': courseCode,
      'fileSize': fileSize,
      'createdAt': createdAt,
    };
  }
}
