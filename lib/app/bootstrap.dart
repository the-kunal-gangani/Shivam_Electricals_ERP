import 'package:get/get.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/network/api_client.dart';
import 'package:shivam_electricals/core/session/auth_user.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/core/storage/secure_storage_service.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';

class Bootstrap {
  static Future<void> init() async {
    final storage = Get.put(SecureStorageService(), permanent: true);
    final session = Get.put(SessionService(storage), permanent: true);
    await session.restore();

    final api = Get.put(ApiClient(session), permanent: true);
    Get.put(AuthRepository(api), permanent: true);

    // Keep route handling centralized when a session expires or is cleared.
    ever<AuthUser?>(session.user, (user) {
      if (user == null) Get.offAllNamed(AppRoutes.login);
    });
  }
}
