import 'package:get/get.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';
import 'package:shivam_electricals/features/splash/controllers/splash_controller.dart';

class SplashBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SplashController>(
      () => SplashController(
        Get.find<SessionService>(),
        Get.find<AuthRepository>(),
      ),
    );
  }
}
