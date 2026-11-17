import 'user_role.dart';

class AuthUser {
  const AuthUser({
    required this.id,
    required this.name,
    required this.role,
    required this.storeIds,
    required this.permissions,
    this.email,
    this.phone,
  });

  final String id;
  final String name;
  final String? email;
  final String? phone;
  final UserRole role;
  final List<String> storeIds;
  final List<String> permissions;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      role: UserRole.parse(json['role'] as String),
      storeIds: List<String>.from(json['storeIds'] as List? ?? const []),
      permissions: List<String>.from(json['permissions'] as List? ?? const []),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'role': role.name,
    'storeIds': storeIds,
    'permissions': permissions,
  };
}
