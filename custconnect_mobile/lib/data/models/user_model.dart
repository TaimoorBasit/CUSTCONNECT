class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final bool isVerified;
  final List<String> roles;

  const UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.isVerified,
    required this.roles,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final rolesList = json['roles'] as List<dynamic>? ?? [];
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      isVerified: json['isVerified'] ?? false,
      roles: rolesList.map((e) => e['name']?.toString() ?? '').toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'firstName': firstName,
    'lastName': lastName,
    'isVerified': isVerified,
    'roles': roles.map((e) => {'name': e}).toList(),
  };
}
