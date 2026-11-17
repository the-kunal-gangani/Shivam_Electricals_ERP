import 'package:get/get.dart';
import 'package:shivam_electricals/app/middleware/auth_middleware.dart';
import 'package:shivam_electricals/app/middleware/role_middleware.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/session/user_role.dart';
import 'package:shivam_electricals/features/auth/bindings/auth_binding.dart';
import 'package:shivam_electricals/features/auth/views/login_view.dart';
import 'package:shivam_electricals/features/dashboard/bindings/dashboard_binding.dart';
import 'package:shivam_electricals/features/dashboard/views/admin_home_view.dart';
import 'package:shivam_electricals/features/dashboard/views/staff_home_view.dart';
import 'package:shivam_electricals/features/splash/bindings/splash_binding.dart';
import 'package:shivam_electricals/features/splash/views/splash_view.dart';

class AppPages {
  static final List<GetPage<dynamic>> pages = [
    GetPage<dynamic>(
      name: AppRoutes.splash,
      page: () => const SplashView(),
      binding: SplashBinding(),
    ),
    GetPage<dynamic>(
      name: AppRoutes.login,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage<dynamic>(
      name: AppRoutes.adminHome,
      page: () => const AdminHomeView(),
      binding: DashboardBinding(),
      middlewares: [AuthMiddleware(), RoleMiddleware(UserRole.admin)],
    ),
    GetPage<dynamic>(
      name: AppRoutes.staffHome,
      page: () => const StaffHomeView(),
      binding: DashboardBinding(),
      middlewares: [AuthMiddleware(), RoleMiddleware(UserRole.staff)],
    ),
  ];
}
