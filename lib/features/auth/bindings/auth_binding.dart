import 'package:get/get.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/features/auth/controllers/login_controller.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<LoginController>(
      () => LoginController(
        Get.find<AuthRepository>(),
        Get.find<SessionService>(),
      ),
    );
  }
}
