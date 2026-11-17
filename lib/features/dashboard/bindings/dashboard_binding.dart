import 'package:get/get.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';
import 'package:shivam_electricals/features/dashboard/controllers/dashboard_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(
      () => DashboardController(
        Get.find<SessionService>(),
        Get.find<AuthRepository>(),
      ),
    );
  }
}
