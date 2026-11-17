enum UserRole {
  admin,
  staff;

  static UserRole parse(String value) {
    return UserRole.values.firstWhere(
      (role) => role.name == value,
      orElse: () => UserRole.staff,
    );
  }
}
