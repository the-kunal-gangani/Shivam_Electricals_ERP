import 'package:shivam_electricals/core/session/user_role.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String adminHome = '/admin';
  static const String staffHome = '/staff';

  static String homeFor(UserRole? role) {
    return switch (role) {
      UserRole.admin => adminHome,
      UserRole.staff => staffHome,
      null => login,
    };
  }
}
